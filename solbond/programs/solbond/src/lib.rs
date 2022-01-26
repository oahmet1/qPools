//! Use docstrings as specified here: https://doc.rust-lang.org/rustdoc/how-to-write-documentation.html
mod instructions;
mod utils;
mod state;

use anchor_lang::prelude::*;
use anchor_spl::token::{Token};

use instructions::*;
declare_id!("32jEsmA7t9yiX8MTr6TXmyKDC32rHBQ62ANciJA4g6wt");

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

/**
    The relevant RPC endpoints from the amm program are:
    (in chronological order)

    - create_position
    - remove_position
    - claim_fee

    The RPC endpoints that are optional
    - swap
        => We can also use the frontend to do swaps over serum, or similar


    The RPC endpoints we are unsure about
    - create_fee_tier
    - create_position_list

    The RPC endpoints that we _probably_ will not need
    - transfer_position_ownership
        => probably not needed in the first MVP, could be interesting later
    - claim_fee
        => I think this will be used not from this, but separately

    The RPC endpoints that we will not use
    - create_pool
        => This is only called to create the pool, once the pool is created, no more is needed
    - create_state
        => I think this is only used when initializing the pool to define fees and admin,
            once the pool is initialized, we don't need this anymore
    - create_tick
        => this will already be created before we can use the pool,
            we have to use this before calling the pool


*/

#[derive(Accounts)]
#[instruction(
_bump_bond_pool_account: u8,
_bump_bond_pool_solana_account: u8
)]
pub struct BalancePools<'info> {

    // The standards accounts
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[program]
pub mod solbond {
    use super::*;

    /**
    * A simple health checkpoint which checks if the program is up and running
    */
    pub fn healthcheck(ctx: Context<Healthcheck>) -> ProgramResult {
        instructions::healthcheck::handler(ctx)
    }

    /**
    * Initializes the reserve / vault
    */
    pub fn initialize_bond_pool(
        ctx: Context<InitializeBondPool>,
        _bump_bond_pool_account: u8,
        _bump_tvl_account: u8
    ) -> ProgramResult {

        instructions::initialize_bond_pool::handler(
            ctx,
            _bump_bond_pool_account,
            _bump_tvl_account
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
        _bump_tvl_account: u8
    ) -> ProgramResult {

        instructions::purchase_bond::handler(
            ctx,
            amount_raw,
            _bump_tvl_account
        )
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
        redeemable_amount_raw: u64,
        _bump_tvl_account: u8
    ) -> ProgramResult {

        instructions::redeem_bond::handler(
            ctx,
            redeemable_amount_raw,
            _bump_tvl_account
        )
    }

    pub fn set_tvl(
        ctx: Context<SetTvl>,
        new_tvl_in_usd: u64,
        tvl_account_bump: u8
    ) -> ProgramResult {
        instructions::set_tvl::handler(
            ctx,
            new_tvl_in_usd,
            tvl_account_bump
        )
    }

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
    #[msg("Not enough credits!")]
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
    #[msg("Returning no Tokens!")]
    ReturningNoCurrency,
    #[msg("Custom Math Error 1!")]
    CustomMathError1,
    #[msg("Custom Math Error 2!")]
    CustomMathError2,
    #[msg("Custom Math Error 3!")]
    CustomMathError3,
    #[msg("Custom Math Error 4!")]
    CustomMathError4,
    #[msg("Custom Math Error 5!")]
    CustomMathError5,
    #[msg("Custom Math Error 6!")]
    CustomMathError6,
    #[msg("Custom Math Error 7!")]
    CustomMathError7,
    #[msg("Custom Math Error 8!")]
    CustomMathError8,
    #[msg("Custom Math Error 9!")]
    CustomMathError9,
    #[msg("Custom Math Error 10!")]
    CustomMathError10,
    #[msg("Custom Math Error 11!")]
    CustomMathError11,
    #[msg("Custom Math Error 12!")]
    CustomMathError12,
    #[msg("Custom Math Error 13!")]
    CustomMathError13,
    #[msg("Custom Math Error 14!")]
    CustomMathError14,
    #[msg("Custom Math Error 15!")]
    CustomMathError15,
    #[msg("Custom Math Error 16!")]
    CustomMathError16,
    #[msg("Custom Math Error 17!")]
    CustomMathError17,
    #[msg("Custom Math Error 18!")]
    CustomMathError18,
    #[msg("Custom Math Error 19!")]
    CustomMathError19,
    #[msg("Custom Math Error 20!")]
    CustomMathError20,
    #[msg("Custom Math Error 21!")]
    CustomMathError21,
    #[msg("Custom Math Error 22!")]
    CustomMathError22,
    #[msg("Total Token Supply seems empty!")]
    EmptyTotalTokenSupply,
    #[msg("Total Currency Supply seems empty!")]
    EmptyTotalCurrencySupply,
}
