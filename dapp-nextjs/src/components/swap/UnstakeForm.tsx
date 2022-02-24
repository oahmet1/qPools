/* This example requires Tailwind CSS v2.0+ */
import {useWallet} from '@solana/wallet-adapter-react';
import React, {useEffect, useState} from "react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import ConnectWalletPortfolioRow from "../portfolio/ConnectWalletPortfolioRow";
import SinglePortfolioRow from "../portfolio/SinglePortfolioRow";
import {shortenedAddressString} from "../../utils/utils";

export default function UnstakeForm() {

    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();

    const [totalPortfolioValueInUsd, setTotalPortfolioValueInUsd] = useState<number>();

    useEffect(() => {
        setTotalPortfolioValueInUsd(qPoolContext.totalPortfolioValueInUsd);
    }, [qPoolContext.totalPortfolioValueInUsd]);

    useEffect(() => {
        if (walletContext.publicKey) {
            console.log("Wallet pubkey wallet is:", walletContext.publicKey.toString());
            qPoolContext.initializeQPoolsUserTool(walletContext);
        }
    }, [walletContext.publicKey]);

    const displayListOfPortfolios = () => {

        if (!qPoolContext.portfolioObject) {
            return (
                <ConnectWalletPortfolioRow
                    text={"Connect wallet to see your portfolios!"}
                />
            )
        }
        if (qPoolContext.allocatedAccounts.length === 0) {
            return (
                <ConnectWalletPortfolioRow
                    text={"You have not created any positions yet!"}
                />
            );
        }
        if (totalPortfolioValueInUsd === 0.00) {
            return (
                <ConnectWalletPortfolioRow
                    text={"No active portfolio position found!"}
                />
            );
        }
        if (!qPoolContext.portfolioObject.portfolioPDA) {
            return (
                <ConnectWalletPortfolioRow
                    text={"Loading ..."}
                />
            );
        }
        console.log("Portfolio PDA (1) is: ", qPoolContext.portfolioObject.portfolioPDA);
        return (
            <>
                <SinglePortfolioRow
                    address={qPoolContext.portfolioObject.portfolioPDA}
                    value={totalPortfolioValueInUsd}
                />
            </>
        )
    }

    return (
        <>
            <div className="">
                <div className="">
                        <div className="py-5 bg-slate-800 bg-gray">
                            <div>
                                {/*
                                    TODO: Have perhaps one line "Portfolio, with this allocaiton
                                    We can also just display how much profit or loss it accumulated so far

                                    For each portfolio that is loaded, display one of these...
                                    And you can also include a button to redeem, for each single one...
                                */}
                                {displayListOfPortfolios()}
                            </div>
                        </div>
                        {!qPoolContext.userAccount &&
                        <div className={"flex w-full justify-center"}>
                            <WalletMultiButton
                                className={"btn btn-ghost"}
                                onClick={() => {
                                    console.log("click");
                                }}
                            />
                        </div>
                        }
                </div>
            </div>
        </>
    );
}
