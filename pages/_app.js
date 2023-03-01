import "tailwindcss/tailwind.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import "../styles/globals.css";
import "../styles/Home.module.css";
import React, { useEffect } from "react";
import { useAccount, useSigner, useContract, useProvider } from "wagmi";
import { useDiaryStore } from "../state/store";
import contractConfig from "../contractConfig.json";
import Router from "next/router";

const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const MyApp = ({ Component, pageProps }) => {
  const setAllDiaries = useDiaryStore((state) => state.setAllDiaries);
  const setWritingFee = useDiaryStore((state) => state.setWritingFee);
  const provider = useProvider();

  const contract = useContract({
    addressOrName: contractConfig.address,
    contractInterface: contractConfig.abi,
    signerOrProvider: provider,
  });

  useEffect(() => {
    const getAllDiaries = async () => {
      const allDiaries = await contract.getAllDiaries();
      console.log({ allDiaries });
      setAllDiaries(allDiaries);
    };
    const getWritingFee = async() => {
      const _writingFee = await contract.writingFee();
      const writingFee = parseInt(_writingFee.toString())/10**18;
      console.log(writingFee)
      setWritingFee(writingFee);
    }
    if (contract.provider) {
      getAllDiaries();
      getWritingFee();
    }
  }, [contract]);

  return (
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} modalSize="compact">
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>

  );
};

export default MyApp;
