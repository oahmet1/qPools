import React, {useEffect, useState} from "react";
import StakeForm from "./swap/StakeForm";
import UnstakeForm from "./swap/UnstakeForm";
import {IQPool, useQPoolUserTool} from "../contexts/QPoolsProvider";

enum HeroFormState {
    Stake,
    Unstake
}

export default function HeroForm(props: any) {

    // Let this state be determined if the user has a portfolio
    const [displayForm, setDisplayForm] = useState<HeroFormState>(HeroFormState.Stake);
    const qPoolContext: IQPool = useQPoolUserTool();

    const fetchAndDisplay = async () => {
        if (qPoolContext.portfolioObject) {
            let isFulfilled = await qPoolContext.portfolioObject!.portfolioExistsAndIsFulfilled();
            if (isFulfilled) {
                setDisplayForm(HeroFormState.Unstake);
            } else {
                setDisplayForm(HeroFormState.Stake);
            }
        }
    };

    useEffect(() => {
        // Check if the account exists, and if it was fulfilled
        fetchAndDisplay();
    }, [qPoolContext.portfolioObject, qPoolContext.makePriceReload]);

    const stakeTab = () => {
        if (displayForm === HeroFormState.Stake) {
            return (
                <button
                    onClick={() => changeTabToStake(HeroFormState.Stake)}
                    className="bg-slate-800 w-20 border-b-2 border-white inline-block rounded-t pb-4 py-2 px-4 text-white"
                >
                    Allocate
                </button>
            );
        } else {
            return (
                <button
                    onClick={() => changeTabToStake(HeroFormState.Stake)}
                    className="bg-slate-800 w-20 border-b-2 border-gray-500 inline-block rounded-t pb-4 py-2 px-4 text-white hover:text-gray-200"
                >
                    Allocate
                </button>
            );
        }
    };

    const unstakeTab = () => {
        if (displayForm === HeroFormState.Unstake) {
            return (
                <button
                    onClick={() => changeTabToStake(HeroFormState.Unstake)}
                    className="bg-slate-800 w-20 border-b-2 border-white inline-block rounded-t pb-4 py-2 px-4 text-white"
                >
                    Redeem
                </button>
            );
        } else {
            return (
                <button
                    onClick={() => changeTabToStake(HeroFormState.Unstake)}
                    className="bg-slate-800 w-20 border-b-2 border-gray-500 inline-block rounded-t pb-4 py-2 px-4 text-white hover:text-gray-200"
                >
                    Redeem
                </button>
            );
        }
    }

    // This should be based on whether or not the user already has a wallet submitted
    const changeTabToStake = (x: HeroFormState) => {
        setDisplayForm((_: HeroFormState) => x);
    };

    const stakingFormNavbar = () => {
        return (
            <>
                <ul className="flex mx-auto px-auto content-center items-center place-content-center">
                    <li className="-mb-px pr-3">
                        {stakeTab()}
                    </li>
                    <li className="mr-5">
                        {unstakeTab()}
                    </li>
                </ul>
            </>
        )
    }

    return (
        <>
            <div className={"flex flex-col w-full"}>
                <div className={"flex flex-col"}>
                    <br/>
                    {/*{stakingFormNavbar()}*/}
                    {(displayForm === HeroFormState.Stake) && <StakeForm/>}
                    {(displayForm === HeroFormState.Unstake) && <UnstakeForm/>}
                </div>
            </div>
        </>
    )

}