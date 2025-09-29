use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;
use anchor_lang::solana_program::clock::Clock;
use anchor_lang::solana_program::system_instruction;

declare_id!("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

// Inactivity period for inheritance claims. Default: 365 days. With
// feature `short-claim-delay`, use 2 days for testing.
#[cfg(feature = "short-claim-delay")]
const INACTIVITY_PERIOD_SECONDS: i64 = 2 * 24 * 60 * 60; // 2 days
#[cfg(not(feature = "short-claim-delay"))]
const INACTIVITY_PERIOD_SECONDS: i64 = 365 * 24 * 60 * 60; // 365 days

#[program]
pub mod gada {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Gada program initialized!");
        Ok(())
    }

    pub fn add_token_heir(ctx: Context<AddTokenHeir>, amount: u64, inactivity_period_seconds: i64) -> Result<()> {
        require!(inactivity_period_seconds > 0, ErrorCode::InvalidInactivityPeriod);

        // Validate owner's token account
        require_keys_eq!(ctx.accounts.owner_token_account.mint, ctx.accounts.token_mint.key(), ErrorCode::InvalidMint);
        require_keys_eq!(ctx.accounts.owner_token_account.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);

        // Initialize state
        let token_heir = &mut ctx.accounts.token_heir;
        token_heir.owner = *ctx.accounts.owner.key;
        token_heir.heir = *ctx.accounts.heir.key;
        token_heir.token_mint = ctx.accounts.token_mint.key();
        token_heir.amount = amount;
        token_heir.last_active_time = Clock::get()?.unix_timestamp;
        token_heir.is_claimed = false;
        token_heir.inactivity_period_seconds = inactivity_period_seconds;
        token_heir.bump = ctx.bumps.token_heir;

        // Escrow: transfer tokens from owner to PDA-owned ATA (escrow)
        let cpi_accounts = Transfer {
            from: ctx.accounts.owner_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        msg!(
            "Token heir added and escrow funded: {} tokens, inactivity {}s",
            amount,
            inactivity_period_seconds
        );
        Ok(())
    }

    pub fn add_coin_heir(ctx: Context<AddCoinHeir>, amount: u64, inactivity_period_seconds: i64) -> Result<()> {
        require!(inactivity_period_seconds > 0, ErrorCode::InvalidInactivityPeriod);
        let coin_heir = &mut ctx.accounts.coin_heir;
        coin_heir.owner = *ctx.accounts.owner.key;
        coin_heir.heir = *ctx.accounts.heir.key;
        coin_heir.amount = amount;
        coin_heir.last_active_time = Clock::get()?.unix_timestamp;
        coin_heir.is_claimed = false;
        coin_heir.inactivity_period_seconds = inactivity_period_seconds;
        coin_heir.bump = ctx.bumps.coin_heir;
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.owner.key(),
            &coin_heir.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.owner.to_account_info(),
                coin_heir.to_account_info(),
            ],
        )?;
        msg!("Coin heir added: {} lamports, inactivity {}s", amount, inactivity_period_seconds);
        Ok(())
    }

    pub fn update_activity(ctx: Context<UpdateActivity>) -> Result<()> {
        let token_heir = &mut ctx.accounts.token_heir;
        require_keys_eq!(token_heir.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);
        token_heir.last_active_time = Clock::get()?.unix_timestamp;
        msg!("Activity updated");
        Ok(())
    }

    pub fn update_coin_activity(ctx: Context<UpdateCoinActivity>) -> Result<()> {
        let coin_heir = &mut ctx.accounts.coin_heir;
        require_keys_eq!(coin_heir.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);
        coin_heir.last_active_time = Clock::get()?.unix_timestamp;
        msg!("Coin activity updated");
        Ok(())
    }

    pub fn batch_transfer_tokens<'info>(
        ctx: Context<'_, '_, '_, 'info, BatchTransferTokens<'info>>, 
        recipients: Vec<Pubkey>,
        amounts: Vec<u64>
    ) -> Result<()> {
        require!(recipients.len() <= 10, ErrorCode::TooManyTransfers);
        require!(recipients.len() == amounts.len(), ErrorCode::MismatchedArrays);
        
        // Ensure authority is owner of `from_token_account`
        require_keys_eq!(ctx.accounts.from_token_account.owner, ctx.accounts.authority.key(), ErrorCode::Unauthorized);
        
        for (i, (&amount, &recipient)) in amounts.iter().zip(recipients.iter()).enumerate() {
            if amount > 0 {
                // Find the corresponding token account for this recipient
                let remaining_accounts = &ctx.remaining_accounts;
                if i >= remaining_accounts.len() {
                    return Err(ErrorCode::InsufficientAccounts.into());
                }
                
                let to_token_account = &remaining_accounts[i];
                
                // Ensure token account mints match
                let to_token_account_data = TokenAccount::try_deserialize(&mut to_token_account.data.borrow().as_ref())?;
                require_keys_eq!(ctx.accounts.from_token_account.mint, to_token_account_data.mint, ErrorCode::InvalidMint);
                require_keys_eq!(to_token_account_data.owner, recipient, ErrorCode::Unauthorized);
                
                // Use the transfer instruction directly
                let transfer_ix = anchor_spl::token::spl_token::instruction::transfer(
                    &ctx.accounts.token_program.key(),
                    &ctx.accounts.from_token_account.key(),
                    &to_token_account.key(),
                    &ctx.accounts.authority.key(),
                    &[],
                    amount,
                )?;
                
                // Use the transfer instruction directly with proper lifetime management
                anchor_lang::solana_program::program::invoke(
                    &transfer_ix,
                    &[
                        ctx.accounts.from_token_account.to_account_info(),
                        to_token_account.to_account_info(),
                        ctx.accounts.authority.to_account_info(),
                        ctx.accounts.token_program.to_account_info(),
                    ],
                )?;
                
                msg!("Transfer {}: {} tokens to {}", i + 1, amount, recipient);
            }
        }
        Ok(())
    }

    pub fn batch_transfer_coins<'info>(
        ctx: Context<'_, '_, '_, 'info, BatchTransferCoins<'info>>, 
        recipients: Vec<Pubkey>,
        amounts: Vec<u64>
    ) -> Result<()> {
        require!(recipients.len() <= 10, ErrorCode::TooManyTransfers);
        require!(recipients.len() == amounts.len(), ErrorCode::MismatchedArrays);
        
        for (i, (&amount, &recipient)) in amounts.iter().zip(recipients.iter()).enumerate() {
            if amount > 0 {
                // Find the corresponding account for this recipient
                let remaining_accounts = &ctx.remaining_accounts;
                if i >= remaining_accounts.len() {
                    return Err(ErrorCode::InsufficientAccounts.into());
                }
                
                let to_account = &remaining_accounts[i];
                require_keys_eq!(to_account.key(), recipient, ErrorCode::Unauthorized);
                
                let ix = anchor_lang::solana_program::system_instruction::transfer(
                    &ctx.accounts.from_account.key(),
                    &to_account.key(),
                    amount,
                );
                
                // Use the transfer instruction directly with proper lifetime management
                anchor_lang::solana_program::program::invoke(
                    &ix,
                    &[
                        ctx.accounts.from_account.to_account_info(),
                        to_account.to_account_info(),
                    ],
                )?;
                msg!("Transfer {}: {} lamports to {}", i + 1, amount, recipient);
            }
        }
        Ok(())
    }

    pub fn claim_heir_token_assets(ctx: Context<ClaimHeirTokenAssets>) -> Result<()> {
        let current_timestamp = Clock::get()?.unix_timestamp;

        // First, do all the validation checks without borrowing mutably
        require!(!ctx.accounts.token_heir.is_claimed, ErrorCode::AlreadyClaimed);
        require!(
            current_timestamp - ctx.accounts.token_heir.last_active_time > ctx.accounts.token_heir.inactivity_period_seconds,
            ErrorCode::OwnerStillActive
        );
        // Ensure the signer is the recorded heir
        require_keys_eq!(ctx.accounts.heir.key(), ctx.accounts.token_heir.heir, ErrorCode::Unauthorized);
        // Validate token accounts
        require_keys_eq!(ctx.accounts.heir_token_account.owner, ctx.accounts.heir.key(), ErrorCode::Unauthorized);
        require_keys_eq!(ctx.accounts.heir_token_account.mint, ctx.accounts.token_heir.token_mint, ErrorCode::InvalidMint);
        require_keys_eq!(ctx.accounts.escrow_token_account.mint, ctx.accounts.token_heir.token_mint, ErrorCode::InvalidMint);
        require_keys_eq!(ctx.accounts.escrow_token_account.owner, ctx.accounts.token_heir.key(), ErrorCode::Unauthorized);

        // Store the token_heir key before mutable borrow
        let _token_heir_key = ctx.accounts.token_heir.key();
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.heir_token_account.to_account_info(),
            authority: ctx.accounts.token_heir.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_signer_seeds: &[&[&[u8]]] = &[&[
            b"token_heir",
            ctx.accounts.token_heir.owner.as_ref(),
            ctx.accounts.token_heir.heir.as_ref(),
            ctx.accounts.token_heir.token_mint.as_ref(),
            &[ctx.accounts.token_heir.bump],
        ]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, cpi_signer_seeds);
        
        token::transfer(cpi_ctx, ctx.accounts.token_heir.amount)?;

        // Now do the mutable borrow and update state
        let token_heir = &mut ctx.accounts.token_heir;
        token_heir.is_claimed = true;

        Ok(())
    }

    pub fn claim_heir_coin_assets(ctx: Context<ClaimHeirCoinAssets>) -> Result<()> {
        let coin_heir = &mut ctx.accounts.coin_heir;
        let current_timestamp = Clock::get()?.unix_timestamp;

        require!(!coin_heir.is_claimed, ErrorCode::AlreadyClaimed);
        require!(
            current_timestamp - coin_heir.last_active_time > coin_heir.inactivity_period_seconds,
            ErrorCode::OwnerStillActive
        );
        // Ensure the signer is the recorded heir and provided owner matches
        require_keys_eq!(ctx.accounts.heir_account.key(), coin_heir.heir, ErrorCode::Unauthorized);
        require_keys_eq!(ctx.accounts.owner_account.key(), coin_heir.owner, ErrorCode::Unauthorized);

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &coin_heir.key(),
            &ctx.accounts.heir_account.key(),
            coin_heir.amount,
        );
        let seeds = &[
            b"coin_heir",
            coin_heir.owner.as_ref(),
            coin_heir.heir.as_ref(),
            &[coin_heir.bump],
        ];
        anchor_lang::solana_program::program::invoke_signed(
            &ix,
            &[
                coin_heir.to_account_info(),
                ctx.accounts.heir_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[seeds],
        )?;
        
        coin_heir.is_claimed = true;
        msg!("Coin inheritance claimed: {}", coin_heir.amount);
        
        Ok(())
    }

    // ===============================================
    // SMART WALLET INHERITANCE MODEL (NEW)
    // ===============================================

    /// Creates a Smart Wallet inheritance setup with PDA wallet ownership
    pub fn create_smart_wallet_inheritance(
        ctx: Context<CreateSmartWalletInheritance>,
        heirs: Vec<HeirData>,
        inactivity_period_seconds: i64
    ) -> Result<()> {
        require!(inactivity_period_seconds > 0, ErrorCode::InvalidInactivityPeriod);
        require!(heirs.len() <= 10, ErrorCode::TooManyHeirs);
        require!(!heirs.is_empty(), ErrorCode::NoHeirsProvided);

        // Validate heir allocation percentages sum to 100
        let total_allocation: u8 = heirs.iter().map(|h| h.allocation_percentage).sum();
        require!(total_allocation == 100, ErrorCode::InvalidAllocation);

        let smart_wallet = &mut ctx.accounts.smart_wallet;
        smart_wallet.owner = ctx.accounts.owner.key();
        smart_wallet.heirs = heirs;
        smart_wallet.inactivity_period_seconds = inactivity_period_seconds;
        smart_wallet.last_active_time = Clock::get()?.unix_timestamp;
        smart_wallet.is_executed = false;
        smart_wallet.bump = ctx.bumps.smart_wallet;

        msg!(
            "Smart Wallet inheritance created for owner: {}, heirs: {}, inactivity: {}s",
            ctx.accounts.owner.key(),
            smart_wallet.heirs.len(),
            inactivity_period_seconds
        );

        Ok(())
    }

    /// Updates activity timestamp for Smart Wallet owner
    pub fn update_smart_wallet_activity(ctx: Context<UpdateSmartWalletActivity>) -> Result<()> {
        let smart_wallet = &mut ctx.accounts.smart_wallet;
        require_keys_eq!(smart_wallet.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);
        
        smart_wallet.last_active_time = Clock::get()?.unix_timestamp;
        msg!("Smart Wallet activity updated for owner: {}", ctx.accounts.owner.key());
        
        Ok(())
    }

    /// Executes inheritance by transferring all Smart Wallet assets to heirs
    /// Called by keepers/bots when owner is inactive past threshold
    pub fn execute_inheritance(ctx: Context<ExecuteInheritance>) -> Result<()> {
        let smart_wallet = &mut ctx.accounts.smart_wallet;
        let current_timestamp = Clock::get()?.unix_timestamp;

        // Validate inheritance conditions
        require!(!smart_wallet.is_executed, ErrorCode::AlreadyExecuted);
        require!(
            current_timestamp - smart_wallet.last_active_time > smart_wallet.inactivity_period_seconds,
            ErrorCode::OwnerStillActive
        );

        let wallet_balance = ctx.accounts.smart_wallet_pda.lamports();
        
        // Execute SOL inheritance distribution
        if wallet_balance > 0 {
            for heir_data in &smart_wallet.heirs {
                let heir_amount = (wallet_balance as u128 * heir_data.allocation_percentage as u128 / 100) as u64;
                
                if heir_amount > 0 {
                    // Transfer SOL from Smart Wallet PDA to heir
                    let transfer_ix = system_instruction::transfer(
                        &ctx.accounts.smart_wallet_pda.key(),
                        &heir_data.heir_pubkey,
                        heir_amount,
                    );

                    let seeds = &[
                        b"smart_wallet",
                        smart_wallet.owner.as_ref(),
                        &[smart_wallet.bump],
                    ];

                    anchor_lang::solana_program::program::invoke_signed(
                        &transfer_ix,
                        &[
                            ctx.accounts.smart_wallet_pda.to_account_info(),
                            ctx.accounts.system_program.to_account_info(),
                        ],
                        &[seeds],
                    )?;

                    msg!(
                        "Inherited {} SOL ({}%) to heir: {}",
                        heir_amount,
                        heir_data.allocation_percentage,
                        heir_data.heir_pubkey
                    );
                }
            }
        }

        smart_wallet.is_executed = true;
        msg!("Smart Wallet inheritance executed for owner: {}", smart_wallet.owner);

        Ok(())
    }

    /// Deposits SOL into the Smart Wallet PDA
    pub fn deposit_to_smart_wallet(ctx: Context<DepositToSmartWallet>, amount: u64) -> Result<()> {
        let smart_wallet = &ctx.accounts.smart_wallet;
        require_keys_eq!(smart_wallet.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);

        // Transfer SOL from owner to Smart Wallet PDA
        let transfer_ix = system_instruction::transfer(
            &ctx.accounts.owner.key(),
            &ctx.accounts.smart_wallet_pda.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.smart_wallet_pda.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        msg!(
            "Deposited {} SOL to Smart Wallet PDA: {}",
            amount,
            ctx.accounts.smart_wallet_pda.key()
        );

        Ok(())
    }

    /// Deposits SPL tokens into the Smart Wallet PDA
    pub fn deposit_tokens_to_smart_wallet(
        ctx: Context<DepositTokensToSmartWallet>,
        amount: u64
    ) -> Result<()> {
        let smart_wallet = &ctx.accounts.smart_wallet;
        require_keys_eq!(smart_wallet.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);

        // Validate token accounts
        require_keys_eq!(ctx.accounts.owner_token_account.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);
        require_keys_eq!(ctx.accounts.owner_token_account.mint, ctx.accounts.token_mint.key(), ErrorCode::InvalidMint);
        require_keys_eq!(ctx.accounts.smart_wallet_token_account.mint, ctx.accounts.token_mint.key(), ErrorCode::InvalidMint);

        // Transfer tokens from owner to Smart Wallet PDA token account
        let cpi_accounts = Transfer {
            from: ctx.accounts.owner_token_account.to_account_info(),
            to: ctx.accounts.smart_wallet_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        msg!(
            "Deposited {} tokens to Smart Wallet PDA token account",
            amount
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct AddTokenHeir<'info> {
    #[account(
        init, 
        payer = owner, 
        space = TokenHeir::SPACE,
        seeds = [b"token_heir", owner.key().as_ref(), heir.key().as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub token_heir: Account<'info, TokenHeir>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: This is just a pubkey for the heir
    pub heir: AccountInfo<'info>,
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = token_mint,
        associated_token::authority = token_heir
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddCoinHeir<'info> {
    #[account(
        init, 
        payer = owner, 
        space = CoinHeir::SPACE,
        seeds = [b"coin_heir", owner.key().as_ref(), heir.key().as_ref()],
        bump
    )]
    pub coin_heir: Account<'info, CoinHeir>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: This is just a pubkey for the heir
    pub heir: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateActivity<'info> {
    #[account(mut, has_one = owner)]
    pub token_heir: Account<'info, TokenHeir>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateCoinActivity<'info> {
    #[account(mut, has_one = owner)]
    pub coin_heir: Account<'info, CoinHeir>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct BatchTransferTokens<'info> {
    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BatchTransferCoins<'info> {
    #[account(mut)]
    pub from_account: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimHeirTokenAssets<'info> {
    #[account(mut)]
    pub token_heir: Account<'info, TokenHeir>,
    /// CHECK: This is the heir who must be a signer
    pub heir: Signer<'info>,
    #[account(mut)]
    pub heir_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimHeirCoinAssets<'info> {
    #[account(
        mut,
        seeds = [b"coin_heir", owner_account.key().as_ref(), heir_account.key().as_ref()],
        bump = coin_heir.bump
    )]
    pub coin_heir: Account<'info, CoinHeir>,
    /// CHECK: This is the owner account
    pub owner_account: AccountInfo<'info>,
    /// CHECK: This is the heir who must be a signer
    #[account(mut)]
    pub heir_account: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// ===============================================
// SMART WALLET INHERITANCE ACCOUNTS (NEW)
// ===============================================

#[derive(Accounts)]
pub struct CreateSmartWalletInheritance<'info> {
    #[account(
        init,
        payer = owner,
        space = SmartWallet::SPACE,
        seeds = [b"smart_wallet", owner.key().as_ref()],
        bump
    )]
    pub smart_wallet: Account<'info, SmartWallet>,
    
    /// CHECK: Smart Wallet PDA that will hold the assets
    #[account(
        mut,
        seeds = [b"smart_wallet_pda", owner.key().as_ref()],
        bump
    )]
    pub smart_wallet_pda: AccountInfo<'info>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateSmartWalletActivity<'info> {
    #[account(
        mut,
        seeds = [b"smart_wallet", owner.key().as_ref()],
        bump = smart_wallet.bump
    )]
    pub smart_wallet: Account<'info, SmartWallet>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteInheritance<'info> {
    #[account(
        mut,
        seeds = [b"smart_wallet", smart_wallet.owner.as_ref()],
        bump = smart_wallet.bump
    )]
    pub smart_wallet: Account<'info, SmartWallet>,
    
    /// CHECK: Smart Wallet PDA that holds the assets
    #[account(
        mut,
        seeds = [b"smart_wallet_pda", smart_wallet.owner.as_ref()],
        bump
    )]
    pub smart_wallet_pda: AccountInfo<'info>,
    
    /// CHECK: Can be called by anyone (keeper/bot)
    pub caller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositToSmartWallet<'info> {
    #[account(
        seeds = [b"smart_wallet", owner.key().as_ref()],
        bump = smart_wallet.bump
    )]
    pub smart_wallet: Account<'info, SmartWallet>,
    
    /// CHECK: Smart Wallet PDA that will receive the deposit
    #[account(
        mut,
        seeds = [b"smart_wallet_pda", owner.key().as_ref()],
        bump
    )]
    pub smart_wallet_pda: AccountInfo<'info>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositTokensToSmartWallet<'info> {
    #[account(
        seeds = [b"smart_wallet", owner.key().as_ref()],
        bump = smart_wallet.bump
    )]
    pub smart_wallet: Account<'info, SmartWallet>,
    
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = token_mint,
        associated_token::authority = smart_wallet_pda
    )]
    pub smart_wallet_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Smart Wallet PDA that will own the token account
    #[account(
        seeds = [b"smart_wallet_pda", owner.key().as_ref()],
        bump
    )]
    pub smart_wallet_pda: AccountInfo<'info>,
    
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct TokenHeir {
    pub owner: Pubkey,
    pub heir: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub last_active_time: i64,
    pub is_claimed: bool,
    pub inactivity_period_seconds: i64,
    pub bump: u8,
}

impl TokenHeir {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 8 + 1;
}

#[account]
pub struct CoinHeir {
    pub owner: Pubkey,
    pub heir: Pubkey,
    pub amount: u64,
    pub last_active_time: i64,
    pub is_claimed: bool,
    pub inactivity_period_seconds: i64,
    pub bump: u8,
}

impl CoinHeir {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 1 + 8 + 1;
}

// ===============================================
// SMART WALLET INHERITANCE DATA STRUCTURES (NEW)
// ===============================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct HeirData {
    pub heir_pubkey: Pubkey,
    pub allocation_percentage: u8, // Percentage of inheritance (1-100)
}

#[account]
pub struct SmartWallet {
    pub owner: Pubkey,
    pub heirs: Vec<HeirData>,
    pub inactivity_period_seconds: i64,
    pub last_active_time: i64,
    pub is_executed: bool,
    pub bump: u8,
}

impl SmartWallet {
    // Account size calculation:
    // 8 (discriminator) + 32 (owner) + 4 (vec length) + (32 + 1) * 10 (max heirs) 
    // + 8 (inactivity_period) + 8 (last_active_time) + 1 (is_executed) + 1 (bump)
    pub const SPACE: usize = 8 + 32 + 4 + (32 + 1) * 10 + 8 + 8 + 1 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Owner is still active.")]
    OwnerStillActive,
    #[msg("Assets have already been claimed.")]
    AlreadyClaimed,
    #[msg("Too many transfers in batch (max 10).")]
    TooManyTransfers,
    #[msg("Unauthorized operation.")]
    Unauthorized,
    #[msg("Invalid token mint.")]
    InvalidMint,
    #[msg("Invalid inactivity period.")]
    InvalidInactivityPeriod,
    #[msg("Recipients and amounts arrays must have the same length.")]
    MismatchedArrays,
    #[msg("Insufficient accounts provided for batch transfer.")]
    InsufficientAccounts,
    // Smart Wallet specific errors
    #[msg("Too many heirs (max 10).")]
    TooManyHeirs,
    #[msg("No heirs provided.")]
    NoHeirsProvided,
    #[msg("Heir allocation percentages must sum to 100.")]
    InvalidAllocation,
    #[msg("Inheritance has already been executed.")]
    AlreadyExecuted,
}