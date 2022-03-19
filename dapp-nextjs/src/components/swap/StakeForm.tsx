/* This example requires Tailwind CSS v2.0+ */
import {useForm} from "react-hook-form";
import {useWallet} from '@solana/wallet-adapter-react';

import React, {useEffect, useState} from "react";
import {IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import InputFieldWithLogo from "../inputs/InputFieldWithLogo";
import UserInfoBalance from "../displays/UserInfoBalance";

import PurchaseButton from "../buttons/PurchaseButton";
import OnramperModal from "../modals/OnramperModal"
import {COLORS} from "../../const"
import ConnectWalletButton from "../buttons/ConnectWalletButton";
import InputSlider from "../inputs/Slider"

export default function StakeForm() {

    const walletContext: any = useWallet();
    const qPoolContext: IQPool = useQPoolUserTool();

    const [depositAmountUsdc, setDepositAmountUsdc] = useState<number>(0.);
    const [depositAmountSol, setDepositAmountSol] = useState<number>(0.);

    const [allowSwap, setAllowSwap] = useState<boolean>(true);

    const [displayBuyModal, setDisplayBuyModal] = useState<boolean>(false);
    const [displayOnramperModal, setDisplayOnramperModal] = useState<boolean>(false);

    const [percentage, setPercentage] = useState<number>(0.);

    useEffect(()=>{
        if(qPoolContext.connection && qPoolContext.userAccount && qPoolContext.userAccount!.publicKey){
            setDepositAmountSol(qPoolContext.walletAmountSol * percentage)
            setDepositAmountUsdc(qPoolContext.walletAmountUsdc * percentage)
        }
    },[percentage])

    //TODO : fetch solana price
    const solanaPrice = 100;

    const getActionButton = () => {
        if (qPoolContext.userAccount) {
            return (
                <PurchaseButton
                    valueInUsdc={depositAmountUsdc}
                    amountSol = {depositAmountSol}
                />
            )
        } else {
            return (
                <ConnectWalletButton/>
            );
        }
    }

    return (
        <>

            <OnramperModal
                isOpen={displayOnramperModal}
                onClose={() => {
                    setDisplayOnramperModal(false)
                }}
            />


            <div className={"flex pb-2 w-full"}>
                <div className={"flex flex-row space-x-6"}>
                    <div className={"flex flex-row ml-52 my-auto"}>
                        <InputSlider
                            setPercentage = {setPercentage}
                        />
                        {getActionButton()}
                    </div>
                </div>
            </div>
        </>
    );
}
