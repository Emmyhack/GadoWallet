use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;
use anchor_lang::solana_program::clock::Clock;

declare_id!("8N4Mjyw7ThUFdkJ1LbrAnCzfxSpxknqCZhkGHDCcaMRE");

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

    pub fn batch_transfer_tokens(
        ctx: Context<BatchTransferTokens>, 
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

    pub fn batch_transfer_coins(
        ctx: Context<BatchTransferCoins>, 
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
        let token_heir = &mut ctx.accounts.token_heir;
        let current_timestamp = Clock::get()?.unix_timestamp;

        require!(!token_heir.is_claimed, ErrorCode::AlreadyClaimed);
        require!(
            current_timestamp - token_heir.last_active_time > token_heir.inactivity_period_seconds,
            ErrorCode::OwnerStillActive
        );
        // Ensure the signer is the recorded heir
        require_keys_eq!(ctx.accounts.heir.key(), token_heir.heir, ErrorCode::Unauthorized);
        // Validate token accounts
        require_keys_eq!(ctx.accounts.heir_token_account.owner, ctx.accounts.heir.key(), ErrorCode::Unauthorized);
        require_keys_eq!(ctx.accounts.heir_token_account.mint, token_heir.token_mint, ErrorCode::InvalidMint);
        require_keys_eq!(ctx.accounts.escrow_token_account.mint, token_heir.token_mint, ErrorCode::InvalidMint);
        require_keys_eq!(ctx.accounts.escrow_token_account.owner, ctx.accounts.token_heir.key(), ErrorCode::Unauthorized);

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.heir_token_account.to_account_info(),
            authority: ctx.accounts.token_heir.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();

        let seeds = &[
            b"token_heir",
            token_heir.owner.as_ref(),
            token_heir.heir.as_ref(),
            token_heir.token_mint.as_ref(),
            &[token_heir.bump],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, token_heir.amount)?;
        
        token_heir.is_claimed = true;
        msg!("Token inheritance claimed: {}", token_heir.amount);
        
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
}