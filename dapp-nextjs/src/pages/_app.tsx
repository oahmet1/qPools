import React, { useMemo } from "react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import "../styles/App.css";
import {QPoolsProvider} from "../contexts/QPoolsProvider";
import {LoadProvider} from "../contexts/LoadingContext";

const SOLANA_NETWORK = WalletAdapterNetwork.Mainnet;
// const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;
const network = SOLANA_NETWORK;

// set custom RPC server endpoint for the final website
// const endpoint = "https://explorer-api.devnet.solana.com";

const WalletProvider = dynamic(
  () => import("../contexts/ClientWalletProvider"),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps }: AppProps) {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  return (
      <LoadProvider>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider>
              <QPoolsProvider>
                <Component {...pageProps} />
              </QPoolsProvider>
          </WalletProvider>
        </ConnectionProvider>
      </LoadProvider>
  );
}

export default MyApp;
