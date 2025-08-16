use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Transfer, Mint};
use anchor_lang::solana_program::clock::Clock;

declare_id!("Gf4b24oCZ6xGdVj5HyKfDBZKrd3JUuhQ87ApMAyg87t5");

// Inactivity period for inheritance claims. Default: 365 days. With
// feature `short-claim-delay`, use 2 days for testing.
#[cfg(feature = "short-claim-delay")]
const INACTIVITY_PERIOD_SECONDS: i64 = 2 * 24 * 60 * 60; // 2 days
#[cfg(not(feature = "short-claim-delay"))]
const INACTIVITY_PERIOD_SECONDS: i64 = 365 * 24 * 60 * 60; // 365 days

#[program]
pub mod gada {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Gada program initialized!");
        Ok(())
    }

    pub fn add_token_heir(ctx: Context<AddTokenHeir>, amount: u64, inactivity_period_seconds: i64) -> Result<()> {
        require!(inactivity_period_seconds > 0, ErrorCode::InvalidInactivityPeriod);
        let token_heir = &mut ctx.accounts.token_heir;
        token_heir.owner = *ctx.accounts.owner.key;
        token_heir.heir = *ctx.accounts.heir.key;
        token_heir.token_mint = ctx.accounts.token_mint.key();
        token_heir.amount = amount;
        token_heir.last_active_time = Clock::get()?.unix_timestamp;
        token_heir.is_claimed = false;
        token_heir.inactivity_period_seconds = inactivity_period_seconds;
        token_heir.bump = ctx.bumps.token_heir;
        msg!("Token heir added: {} tokens, inactivity {}s", amount, inactivity_period_seconds);
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
        amounts: Vec<u64>
    ) -> Result<()> {
        require!(amounts.len() <= 10, ErrorCode::TooManyTransfers);
        // Ensure authority is owner of `from_token_account`
        require_keys_eq!(ctx.accounts.from_token_account.owner, ctx.accounts.authority.key(), ErrorCode::Unauthorized);
        // Ensure token account mints match
        require_keys_eq!(ctx.accounts.from_token_account.mint, ctx.accounts.to_token_account.mint, ErrorCode::InvalidMint);
        
        for (i, &amount) in amounts.iter().enumerate() {
            if amount > 0 {
                let cpi_accounts = Transfer {
                    from: ctx.accounts.from_token_account.to_account_info(),
                    to: ctx.accounts.to_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                };
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
                
                token::transfer(cpi_ctx, amount)?;
                msg!("Transfer {}: {} tokens", i + 1, amount);
            }
        }
        Ok(())
    }

    pub fn batch_transfer_coins(
        ctx: Context<BatchTransferCoins>, 
        amounts: Vec<u64>
    ) -> Result<()> {
        require!(amounts.len() <= 10, ErrorCode::TooManyTransfers);
        
        for (i, &amount) in amounts.iter().enumerate() {
            if amount > 0 {
                let ix = anchor_lang::solana_program::system_instruction::transfer(
                    &ctx.accounts.from_account.key(),
                    &ctx.accounts.to_account.key(),
                    amount,
                );
                anchor_lang::solana_program::program::invoke(
                    &ix,
                    &[
                        ctx.accounts.from_account.to_account_info(),
                        ctx.accounts.to_account.to_account_info(),
                    ],
                )?;
                msg!("Transfer {}: {} lamports", i + 1, amount);
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
        require_keys_eq!(ctx.accounts.owner.key(), token_heir.owner, ErrorCode::Unauthorized);
        require_keys_eq!(ctx.accounts.owner_token_account.owner, token_heir.owner, ErrorCode::Unauthorized);
        require_keys_eq!(ctx.accounts.heir_token_account.owner, ctx.accounts.heir.key(), ErrorCode::Unauthorized);
        require_keys_eq!(ctx.accounts.owner_token_account.mint, token_heir.token_mint, ErrorCode::InvalidMint);
        require_keys_eq!(ctx.accounts.heir_token_account.mint, token_heir.token_mint, ErrorCode::InvalidMint);

        let cpi_accounts = Transfer {
            from: ctx.accounts.owner_token_account.to_account_info(),
            to: ctx.accounts.heir_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
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
        // Ensure the signer is the recorded heir
        require_keys_eq!(ctx.accounts.heir_account.key(), coin_heir.heir, ErrorCode::Unauthorized);
        // Ensure the provided owner account matches record
        require_keys_eq!(ctx.accounts.owner_account.key(), coin_heir.owner, ErrorCode::Unauthorized);

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.owner_account.key(),
            &ctx.accounts.heir_account.key(),
            coin_heir.amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.owner_account.to_account_info(),
                ctx.accounts.heir_account.to_account_info(),
            ],
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
    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BatchTransferCoins<'info> {
    #[account(mut)]
    pub from_account: Signer<'info>,
    /// CHECK: This account will receive SOL
    #[account(mut)]
    pub to_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimHeirTokenAssets<'info> {
    #[account(mut)]
    pub token_heir: Account<'info, TokenHeir>,
    /// CHECK: This is the owner account
    pub owner: AccountInfo<'info>,
    /// CHECK: This is the heir who must be a signer
    pub heir: Signer<'info>,
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub heir_token_account: Account<'info, TokenAccount>,
    /// CHECK: This should be the authority that can transfer from owner's token account
    pub authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimHeirCoinAssets<'info> {
    #[account(mut)]
    pub coin_heir: Account<'info, CoinHeir>,
    /// CHECK: This is the owner account
    #[account(mut)]
    pub owner_account: AccountInfo<'info>,
    /// CHECK: This is the heir who must be a signer
    #[account(mut)]
    pub heir_account: Signer<'info>,
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
}