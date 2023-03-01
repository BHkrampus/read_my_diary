import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Router } from "react-router-dom";
import Navbar from "../components/Navbar";
import Image from "next/image";

const LandingPage = () => {
  const router = useRouter();

  return (
    <div>
      <Head></Head>
      <main className="background h-screen w-full flex flex-col justify-center items-center noScrollbar overflow-auto">
        <div className="h-32flex flex-row justify-center items-baseline">
          <Image
            alt="logo"
            src="/images/Logo.png"
            width={225}
            height={155}
          ></Image>

          <span
            className="title cursor-pointer ml-10"
            style={{ fontSize: "8rem" }}
          >
            Read My Diary
          </span>
          
        </div>
        <span
            className="title2 cursor-pointer mt-10"
            style={{ fontSize: "46px" }}
          >
            The MORE you READ, the MORE you EARN
          </span>

        <button
          className="button w-52 flex flex-row justify-center items-center mt-20"
          style={{
            fontSize: "24px",
            height: "60px",
            borderRadius: "20px",
          }}
          onClick={() => {
            router.push("/Home");
          }}
        >
          <span className="title text-2xl">Enter Dapp</span>
        </button>
      </main>
    </div>
  );
};

export default LandingPage;
