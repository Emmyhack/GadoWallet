use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;
use anchor_lang::solana_program::clock::Clock;
use anchor_lang::solana_program::system_instruction;

declare_id!("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

#[program]
pub mod gado {
    use super::*;

    /// Initialize user profile (simplified)
    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        
        user_profile.owner = ctx.accounts.owner.key();
        user_profile.total_inheritances = 0;
        user_profile.bump = ctx.bumps.user_profile;
        
        msg!("User profile initialized for: {}", ctx.accounts.owner.key());
        Ok(())
    }

    /// Add a SOL inheritance heir
    pub fn add_sol_heir(
        ctx: Context<AddSolHeir>, 
        amount: u64, 
        inactivity_period_seconds: i64
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(inactivity_period_seconds > 0, ErrorCode::InvalidInactivityPeriod);
        
        let sol_heir = &mut ctx.accounts.sol_heir;
        
        // Initialize the heir account
        sol_heir.owner = ctx.accounts.owner.key();
        sol_heir.heir = ctx.accounts.heir.key();
        sol_heir.amount = amount;
        sol_heir.inactivity_period_seconds = inactivity_period_seconds;
        sol_heir.last_activity = Clock::get()?.unix_timestamp;
        sol_heir.is_claimed = false;
        sol_heir.bump = ctx.bumps.sol_heir;
        
        // Transfer SOL from owner to the heir account (escrow)
        let transfer_ix = system_instruction::transfer(
            &ctx.accounts.owner.key(),
            &sol_heir.key(),
            amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.owner.to_account_info(),
                sol_heir.to_account_info(),
            ],
        )?;
        
        // Update user profile
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.total_inheritances += 1;
        
        msg!("SOL heir added: {} lamports for heir: {}", amount, ctx.accounts.heir.key());
        Ok(())
    }

    /// Add a SPL token inheritance heir
    pub fn add_token_heir(
        ctx: Context<AddTokenHeir>, 
        amount: u64, 
        inactivity_period_seconds: i64
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(inactivity_period_seconds > 0, ErrorCode::InvalidInactivityPeriod);
        
        // Validate token accounts
        require_keys_eq!(
            ctx.accounts.owner_token_account.owner, 
            ctx.accounts.owner.key(), 
            ErrorCode::Unauthorized
        );
        require_keys_eq!(
            ctx.accounts.owner_token_account.mint, 
            ctx.accounts.token_mint.key(), 
            ErrorCode::InvalidMint
        );
        
        let token_heir = &mut ctx.accounts.token_heir;
        
        // Initialize the heir account
        token_heir.owner = ctx.accounts.owner.key();
        token_heir.heir = ctx.accounts.heir.key();
        token_heir.token_mint = ctx.accounts.token_mint.key();
        token_heir.amount = amount;
        token_heir.inactivity_period_seconds = inactivity_period_seconds;
        token_heir.last_activity = Clock::get()?.unix_timestamp;
        token_heir.is_claimed = false;
        token_heir.bump = ctx.bumps.token_heir;
        
        // Transfer tokens from owner to escrow account
        let cpi_accounts = Transfer {
            from: ctx.accounts.owner_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        // Update user profile
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.total_inheritances += 1;
        
        msg!("Token heir added: {} tokens for heir: {}", amount, ctx.accounts.heir.key());
        Ok(())
    }

    /// Update activity for SOL heir (resets inactivity timer)
    pub fn update_sol_activity(ctx: Context<UpdateSolActivity>) -> Result<()> {
        let sol_heir = &mut ctx.accounts.sol_heir;
        require_keys_eq!(sol_heir.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);
        
        sol_heir.last_activity = Clock::get()?.unix_timestamp;
        msg!("SOL activity updated for owner: {}", ctx.accounts.owner.key());
        Ok(())
    }

    /// Update activity for token heir (resets inactivity timer)
    pub fn update_token_activity(ctx: Context<UpdateTokenActivity>) -> Result<()> {
        let token_heir = &mut ctx.accounts.token_heir;
        require_keys_eq!(token_heir.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);
        
        token_heir.last_activity = Clock::get()?.unix_timestamp;
        msg!("Token activity updated for owner: {}", ctx.accounts.owner.key());
        Ok(())
    }

    /// Claim SOL inheritance
    pub fn claim_sol_inheritance(ctx: Context<ClaimSolInheritance>) -> Result<()> {
        let sol_heir = &mut ctx.accounts.sol_heir;
        let current_time = Clock::get()?.unix_timestamp;
        
        // Validate claim conditions
        require!(!sol_heir.is_claimed, ErrorCode::AlreadyClaimed);
        require_keys_eq!(sol_heir.heir, ctx.accounts.heir.key(), ErrorCode::Unauthorized);
        require!(
            current_time - sol_heir.last_activity > sol_heir.inactivity_period_seconds,
            ErrorCode::OwnerStillActive
        );
        
        // Transfer SOL from heir account to heir's wallet
        let transfer_ix = system_instruction::transfer(
            &sol_heir.key(),
            &ctx.accounts.heir.key(),
            sol_heir.amount,
        );
        
        let seeds = &[
            b"sol_heir",
            sol_heir.owner.as_ref(),
            sol_heir.heir.as_ref(),
            &[sol_heir.bump],
        ];
        
        anchor_lang::solana_program::program::invoke_signed(
            &transfer_ix,
            &[
                sol_heir.to_account_info(),
                ctx.accounts.heir.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[seeds],
        )?;
        
        sol_heir.is_claimed = true;
        msg!("SOL inheritance claimed: {} lamports", sol_heir.amount);
        Ok(())
    }

    /// Claim token inheritance
    pub fn claim_token_inheritance(ctx: Context<ClaimTokenInheritance>) -> Result<()> {
        let token_heir = &mut ctx.accounts.token_heir;
        let current_time = Clock::get()?.unix_timestamp;
        
        // Validate claim conditions
        require!(!token_heir.is_claimed, ErrorCode::AlreadyClaimed);
        require_keys_eq!(token_heir.heir, ctx.accounts.heir.key(), ErrorCode::Unauthorized);
        require!(
            current_time - token_heir.last_activity > token_heir.inactivity_period_seconds,
            ErrorCode::OwnerStillActive
        );
        
        // Validate token accounts
        require_keys_eq!(
            ctx.accounts.heir_token_account.owner, 
            ctx.accounts.heir.key(), 
            ErrorCode::Unauthorized
        );
        require_keys_eq!(
            ctx.accounts.heir_token_account.mint, 
            token_heir.token_mint, 
            ErrorCode::InvalidMint
        );
        require_keys_eq!(
            ctx.accounts.escrow_token_account.mint, 
            token_heir.token_mint, 
            ErrorCode::InvalidMint
        );
        
        // Transfer tokens from escrow to heir
        let seeds = &[
            b"token_heir",
            token_heir.owner.as_ref(),
            token_heir.heir.as_ref(),
            token_heir.token_mint.as_ref(),
            &[token_heir.bump],
        ];
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.heir_token_account.to_account_info(),
            authority: token_heir.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, &[seeds]);
        token::transfer(cpi_ctx, token_heir.amount)?;
        
        token_heir.is_claimed = true;
        msg!("Token inheritance claimed: {} tokens", token_heir.amount);
        Ok(())
    }
}

// ===============================================
// ACCOUNT STRUCTURES
// ===============================================

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = owner,
        space = UserProfile::SPACE,
        seeds = [b"user_profile", owner.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddSolHeir<'info> {
    #[account(
        init,
        payer = owner,
        space = SolHeir::SPACE,
        seeds = [b"sol_heir", owner.key().as_ref(), heir.key().as_ref()],
        bump
    )]
    pub sol_heir: Account<'info, SolHeir>,
    
    #[account(
        mut,
        seeds = [b"user_profile", owner.key().as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// CHECK: This is the heir's public key
    pub heir: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

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
    
    #[account(
        mut,
        seeds = [b"user_profile", owner.key().as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// CHECK: This is the heir's public key
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
pub struct UpdateSolActivity<'info> {
    #[account(
        mut,
        seeds = [b"sol_heir", owner.key().as_ref(), sol_heir.heir.as_ref()],
        bump = sol_heir.bump,
        has_one = owner
    )]
    pub sol_heir: Account<'info, SolHeir>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateTokenActivity<'info> {
    #[account(
        mut,
        seeds = [b"token_heir", owner.key().as_ref(), token_heir.heir.as_ref(), token_heir.token_mint.as_ref()],
        bump = token_heir.bump,
        has_one = owner
    )]
    pub token_heir: Account<'info, TokenHeir>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimSolInheritance<'info> {
    #[account(
        mut,
        seeds = [b"sol_heir", sol_heir.owner.as_ref(), heir.key().as_ref()],
        bump = sol_heir.bump
    )]
    pub sol_heir: Account<'info, SolHeir>,
    
    #[account(mut)]
    pub heir: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimTokenInheritance<'info> {
    #[account(
        mut,
        seeds = [b"token_heir", token_heir.owner.as_ref(), heir.key().as_ref(), token_heir.token_mint.as_ref()],
        bump = token_heir.bump
    )]
    pub token_heir: Account<'info, TokenHeir>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = heir,
        associated_token::mint = token_heir.token_mint,
        associated_token::authority = heir
    )]
    pub heir_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub heir: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// ===============================================
// DATA STRUCTURES
// ===============================================

#[account]
pub struct UserProfile {
    pub owner: Pubkey,
    pub total_inheritances: u32,
    pub bump: u8,
}

impl UserProfile {
    pub const SPACE: usize = 8 + 32 + 4 + 1;
}

#[account]
pub struct SolHeir {
    pub owner: Pubkey,
    pub heir: Pubkey,
    pub amount: u64,
    pub inactivity_period_seconds: i64,
    pub last_activity: i64,
    pub is_claimed: bool,
    pub bump: u8,
}

impl SolHeir {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct TokenHeir {
    pub owner: Pubkey,
    pub heir: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub inactivity_period_seconds: i64,
    pub last_activity: i64,
    pub is_claimed: bool,
    pub bump: u8,
}

impl TokenHeir {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 1 + 1;
}

// ===============================================
// ERROR CODES
// ===============================================

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount provided.")]
    InvalidAmount,
    #[msg("Invalid inactivity period.")]
    InvalidInactivityPeriod,
    #[msg("Unauthorized operation.")]
    Unauthorized,
    #[msg("Invalid token mint.")]
    InvalidMint,
    #[msg("Owner is still active.")]
    OwnerStillActive,
    #[msg("Inheritance already claimed.")]
    AlreadyClaimed,
}