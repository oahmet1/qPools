import * as anchor from "@project-serum/anchor";
import {clusterApiUrl, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction} from "@solana/web3.js";
import {BN, Provider, workspace} from "@project-serum/anchor";
import {QPoolsStats} from "@qpools/sdk/lib/qpools-stats";
import {getSolbondProgram, MOCK} from "@qpools/sdk";
import {Token} from "@solana/spl-token";
import {NETWORK} from "@qpools/sdk/lib/cluster";
import {delay} from "@qpools/sdk/lib/utils";
import {TvlInUsdc} from "@qpools/sdk/lib/types/tvlAccount";
import {SEED} from "@qpools/sdk/lib/seeds";

/**
 * Calculate TVL and
 *
 */

const main = async () => {

    // I guess wrap this in a setInterval call?
    // Or do the setInterval through bash

    setInterval(async () => {

        console.log("Triggering TVL Calculation and writing ...");
        let cluster: string = clusterApiUrl('devnet');

        console.log("Cluster is: ", cluster);
        const provider = Provider.local(cluster,
            {
                skipPreflight: true
            }
        );
        const connection = provider.connection;
        // @ts-expect-error
        const wallet = provider.wallet.payer as Keypair;
        // const walletSigner = provider.wallet;
        // // @ts-expect-error
        // const wallet = provider.wallet.payer as Signer;

        // Get the rpc calls
        console.log("GetSolbondProgram");
        let solbondProgram = await getSolbondProgram(
            connection, provider, NETWORK.DEVNET
        );

        // Create a new currency mint token
        console.log("Create Token");
        let currencyMint: Token = new Token(
            connection,
            MOCK.DEV.SOL,
            solbondProgram.programId,
            wallet
        );

        // Calculate TVL
        console.log("Create QPoolsStats");
        let qpoolsStats: QPoolsStats = new QPoolsStats(
            connection,
            currencyMint
        );
        // TODO: The program address inside is not finishing when this is triggered!!
        // Maybe put this in a separately
        await delay(2000);
        // Damn, dafuq, this was it really! I guess this is also what caused issues on the frontend!

        console.log("Calculate TVL");
        let {tvl} = await qpoolsStats.calculateTVL();

        // Run the RPC call

        // Get the qPoolAccount
        console.log("QPoolAccount");
        let [qPoolAccount, bumpQPoolAccount] = await PublicKey.findProgramAddress(
            [currencyMint.publicKey.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode(SEED.BOND_POOL_ACCOUNT))],
            solbondProgram.programId
        );

        // Get the account addresses
        console.log("TVL");
        let [tvlAccount, tvlAccountBump] = await PublicKey.findProgramAddress(
            [qPoolAccount.toBuffer(), Buffer.from(anchor.utils.bytes.utf8.encode(SEED.TVL_INFO_ACCOUNT))],
            solbondProgram.programId
        );

        console.log("RPC");
        console.log("Writing TVL: ", tvl.toString());
        let txs = new Transaction();
        const tx1 = solbondProgram.instruction.setTvl(
            new BN(tvl),
            tvlAccountBump, {
                accounts: {
                    tvlAccount: tvlAccount,
                    initializer: wallet.publicKey,
                    poolAccount: qPoolAccount,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                    systemProgram: anchor.web3.SystemProgram.programId
                },
            }
        )
        txs.add(tx1);
        let sg = await connection.sendTransaction(txs, [wallet]);
        await connection.confirmTransaction(sg);
        console.log("Transaction is: ", sg);

        console.log("Tvl set!");

        let tvlInUsdc = (await solbondProgram.account.TvlInfoAccount.fetch(tvlAccount)) as TvlInUsdc;
        console.log("TVL in USDC is: ", tvlInUsdc);

    }, 10000);

}

main();