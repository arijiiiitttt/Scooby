use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("3V9kdabTMdzTLudPjEP8gj5AFfRR2c8b4UyeWZMA2thT");

pub const PLATFORM_FEE_LAMPORTS: u64 = 8_000_000; 

#[program]
pub mod scooby {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let authority = &mut ctx.accounts.authority;
        authority.admin = ctx.accounts.admin.key();
        authority.treasury = ctx.accounts.treasury.key();
        authority.total_audits = 0;
        authority.total_fees_collected = 0;
        authority.bump = ctx.bumps.authority;
        Ok(())
    }

    pub fn collect_fee(ctx: Context<CollectFee>) -> Result<()> {
        // CPI Transfer
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        );
        system_program::transfer(cpi_ctx, PLATFORM_FEE_LAMPORTS)?;

        let profile = &mut ctx.accounts.user_profile;
        
        // Manual init check to populate fields once
        if profile.wallet == Pubkey::default() {
            profile.wallet = ctx.accounts.user.key();
            profile.joined_at = Clock::get()?.unix_timestamp;
            profile.bump = ctx.bumps.user_profile;
        }

        profile.audit_credits = profile.audit_credits.checked_add(1).ok_or(ScoobyError::Overflow)?;
        profile.total_fees_paid = profile.total_fees_paid.checked_add(PLATFORM_FEE_LAMPORTS).ok_or(ScoobyError::Overflow)?;

        let authority = &mut ctx.accounts.authority;
        authority.total_fees_collected = authority.total_fees_collected.checked_add(PLATFORM_FEE_LAMPORTS).ok_or(ScoobyError::Overflow)?;

        emit!(FeePaid {
            user: ctx.accounts.user.key(),
            amount: PLATFORM_FEE_LAMPORTS,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }

    pub fn create_attestation(ctx: Context<CreateAttestation>, params: AttestationParams) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        require!(profile.audit_credits > 0, ScoobyError::NoCreditsRemaining);
        
        profile.audit_credits = profile.audit_credits.checked_sub(1).ok_or(ScoobyError::Overflow)?;
        profile.total_audits = profile.total_audits.checked_add(1).ok_or(ScoobyError::Overflow)?;

        let authority = &mut ctx.accounts.authority;
        authority.total_audits = authority.total_audits.checked_add(1).ok_or(ScoobyError::Overflow)?;

        let attestation = &mut ctx.accounts.attestation;
        attestation.program_id = params.program_id;
        attestation.score = params.score;
        attestation.critical_count = params.critical_count;
        attestation.high_count = params.high_count;
        attestation.medium_count = params.medium_count;
        attestation.low_count = params.low_count;
        attestation.timestamp = Clock::get()?.unix_timestamp;
        attestation.auditor = ctx.accounts.auditor.key();
        attestation.user_wallet = profile.wallet;
        attestation.report_id = params.report_id;
        attestation.bump = ctx.bumps.attestation;

        emit!(AttestationCreated {
            program_id: attestation.program_id,
            score: attestation.score,
            report_id: attestation.report_id,
            user: attestation.user_wallet,
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = admin, 
        space = 8 + AuthorityState::INIT_SPACE, 
        seeds = [b"authority"], 
        bump
    )]
    pub authority: Account<'info, AuthorityState>,
    pub treasury: SystemAccount<'info>, 
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CollectFee<'info> {
    #[account(mut, seeds = [b"authority"], bump = authority.bump)]
    pub authority: Account<'info, AuthorityState>,
    #[account(
        init_if_needed, 
        payer = user, 
        space = 8 + UserProfile::INIT_SPACE, 
        seeds = [b"user_profile", user.key().as_ref()], 
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut, address = authority.treasury @ ScoobyError::WrongTreasury)]
    pub treasury: SystemAccount<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(params: AttestationParams)]
pub struct CreateAttestation<'info> {
    #[account(
        init, 
        payer = auditor, 
        space = 8 + Attestation::INIT_SPACE, 
        seeds = [b"attestation", params.program_id.as_ref(), params.report_id.as_ref()], 
        bump
    )]
    pub attestation: Account<'info, Attestation>,
    #[account(
        mut, 
        seeds = [b"authority"], 
        bump = authority.bump,
        constraint = auditor.key() == authority.admin @ ScoobyError::UnauthorizedAuditor
    )]
    pub authority: Account<'info, AuthorityState>,
    #[account(
        mut, 
        seeds = [b"user_profile", user_profile.wallet.as_ref()], 
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub auditor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct AuthorityState {
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub total_audits: u64,
    pub total_fees_collected: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub wallet: Pubkey,
    pub audit_credits: u64, 
    pub total_audits: u64,
    pub total_fees_paid: u64,
    pub joined_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Attestation {
    pub program_id: Pubkey,
    pub score: u8,
    pub critical_count: u8,
    pub high_count: u8,
    pub medium_count: u8,
    pub low_count: u8,
    pub timestamp: i64,
    pub auditor: Pubkey,
    pub user_wallet: Pubkey,
    pub report_id: [u8; 16],
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct AttestationParams {
    pub program_id: Pubkey,
    pub score: u8,
    pub critical_count: u8,
    pub high_count: u8,
    pub medium_count: u8,
    pub low_count: u8,
    pub report_id: [u8; 16],
}

#[event]
pub struct FeePaid { pub user: Pubkey, pub amount: u64, pub timestamp: i64 }

#[event]
pub struct AttestationCreated { pub program_id: Pubkey, pub score: u8, pub report_id: [u8; 16], pub user: Pubkey }

#[error_code]
pub enum ScoobyError {
    #[msg("Unauthorized auditor")] UnauthorizedAuditor,
    #[msg("Arithmetic overflow")] Overflow,
    #[msg("No audit credits remaining. Please pay the fee first.")] NoCreditsRemaining,
    #[msg("Wrong treasury address")] WrongTreasury,
}