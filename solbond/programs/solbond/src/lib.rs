//! Use docstrings as specified here: https://doc.rust-lang.org/rustdoc/how-to-write-documentation.html
mod instructions;
mod utils;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{Mint, TokenAccount, Token};

use instructions::redeem_bond::redeem_bond_logic;
use instructions::purchase_bond::purchase_bond_logic;
use instructions::initialize_bond_pool::initialize_bond_pool_logic;

use utils::constants::DECIMALS;
// const DECIMALS: u8 = 1;

declare_id!("GGoMTmrJtapovtdjZLv1hdbgZeF4pj8ANWxRxewnZ35g");

// TODO: Replace all lamports with how many solana actually should be paid off.

/*
    TODO: 1
    We should probably have a separate function to do the portfolio (re-)distribution
    Buy mSOL, track total supply with redeemable-tokens ...

    TODO: 2
    Figure out a way to calculate the final bond, as well as the stepwise points
    you can probably use a simple formula
    and keep track of the amount that was already paid in
    You can save these variables as part of the state

    TODO: 3
    Have a bunch of constraints across bondAccount

    TODO: 4
    Have another function to pay out profits ...
    I guess this is also where our own profit-account comes in ...

    TODO: 5
    Include epochs (potentially), to decide how often something can be paid out as well.
*/

#[program]
pub mod solbond {
    use super::*;

    pub fn initialize_bond_pool(
        ctx: Context<InitializeBondPool>,
        _bump_bond_pool_account: u8,
        _bump_bond_pool_token_account: u8,
    ) -> ProgramResult {

        initialize_bond_pool_logic(
            ctx,
            _bump_bond_pool_account,
            _bump_bond_pool_token_account,
        )
    }

    // Should probably also include logic to remove how much you want to put into the bond...
    /**
    * Pay in some SOL into the bond that way created with initialize_bond_context.
    * amount_in_lamports is how much solana to pay in, provided in lampots (i.e. 10e-9 of 1SOL)
    */
    pub fn purchase_bond(
        ctx: Context<PurchaseBond>,
        amount_raw: u64,
    ) -> ProgramResult {

        purchase_bond_logic(ctx, amount_raw)
    }

    /**
    * Redeem the bond,
    *
    *   If it is before the bond runs out,
    +     then you should pay out part of the profits that were generated so far
    *   If it is after the bond runs out,
    *     then you should pay out all the profits, and the initial pay-in amount (face-value / par-value) that was paid in
    */
    pub fn redeem_bond(
        ctx: Context<RedeemBond>,
        redeemable_amount_raw: u64
    ) -> ProgramResult {

        redeem_bond_logic(ctx, redeemable_amount_raw)
    }

}

/**
 * Contexts
 * change everything to use token accounts instead of SOL
 */

#[derive(Accounts)]
#[instruction(
    _bump_bond_pool_account: u8,
    _bump_bond_pool_token_account: u8
)]
pub struct InitializeBondPool<'info> {

    // The account which represents the bond pool account
    #[account(
        init,
        payer = initializer,
        space = 8 + BondPoolAccount::LEN,
        seeds = [initializer.key.as_ref(), b"bondPoolAccount"], bump = _bump_bond_pool_account
    )]
    pub bond_pool_account: Account<'info, BondPoolAccount>,


    #[account(
        init,
        payer = initializer,
        mint::decimals = DECIMALS,
        mint::authority = bond_pool_account,
        constraint = bond_pool_redeemable_mint.mint_authority == COption::Some(bond_pool_account.key()),
        constraint = bond_pool_redeemable_mint.supply == 0
    )]
    pub bond_pool_redeemable_mint: Account<'info, Mint>,
    #[account(
        constraint = bond_pool_token_mint.decimals == DECIMALS,
    )]
    pub bond_pool_token_mint: Account<'info, Mint>,

    #[account(mut, constraint = bond_pool_redeemable_token_account.owner == bond_pool_account.key())]
    pub bond_pool_redeemable_token_account: Account<'info, TokenAccount>,
    #[account(init,
    payer = initializer,
    token::mint = bond_pool_token_mint,
    token::authority = bond_pool_account,
    seeds = [bond_pool_account.key().as_ref(), b"bondPoolTokenAccount"],
    bump = _bump_bond_pool_token_account
    )]
    pub bond_pool_token_account: Account<'info, TokenAccount>,


    // The account which generate the bond pool
    #[account(signer)]
    pub initializer: AccountInfo<'info>,

    // The standards accounts
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(
    amount_in_lamports: u64,
)]
pub struct PurchaseBond<'info> {

    // All Bond Pool Accounts
    #[account(mut)]
    pub bond_pool_account: Account<'info, BondPoolAccount>,
    // Checking for seeds here is probably overkill honestly... right?
    // seeds = [bond_pool_account.key().as_ref(), b"bondPoolSolanaAccount"], bump = _bump_bond_pool_solana_accounz
    #[account(
        mut,
        constraint = bond_pool_redeemable_mint.mint_authority == COption::Some(bond_pool_account.key())
    )]
    pub bond_pool_redeemable_mint: Account<'info, Mint>,

    #[account(
        mut
    )]
    pub bond_pool_token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub bond_pool_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub bond_pool_redeemable_token_account: Account<'info, TokenAccount>,

    // All Purchaser Accounts
    #[account(signer, mut)]
    pub purchaser: AccountInfo<'info>,  // TODO: Make him signer
    // // #[account(mut)]
    // #[account(mut, constraint = purchaser_token_account.owner == purchaser.key())]
    // pub purchaser_token_account: Account<'info, TokenAccount>,
    //
    #[account(mut)]
    pub purchaser_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub purchaser_redeemable_token_account: Account<'info, TokenAccount>,

    // The standard accounts
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}


// lol this is identical to BuyBond :P
#[derive(Accounts)]
#[instruction(
    reedemable_amount_in_lamports: u64,
)]
pub struct RedeemBond<'info> {

    // Any Bond Pool Accounts
    #[account(mut)]
    pub bond_pool_account: Account<'info, BondPoolAccount>,
    #[account(
        mut,
        constraint = bond_pool_redeemable_mint.mint_authority == COption::Some(bond_pool_account.key())
    )]
    pub bond_pool_redeemable_mint: Account<'info, Mint>,

    // not sure right now if this has to be mutable
    // inspired by the ido_pool program
    #[account(
        mut
    )]
    pub bond_pool_token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub bond_pool_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub bond_pool_redeemable_token_account: Account<'info, TokenAccount>,

    #[account(signer, mut)]
    pub purchaser: AccountInfo<'info>,  // TODO: Make him signer

    #[account(mut, constraint = purchaser_redeemable_token_account.owner == purchaser.key())]
    pub purchaser_redeemable_token_account: Account<'info, TokenAccount>,
    #[account(mut, constraint = purchaser_token_account.owner == purchaser.key())]
    pub purchaser_token_account: Account<'info, TokenAccount>,


    // The standard accounts
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

/**
* State
*/
#[account]
pub struct BondPoolAccount {
    pub generator: Pubkey,

    pub bond_pool_redeemable_mint: Pubkey,
    pub bond_pool_token_mint: Pubkey,
    pub bond_pool_redeemable_token_account: Pubkey,
    pub bond_pool_token_account: Pubkey,

    // Include also any bumps, etc.
    pub bump_bond_pool_account: u8,
    pub bump_bond_pool_token_account: u8,
}

impl BondPoolAccount {
    pub const LEN: usize =
          32   // generator
        + 32   // bond_pool_redeemable_mint
        + 32   // bond_pool_token_mint
        + 32   // bond_pool_redeemable_token_account
        + 32   // bond_pool_token_account
        + 8   // bump_bond_pool_account
        + 8;   // bump_bond_pool_token_account

}

/**
 * Error definitions
 */
#[error]
pub enum ErrorCode {
    #[msg("Redeemables to be paid out are somehow zero!")]
    LowBondRedeemableAmount,
    #[msg("Token to be paid into the bond should not be zero")]
    LowBondTokAmount,
    #[msg("Asking for too much SOL when redeeming!")]
    RedeemCapacity,
    #[msg("Need to send more than 0 SOL!")]
    MinPurchaseAmount,
    #[msg("Provided times are not an interval (end-time before start-time!)")]
    TimeFrameIsNotAnInterval,
    #[msg("Provided starting time is not in the future. You should make it in such a way that it is slightly in the future, s.t. you have the ability to pay in some amounts.")]
    TimeFrameIsInThePast,
    #[msg("Bond is already locked, you cannot pay in more into this bond!")]
    TimeFrameCannotPurchaseAdditionalBondAmount,
    #[msg("Bond has not gone past timeframe yet")]
    TimeFrameNotPassed,
    #[msg("There was an issue computing the market rate. MarketRateOverflow")]
    MarketRateOverflow,
    #[msg("There was an issue computing the market rate. MarketRateUnderflow")]
    MarketRateUnderflow,
    #[msg("Paying out more than was initially paid in")]
    PayoutError,
    #[msg("Redeemable-calculation doesnt add up")]
    Calculation,
}
