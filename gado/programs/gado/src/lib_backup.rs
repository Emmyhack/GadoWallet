use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;
use anchor_lang::solana_program::clock::Clock;
use anchor_lang::solana_program::system_instruction;

declare_id!("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

// Default inactivity period for inheritance claims: 2 days (for testing)
const INACTIVITY_PERIOD_SECONDS: i64 = 2 * 24 * 60 * 60; // 2 days

// Business Model Constants
const DEFAULT_PLATFORM_FEE_BPS: u16 = 50; // 0.5% in basis points (50/10000)
const MAX_PLATFORM_FEE_BPS: u16 = 200; // 2% maximum fee
const FREE_USER_MAX_HEIRS: u8 = 1;
const PREMIUM_USER_MAX_HEIRS: u8 = 10;

// Advanced Features Constants
const MAX_SUPPORTED_TOKENS: u8 = 20; // Maximum tokens per Smart Wallet
const EMERGENCY_PAUSE_DURATION: i64 = 7 * 24 * 60 * 60; // 7 days
const NOTIFICATION_BUFFER_SIZE: usize = 100; // Maximum notifications to store
const WHITE_LABEL_MAX_PARTNERS: u8 = 50; // Maximum white-label partners

#[program]
pub mod gado {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.platform_config;
        let treasury = &mut ctx.accounts.treasury;
        
        // Initialize platform configuration
        config.admin = ctx.accounts.admin.key();
        config.platform_fee_bps = DEFAULT_PLATFORM_FEE_BPS;
        config.treasury = treasury.key();
        config.total_fees_collected = 0;
        config.total_inheritances_executed = 0;
        config.is_paused = false;
        config.pause_timestamp = 0;
        config.total_users = 0;
        config.premium_users = 0;
        config.total_multi_token_wallets = 0;
        config.total_inheritance_value = 0;
        config.bump = ctx.bumps.platform_config;
        
        // Initialize treasury
        treasury.admin = ctx.accounts.admin.key();
        treasury.total_balance = 0;
        treasury.bump = ctx.bumps.treasury;
        
        msg!("Gado program initialized with platform fee: {}bps", DEFAULT_PLATFORM_FEE_BPS);
        Ok(())
    }

    /// Initialize or update user profile with subscription status
    pub fn initialize_user_profile(
        ctx: Context<InitializeUserProfile>,
        is_premium: bool
    ) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        
        user_profile.user = ctx.accounts.user.key();
        user_profile.is_premium = is_premium;
        user_profile.total_inheritances_created = 0;
        user_profile.total_fees_paid = 0;
        user_profile.created_at = Clock::get()?.unix_timestamp;
        user_profile.total_notifications = 0;
        user_profile.referral_partner = None;
        user_profile.bump = ctx.bumps.user_profile;
        
        // Update platform statistics
        let config = &mut ctx.accounts.platform_config;
        config.total_users += 1;
        if is_premium {
            config.premium_users += 1;
        }
        
        msg!(
            "User profile initialized: {} (Premium: {})",
            ctx.accounts.user.key(),
            is_premium
        );
        Ok(())
    }

    /// Update platform configuration (admin only)
    pub fn update_platform_config(
        ctx: Context<UpdatePlatformConfig>,
        new_fee_bps: u16
    ) -> Result<()> {
        require!(new_fee_bps <= MAX_PLATFORM_FEE_BPS, ErrorCode::FeeTooHigh);
        
        let config = &mut ctx.accounts.platform_config;
        config.platform_fee_bps = new_fee_bps;
        
        msg!("Platform fee updated to: {}bps", new_fee_bps);
        Ok(())
    }

    /// Withdraw fees from treasury (admin only)
    pub fn withdraw_treasury(
        ctx: Context<WithdrawTreasury>,
        amount: u64
    ) -> Result<()> {
        let treasury = &ctx.accounts.treasury;
        require!(amount <= treasury.total_balance, ErrorCode::InsufficientTreasuryBalance);
        
        // Transfer SOL from treasury PDA to admin
        let seeds = &[
            b"treasury".as_ref(),
            &[treasury.bump],
        ];
        
        let transfer_ix = system_instruction::transfer(
            &ctx.accounts.treasury.key(),
            &ctx.accounts.admin.key(),
            amount,
        );
        
        anchor_lang::solana_program::program::invoke_signed(
            &transfer_ix,
            &[
                ctx.accounts.treasury.to_account_info(),
                ctx.accounts.admin.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[seeds],
        )?;
        
        // Update treasury balance
        let treasury_mut = &mut ctx.accounts.treasury;
        treasury_mut.total_balance = treasury_mut.total_balance.saturating_sub(amount);
        
        msg!("Withdrawn {} lamports from treasury", amount);
        Ok(())
    }

    /// Emergency pause/unpause platform (admin only)
    pub fn emergency_pause(
        ctx: Context<EmergencyControl>,
        paused: bool
    ) -> Result<()> {
        let config = &mut ctx.accounts.platform_config;
        config.is_paused = paused;
        config.pause_timestamp = if paused { 
            Clock::get()?.unix_timestamp 
        } else { 
            0 
        };
        
        msg!("Platform emergency pause status: {}", paused);
        Ok(())
    }

    /// Transfer admin privileges to a new admin (current admin only)
    pub fn transfer_admin(
        ctx: Context<TransferAdmin>,
        new_admin: Pubkey
    ) -> Result<()> {
        let config = &mut ctx.accounts.platform_config;
        let treasury = &mut ctx.accounts.treasury;
        
        // Update admin in platform config
        config.admin = new_admin;
        
        // Update admin in treasury
        treasury.admin = new_admin;
        
        msg!(
            "Admin transferred from {} to {}",
            ctx.accounts.admin.key(),
            new_admin
        );
        Ok(())
    }

    /// Create a white-label partner configuration
    pub fn create_partner(
        ctx: Context<CreatePartner>,
        partner_name: String,
        fee_share_bps: u16, // Basis points of fees shared with partner
        custom_branding: bool
    ) -> Result<()> {
        require!(fee_share_bps <= 5000, ErrorCode::InvalidFeeShare); // Max 50% share
        require!(partner_name.len() <= 32, ErrorCode::PartnerNameTooLong);
        
        let partner = &mut ctx.accounts.partner_config;
        partner.admin = ctx.accounts.admin.key();
        partner.partner_authority = ctx.accounts.partner_authority.key();
        partner.name = partner_name;
        partner.fee_share_bps = fee_share_bps;
        partner.custom_branding = custom_branding;
        partner.total_referrals = 0;
        partner.total_fees_earned = 0;
        partner.is_active = true;
        partner.created_at = Clock::get()?.unix_timestamp;
        partner.bump = ctx.bumps.partner_config;
        
        msg!("Partner created: {}", partner.name);
        Ok(())
    }

    /// Log notification event for inheritance triggers
    pub fn log_notification(
        ctx: Context<LogNotification>,
        timestamp: i64,
        message: String,
        notification_type: NotificationType,
    ) -> Result<()> {
        let notification = &mut ctx.accounts.notification;
        notification.user = ctx.accounts.user.key();
        notification.message = message;
        notification.notification_type = notification_type;
        notification.timestamp = timestamp;
        notification.is_read = false;
        Ok(())
    }

    /// Add multiple tokens to Smart Wallet inheritance
    pub fn add_multi_token_inheritance(
        ctx: Context<AddMultiTokenInheritance>,
        token_allocations: Vec<TokenAllocation>
    ) -> Result<()> {
        require!(
            token_allocations.len() <= MAX_SUPPORTED_TOKENS as usize,
            ErrorCode::TooManyTokens
        );
        
        let smart_wallet = &mut ctx.accounts.smart_wallet;
        smart_wallet.token_allocations = token_allocations.clone();
        
        // Update analytics
        let config = &mut ctx.accounts.platform_config;
        config.total_multi_token_wallets += 1;
        
        msg!("Multi-token inheritance added with {} token types", token_allocations.len());
        Ok(())
    }

    pub fn add_token_heir(ctx: Context<AddTokenHeir>, amount: u64, inactivity_period_seconds: i64) -> Result<()> {
        require!(inactivity_period_seconds > 0, ErrorCode::InvalidInactivityPeriod);

        // Check user subscription limits
        let is_premium = ctx.accounts.user_profile.is_premium;
        if !is_premium {
            // Free users limited to 1 heir and fixed inactivity periods
            require!(
                inactivity_period_seconds == INACTIVITY_PERIOD_SECONDS,
                ErrorCode::CustomInactivityNotAllowed
            );
        }

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

        // Update user profile
        ctx.accounts.user_profile.total_inheritances_created += 1;

        msg!(
            "Token heir added and escrow funded: {} tokens, inactivity {}s (Premium: {})",
            amount,
            inactivity_period_seconds,
            is_premium
        );
        Ok(())
    }

    pub fn add_coin_heir(ctx: Context<AddCoinHeir>, amount: u64, inactivity_period_seconds: i64) -> Result<()> {
        require!(inactivity_period_seconds > 0, ErrorCode::InvalidInactivityPeriod);
        
        // Check user subscription limits
        let is_premium = ctx.accounts.user_profile.is_premium;
        if !is_premium {
            // Free users limited to 1 heir and fixed inactivity periods
            require!(
                inactivity_period_seconds == INACTIVITY_PERIOD_SECONDS,
                ErrorCode::CustomInactivityNotAllowed
            );
        }
        
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
        
        // Update user profile
        ctx.accounts.user_profile.total_inheritances_created += 1;
        
        msg!("Coin heir added: {} lamports, inactivity {}s (Premium: {})", amount, inactivity_period_seconds, is_premium);
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

    // Simple claim without complex fee structure for now - we can add fees later
    pub fn claim_heir_token_assets(ctx: Context<ClaimHeirTokenAssets>) -> Result<()> {
        let current_timestamp = Clock::get()?.unix_timestamp;

        require!(!ctx.accounts.token_heir.is_claimed, ErrorCode::AlreadyClaimed);
        require!(
            current_timestamp - ctx.accounts.token_heir.last_active_time > ctx.accounts.token_heir.inactivity_period_seconds,
            ErrorCode::OwnerStillActive
        );
        require_keys_eq!(ctx.accounts.heir.key(), ctx.accounts.token_heir.heir, ErrorCode::Unauthorized);
        require_keys_eq!(ctx.accounts.heir_token_account.owner, ctx.accounts.heir.key(), ErrorCode::Unauthorized);
        require_keys_eq!(ctx.accounts.heir_token_account.mint, ctx.accounts.token_heir.token_mint, ErrorCode::InvalidMint);
        require_keys_eq!(ctx.accounts.escrow_token_account.mint, ctx.accounts.token_heir.token_mint, ErrorCode::InvalidMint);
        require_keys_eq!(ctx.accounts.escrow_token_account.owner, ctx.accounts.token_heir.key(), ErrorCode::Unauthorized);

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

        ctx.accounts.token_heir.is_claimed = true;
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
    // SMART WALLET INHERITANCE MODEL
    // ===============================================

    /// Creates a Smart Wallet inheritance setup with PDA wallet ownership
    pub fn create_smart_wallet_inheritance(
        ctx: Context<CreateSmartWalletInheritance>,
        heirs: Vec<HeirData>,
        inactivity_period_seconds: i64
    ) -> Result<()> {
        require!(inactivity_period_seconds > 0, ErrorCode::InvalidInactivityPeriod);
        require!(!heirs.is_empty(), ErrorCode::NoHeirsProvided);

        // Check subscription limits
        let is_premium = ctx.accounts.user_profile.is_premium;
        let max_heirs = if is_premium {
            PREMIUM_USER_MAX_HEIRS
        } else {
            FREE_USER_MAX_HEIRS
        };
        
        require!(heirs.len() <= max_heirs as usize, ErrorCode::TooManyHeirs);
        
        // Free users can only use default inactivity period
        if !is_premium {
            require!(
                inactivity_period_seconds == INACTIVITY_PERIOD_SECONDS,
                ErrorCode::CustomInactivityNotAllowed
            );
        }

        // Validate heir allocation percentages sum to 100
        let total_allocation: u8 = heirs.iter().map(|h| h.allocation_percentage).sum();
        require!(total_allocation == 100, ErrorCode::InvalidAllocation);

        let smart_wallet = &mut ctx.accounts.smart_wallet;
        smart_wallet.owner = ctx.accounts.owner.key();
        smart_wallet.heirs = heirs;
        smart_wallet.inactivity_period_seconds = inactivity_period_seconds;
        smart_wallet.last_active_time = Clock::get()?.unix_timestamp;
        smart_wallet.is_executed = false;
        smart_wallet.token_allocations = Vec::new();
        smart_wallet.notification_preferences = NotificationPreferences::default();
        smart_wallet.bump = ctx.bumps.smart_wallet;

        // Update user profile
        ctx.accounts.user_profile.total_inheritances_created += 1;

        msg!(
            "Smart Wallet inheritance created for owner: {}, heirs: {}, inactivity: {}s (Premium: {})",
            ctx.accounts.owner.key(),
            smart_wallet.heirs.len(),
            inactivity_period_seconds,
            is_premium
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

    /// Upgrade user to premium status
    pub fn upgrade_to_premium(ctx: Context<UpgradeToPremium>) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        require_keys_eq!(user_profile.user, ctx.accounts.user.key(), ErrorCode::Unauthorized);
        
        user_profile.is_premium = true;
        msg!("User {} upgraded to premium", ctx.accounts.user.key());
        
        Ok(())
    }

    /// Update Smart Wallet inactivity period (premium only)
    pub fn update_smart_wallet_inactivity_period(
        ctx: Context<UpdateSmartWalletInactivityPeriod>,
        new_inactivity_period_seconds: i64
    ) -> Result<()> {
        let smart_wallet = &mut ctx.accounts.smart_wallet;
        let user_profile = &ctx.accounts.user_profile;
        
        require_keys_eq!(smart_wallet.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);
        require!(user_profile.is_premium, ErrorCode::PremiumRequired);
        require!(new_inactivity_period_seconds > 0, ErrorCode::InvalidInactivityPeriod);
        
        smart_wallet.inactivity_period_seconds = new_inactivity_period_seconds;
        msg!(
            "Smart Wallet inactivity period updated to {} seconds for owner: {}", 
            new_inactivity_period_seconds,
            ctx.accounts.owner.key()
        );
        
        Ok(())
    }

    /// Add additional heir to existing Smart Wallet (premium only)
    pub fn add_smart_wallet_heir(
        ctx: Context<AddSmartWalletHeir>,
        heir_pubkey: Pubkey,
        allocation_percentage: u8
    ) -> Result<()> {
        let smart_wallet = &mut ctx.accounts.smart_wallet;
        let user_profile = &ctx.accounts.user_profile;
        
        require_keys_eq!(smart_wallet.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);
        require!(user_profile.is_premium, ErrorCode::PremiumRequired);
        require!(allocation_percentage > 0 && allocation_percentage <= 100, ErrorCode::InvalidAllocation);
        require!(smart_wallet.heirs.len() < 10, ErrorCode::MaxHeirsReached);
        
        // Check that heir doesn't already exist
        for heir in &smart_wallet.heirs {
            require_neq!(heir.heir_pubkey, heir_pubkey, ErrorCode::HeirAlreadyExists);
        }
        
        smart_wallet.heirs.push(HeirData {
            heir_pubkey,
            allocation_percentage,
        });
        
        msg!("Added heir {} with {}% allocation", heir_pubkey, allocation_percentage);
        Ok(())
    }

    /// Update existing heir allocation (premium only)
    pub fn update_smart_wallet_heir_allocation(
        ctx: Context<UpdateSmartWalletHeirAllocation>,
        heir_pubkey: Pubkey,
        new_allocation_percentage: u8
    ) -> Result<()> {
        let smart_wallet = &mut ctx.accounts.smart_wallet;
        let user_profile = &ctx.accounts.user_profile;
        
        require_keys_eq!(smart_wallet.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);
        require!(user_profile.is_premium, ErrorCode::PremiumRequired);
        require!(new_allocation_percentage > 0 && new_allocation_percentage <= 100, ErrorCode::InvalidAllocation);
        
        // Find and update the heir
        let mut heir_found = false;
        for heir in &mut smart_wallet.heirs {
            if heir.heir_pubkey == heir_pubkey {
                heir.allocation_percentage = new_allocation_percentage;
                heir_found = true;
                break;
            }
        }
        
        require!(heir_found, ErrorCode::HeirNotFound);
        msg!("Updated heir {} allocation to {}%", heir_pubkey, new_allocation_percentage);
        
        Ok(())
    }

    /// Executes inheritance by transferring all Smart Wallet assets to heirs
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
        
        // Calculate platform fee from total balance
        let config = &ctx.accounts.platform_config;
        let total_platform_fee = (wallet_balance as u128 * config.platform_fee_bps as u128 / 10000) as u64;
        let distributable_balance = wallet_balance.saturating_sub(total_platform_fee);
        
        // Execute SOL inheritance distribution (after fee deduction)
        if distributable_balance > 0 {
            for heir_data in &smart_wallet.heirs {
                let heir_amount = (distributable_balance as u128 * heir_data.allocation_percentage as u128 / 100) as u64;
                
                if heir_amount > 0 {
                    // Transfer SOL from Smart Wallet PDA to heir
                    let transfer_ix = system_instruction::transfer(
                        &ctx.accounts.smart_wallet_pda.key(),
                        &heir_data.heir_pubkey,
                        heir_amount,
                    );

                    let seeds = &[
                        b"smart_wallet_pda",
                        smart_wallet.owner.as_ref(),
                        &[ctx.bumps.smart_wallet_pda],
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

        // Transfer platform fee to treasury (if fee > 0)
        if total_platform_fee > 0 {
            let fee_transfer_ix = system_instruction::transfer(
                &ctx.accounts.smart_wallet_pda.key(),
                &ctx.accounts.treasury.key(),
                total_platform_fee,
            );

            let seeds = &[
                b"smart_wallet_pda",
                smart_wallet.owner.as_ref(),
                &[ctx.bumps.smart_wallet_pda],
            ];

            anchor_lang::solana_program::program::invoke_signed(
                &fee_transfer_ix,
                &[
                    ctx.accounts.smart_wallet_pda.to_account_info(),
                    ctx.accounts.treasury.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[seeds],
            )?;

            // Update treasury balance
            let treasury = &mut ctx.accounts.treasury;
            treasury.total_balance += total_platform_fee;
        }

        smart_wallet.is_executed = true;

        // Update platform stats
        let config_mut = &mut ctx.accounts.platform_config;
        config_mut.total_fees_collected += total_platform_fee;
        config_mut.total_inheritances_executed += 1;

        // Update user profile
        ctx.accounts.user_profile.total_fees_paid += total_platform_fee;

        msg!(
            "Smart Wallet inheritance executed for owner: {}, distributed: {} SOL, fee: {} SOL",
            smart_wallet.owner,
            distributable_balance,
            total_platform_fee
        );

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

    /// Withdraws SOL from Smart Wallet PDA to specified recipient
    pub fn withdraw_from_smart_wallet(
        ctx: Context<WithdrawFromSmartWallet>,
        amount: u64
    ) -> Result<()> {
        let smart_wallet = &ctx.accounts.smart_wallet;
        require_keys_eq!(smart_wallet.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);

        // Check if Smart Wallet has sufficient balance
        let current_balance = ctx.accounts.smart_wallet_pda.lamports();
        require!(current_balance >= amount, ErrorCode::InsufficientBalance);

        // Transfer SOL from Smart Wallet PDA to recipient
        let transfer_ix = system_instruction::transfer(
            &ctx.accounts.smart_wallet_pda.key(),
            &ctx.accounts.recipient.key(),
            amount,
        );

        let seeds = &[
            b"smart_wallet_pda",
            smart_wallet.owner.as_ref(),
            &[ctx.bumps.smart_wallet_pda],
        ];

        anchor_lang::solana_program::program::invoke_signed(
            &transfer_ix,
            &[
                ctx.accounts.smart_wallet_pda.to_account_info(),
                ctx.accounts.recipient.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[seeds],
        )?;

        msg!(
            "Withdrawn {} SOL from Smart Wallet PDA to recipient: {}",
            amount,
            ctx.accounts.recipient.key()
        );

        Ok(())
    }

    /// Withdraws SPL tokens from Smart Wallet PDA to specified recipient
    pub fn withdraw_tokens_from_smart_wallet(
        ctx: Context<WithdrawTokensFromSmartWallet>,
        amount: u64
    ) -> Result<()> {
        let smart_wallet = &ctx.accounts.smart_wallet;
        require_keys_eq!(smart_wallet.owner, ctx.accounts.owner.key(), ErrorCode::Unauthorized);

        // Validate token accounts
        require_keys_eq!(ctx.accounts.smart_wallet_token_account.mint, ctx.accounts.token_mint.key(), ErrorCode::InvalidMint);
        require_keys_eq!(ctx.accounts.recipient_token_account.mint, ctx.accounts.token_mint.key(), ErrorCode::InvalidMint);
        require_keys_eq!(ctx.accounts.recipient_token_account.owner, ctx.accounts.recipient.key(), ErrorCode::Unauthorized);

        // Transfer tokens from Smart Wallet PDA token account to recipient
        let seeds = &[
            b"smart_wallet_pda",
            smart_wallet.owner.as_ref(),
            &[ctx.bumps.smart_wallet_pda],
        ];

        let cpi_accounts = Transfer {
            from: ctx.accounts.smart_wallet_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.smart_wallet_pda.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let seeds_ref: &[&[&[u8]]] = &[seeds];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds_ref);
        token::transfer(cpi_ctx, amount)?;

        msg!(
            "Withdrawn {} tokens from Smart Wallet PDA to recipient: {}",
            amount,
            ctx.accounts.recipient.key()
        );

        Ok(())
    }
}

// ===============================================
// ACCOUNT STRUCTURES
// ===============================================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = PlatformConfig::SPACE,
        seeds = [b"platform_config"],
        bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        init,
        payer = admin,
        space = Treasury::SPACE,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeUserProfile<'info> {
    #[account(
        init,
        payer = user,
        space = UserProfile::SPACE,
        seeds = [b"user_profile", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(
        mut,
        seeds = [b"platform_config"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePlatformConfig<'info> {
    #[account(
        mut,
        seeds = [b"platform_config"],
        bump = platform_config.bump,
        has_one = admin
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawTreasury<'info> {
    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump,
        has_one = admin
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
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
    
    #[account(
        mut,
        seeds = [b"user_profile", owner.key().as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
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
// SMART WALLET INHERITANCE ACCOUNTS
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
    
    #[account(
        mut,
        seeds = [b"user_profile", owner.key().as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
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
pub struct UpgradeToPremium<'info> {
    #[account(
        mut,
        seeds = [b"user_profile", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateSmartWalletInactivityPeriod<'info> {
    #[account(
        mut,
        seeds = [b"smart_wallet", owner.key().as_ref()],
        bump = smart_wallet.bump
    )]
    pub smart_wallet: Account<'info, SmartWallet>,
    #[account(
        seeds = [b"user_profile", owner.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct AddSmartWalletHeir<'info> {
    #[account(
        mut,
        seeds = [b"smart_wallet", owner.key().as_ref()],
        bump = smart_wallet.bump
    )]
    pub smart_wallet: Account<'info, SmartWallet>,
    #[account(
        seeds = [b"user_profile", owner.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateSmartWalletHeirAllocation<'info> {
    #[account(
        mut,
        seeds = [b"smart_wallet", owner.key().as_ref()],
        bump = smart_wallet.bump
    )]
    pub smart_wallet: Account<'info, SmartWallet>,
    #[account(
        seeds = [b"user_profile", owner.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
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
    
    #[account(
        mut,
        seeds = [b"platform_config"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(
        mut,
        seeds = [b"user_profile", smart_wallet.owner.as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
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

#[derive(Accounts)]
pub struct WithdrawFromSmartWallet<'info> {
    #[account(
        seeds = [b"smart_wallet", owner.key().as_ref()],
        bump = smart_wallet.bump
    )]
    pub smart_wallet: Account<'info, SmartWallet>,
    
    /// CHECK: Smart Wallet PDA that will send the withdrawal
    #[account(
        mut,
        seeds = [b"smart_wallet_pda", owner.key().as_ref()],
        bump
    )]
    pub smart_wallet_pda: AccountInfo<'info>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// CHECK: Recipient account that will receive the SOL
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawTokensFromSmartWallet<'info> {
    #[account(
        seeds = [b"smart_wallet", owner.key().as_ref()],
        bump = smart_wallet.bump
    )]
    pub smart_wallet: Account<'info, SmartWallet>,
    
    #[account(mut)]
    pub smart_wallet_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = token_mint,
        associated_token::authority = recipient
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Smart Wallet PDA that owns the token account
    #[account(
        seeds = [b"smart_wallet_pda", owner.key().as_ref()],
        bump
    )]
    pub smart_wallet_pda: AccountInfo<'info>,
    
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// CHECK: Recipient that will receive the tokens
    pub recipient: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// ===============================================
// DATA STRUCTURES
// ===============================================

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
    pub token_allocations: Vec<TokenAllocation>,
    pub notification_preferences: NotificationPreferences,
    pub bump: u8,
}

impl SmartWallet {
    pub const SPACE: usize = 8 + 32 + 4 + (32 + 1) * 10 + 8 + 8 + 1 + 4 + (32 + 1) * 20 + 1 + 1 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct NotificationPreferences {
    pub inactivity_warnings: bool,
    pub inheritance_updates: bool,
    pub fee_notifications: bool,
}

// ===============================================
// BUSINESS MODEL DATA STRUCTURES
// ===============================================

#[account]
pub struct PlatformConfig {
    pub admin: Pubkey,
    pub platform_fee_bps: u16, // Fee in basis points (e.g., 50 = 0.5%)
    pub treasury: Pubkey,
    pub total_fees_collected: u64,
    pub total_inheritances_executed: u64,
    pub is_paused: bool,
    pub pause_timestamp: i64,
    pub total_users: u64,
    pub premium_users: u64,
    pub total_multi_token_wallets: u64,
    pub total_inheritance_value: u64,
    pub bump: u8,
}

impl PlatformConfig {
    pub const SPACE: usize = 8 + 32 + 2 + 32 + 8 + 8 + 1 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct Treasury {
    pub admin: Pubkey,
    pub total_balance: u64,
    pub bump: u8,
}

impl Treasury {
    pub const SPACE: usize = 8 + 32 + 8 + 1;
}

#[account]
pub struct UserProfile {
    pub user: Pubkey,
    pub is_premium: bool,
    pub total_inheritances_created: u32,
    pub total_fees_paid: u64,
    pub created_at: i64,
    pub total_notifications: u32,
    pub referral_partner: Option<Pubkey>,
    pub bump: u8,
}

impl UserProfile {
    pub const SPACE: usize = 8 + 32 + 1 + 4 + 8 + 8 + 4 + 1 + 32 + 1;
}

// ===============================================
// ADVANCED FEATURES DATA STRUCTURES
// ===============================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TokenAllocation {
    pub token_mint: Pubkey,
    pub allocation_percentage: u8, // Percentage for this token type
}

#[account]
pub struct PartnerConfig {
    pub admin: Pubkey,
    pub partner_authority: Pubkey,
    pub name: String,
    pub fee_share_bps: u16, // Basis points of fees shared with partner
    pub custom_branding: bool,
    pub total_referrals: u32,
    pub total_fees_earned: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

impl PartnerConfig {
    pub const SPACE: usize = 8 + 32 + 32 + 4 + 32 + 2 + 1 + 4 + 8 + 1 + 8 + 1;
}

#[account]
pub struct Notification {
    pub user: Pubkey,
    pub notification_type: NotificationType,
    pub message: String,
    pub timestamp: i64,
    pub is_read: bool,
    pub bump: u8,
}

impl Notification {
    pub const SPACE: usize = 8 + 32 + 1 + 4 + 200 + 8 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum NotificationType {
    InheritanceTriggered,
    InactivityWarning,
    FeeCollection,
    SystemMaintenance,
    SecurityAlert,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct PlatformAnalytics {
    pub total_users: u64,
    pub premium_users: u64,
    pub total_inheritances_executed: u64,
    pub total_fees_collected: u64,
    pub treasury_balance: u64,
    pub total_multi_token_wallets: u64,
    pub average_inheritance_value: u64,
    pub platform_uptime_percentage: f64,
}

// ===============================================
// ADVANCED ACCOUNT STRUCTURES
// ===============================================

#[derive(Accounts)]
pub struct EmergencyControl<'info> {
    #[account(
        mut,
        seeds = [b"platform_config"],
        bump = platform_config.bump,
        has_one = admin
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferAdmin<'info> {
    #[account(
        mut,
        seeds = [b"platform_config"],
        bump = platform_config.bump,
        has_one = admin @ ErrorCode::UnauthorizedAdmin
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump,
        has_one = admin @ ErrorCode::UnauthorizedAdmin
    )]
    pub treasury: Account<'info, Treasury>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(partner_name: String)]
pub struct CreatePartner<'info> {
    #[account(
        init,
        payer = admin,
        space = PartnerConfig::SPACE,
        seeds = [b"partner", partner_name.as_bytes()],
        bump
    )]
    pub partner_config: Account<'info, PartnerConfig>,
    
    #[account(
        seeds = [b"platform_config"],
        bump = platform_config.bump,
        has_one = admin
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    /// CHECK: Partner authority public key
    pub partner_authority: AccountInfo<'info>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(timestamp: i64)]
pub struct LogNotification<'info> {
    #[account(
        init,
        payer = user,
        space = Notification::SPACE,
        seeds = [b"notification", user.key().as_ref(), &timestamp.to_le_bytes()],
        bump
    )]
    pub notification: Account<'info, Notification>,
    
    #[account(
        mut,
        seeds = [b"user_profile", user.key().as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddMultiTokenInheritance<'info> {
    #[account(
        mut,
        seeds = [b"smart_wallet", owner.key().as_ref()],
        bump = smart_wallet.bump
    )]
    pub smart_wallet: Account<'info, SmartWallet>,
    
    #[account(
        mut,
        seeds = [b"platform_config"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        seeds = [b"user_profile", owner.key().as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetAnalytics<'info> {
    #[account(
        seeds = [b"platform_config"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    #[account(
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,
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
    // Business model errors
    #[msg("Platform fee is too high (max 2%).")]
    FeeTooHigh,
    #[msg("Insufficient treasury balance.")]
    InsufficientTreasuryBalance,
    #[msg("Insufficient balance in Smart Wallet.")]
    InsufficientBalance,
    #[msg("Custom inactivity periods not allowed for free users.")]
    CustomInactivityNotAllowed,
    #[msg("Not authorized as platform admin.")]
    NotPlatformAdmin,
    #[msg("Unauthorized admin operation.")]
    UnauthorizedAdmin,
    // Advanced features errors
    #[msg("Invalid fee share percentage (max 50%).")]
    InvalidFeeShare,
    #[msg("Partner name too long (max 32 characters).")]
    PartnerNameTooLong,
    #[msg("Message too long (max 200 characters).")]
    MessageTooLong,
    #[msg("Too many tokens (max 20 per Smart Wallet).")]
    TooManyTokens,
    #[msg("Platform is currently paused.")]
    PlatformPaused,
    #[msg("Emergency pause duration exceeded.")]
    PauseDurationExceeded,
    #[msg("Premium subscription required for this feature.")]
    PremiumRequired,
    #[msg("Maximum number of heirs reached.")]
    MaxHeirsReached,
    #[msg("Heir already exists in the Smart Wallet.")]
    HeirAlreadyExists,
    #[msg("Heir not found in the Smart Wallet.")]
    HeirNotFound,
}