import React, { useEffect, useState } from "react";
import { useDiaryStore } from "../state/store";
import { useAccount, useSigner, useContract, useProvider } from "wagmi";
import contractConfig from "../contractConfig.json";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { getEllipsisTxt } from "../helpers/formatters";
import { ethers } from "ethers";
import Moment from "react-moment";
import Image from "next/image";

const Diary = () => {
  const { isConnected, address } = useAccount();
  const router = useRouter();

  const [diaryPages, setDiaryPages] = useState([]);
  const [diaryId, setDiaryId] = useState();
  const [hasReadPage, setHasReadPage] = useState([]);
  const [isEligible, setIsEligible] = useState();

  const allDiaries = useDiaryStore((state) => state.allDiaries);
  // const diaryId = router.query.diaryId;

  const { data: signer, isError, isLoading } = useSigner();
  const provider = useProvider();

  const contract = useContract({
    addressOrName: contractConfig.address,
    contractInterface: contractConfig.abi,
    signerOrProvider: provider,
  });

  const distributeFunds = async () => {
    if (!isConnected) {
      alert("Connect your Wallet");
    } else {
      try {
        const contract = new ethers.Contract(
          contractConfig.address,
          contractConfig.abi,
          signer
        );
        const txn = await contract.distributionOfFunds(diaryId);
        await txn.wait();
        router.push("/Home");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const readingDiary = async (_pageNum) => {
    if (!isConnected) {
      alert("Connect your Wallet");
    } else {
      try {
        const contract2 = new ethers.Contract(
          contractConfig.address,
          contractConfig.abi,
          signer
        );
        const txn = await contract2.readingDiary(diaryId, _pageNum, {
          from: signer._address,
          value: ethers.utils.parseEther(
            (allDiaries[diaryId].pageFee / 10 ** 18).toString()
          ),
        });
        await txn.wait();
        router.push({
          pathname: "/Page",
          query: {
            diaryId: diaryId,
            pageNum: _pageNum.toString(),
          },
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const diaryId = searchParams.get("diaryId");
    setDiaryId(diaryId);
  }, []);

  useEffect(() => {
    const getDiaryPages = async () => {
      const diaryPages = await contract.getDiaryPages(diaryId);
      console.log({ diaryPages });
      setDiaryPages(diaryPages);
    };

    const hasReadPage = async () => {
      const totalPages = parseInt(allDiaries[diaryId]?.totalPages.toString());
      let arr = [];
      for (let i = 1; i <= totalPages; i++) {
        const hasReadPage = await contract.userReadPage(address, diaryId, i);
        console.log(i, hasReadPage);
        if (hasReadPage == true) {
          arr[i] = true;
        } else {
          arr[i] = false;
        }
      }
      setHasReadPage(arr);
    };

    const isEligibleNft = async () => {
      const isEligible = await contract.isEligibleForNft(address, diaryId);
      console.log(isEligible);
      setIsEligible(isEligible);
    };

    if (isConnected && diaryId && signer) {
      console.log(diaryId);
      getDiaryPages();
      hasReadPage();
      isEligibleNft();
    }
  }, [diaryId, signer, isConnected]);

  return (
    <div className="background h-screen w-full flex flex-col justify-start items-center noScrollbar overflow-auto">
      {/* <div>
        <div className="grid grid-cols-4 justify-start items-center gap-4">
          {diaryPages.map((page, index) => {
            return (
              <div key={index}>
                <div className="h-40 w-32 bg-blue-500 flex flex-col justify-center items-center">
                  <span>Diary</span>
                  <span>Page Num: {page.pageNum.toString()}</span>
                  {hasReadPage[page.pageNum] ? (
                    <div></div>
                  ) : (
                    <button
                      className="h-10 w-20 bg-red-400 rounded"
                      onClick={() => {
                        console.log(hasReadPage[page.pageNum]);
                      }}
                    >
                      Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div> */}
      <Navbar />
      <div className="w-full h-full flex flex-row justify-between items-center px-10">
        <div className="w-96 h-5/6 sidebar flex flex-col justify-between px-8 py-5">
          <div className="flex flex-col justify-start items-center">
            <span className="title" style={{ fontSize: "32px" }}>
              {allDiaries[diaryId]?.diaryName}
            </span>
            <div className="title mt-5 h-44">
              <span style={{ fontSize: "18px" }}>
                {allDiaries[diaryId]?.description}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-evenly items-start mt-3">
            <div className="flex flex-row justify-start items-baseline">
              <span className="title" style={{ fontSize: "16px" }}>
                Author
              </span>
              <span className="title2 ml-6" style={{ fontSize: "24px" }}>
                {getEllipsisTxt(allDiaries[diaryId]?.author, 3)}
              </span>
            </div>
            <div className="flex flex-row justify-start items-baseline">
              <span className="title" style={{ fontSize: "16px" }}>
                Total Readers
              </span>
              <span className="title2 ml-6" style={{ fontSize: "24px" }}>
                {allDiaries[diaryId]?.totalReaders.toString()}
              </span>
            </div>
            <div className="flex flex-row justify-start items-baseline">
              <span className="title" style={{ fontSize: "16px" }}>
                Total NFTs
              </span>
              <span className="title2 ml-6" style={{ fontSize: "24px" }}>
                {allDiaries[diaryId]?.totalNfts.toString()}
              </span>
            </div>
            <div className="flex flex-row justify-start items-baseline">
              <span className="title w-36" style={{ fontSize: "16px" }}>
                Last Entry
              </span>
              <span className="title" style={{ fontSize: "16px" }}>
                <Moment
                  date={allDiaries[diaryId]?.lastEntry.toNumber() * 1000}
                  format="LLLL"
                ></Moment>
              </span>
            </div>
          </div>
        </div>
        <div
          className="w-5/6 flex flex-col justify-start items-center bg-red-200 ml-10 px-10 py-5 rounded-3xl"
          style={{ height: "32rem" }}
        >
          <div className="w-full flex flex-row justify-between items-center">
            <div className="w-2/6 flex flex-row justify-start items-baseline">
              <span className="title" style={{ fontSize: "26px" }}>
                Page Fee
              </span>
              <span className="title2 ml-5 mr-4" style={{ fontSize: "32px" }}>
                {allDiaries[diaryId]?.pageFee / 10 ** 18}
              </span>
              <Image
                alt="Matic"
                src="/images/Matic.png"
                width={30}
                height={30}
              ></Image>
            </div>
            <div className="flex flex-row justify-start items-baseline">
              <span className="title2 ml-5" style={{ fontSize: "32px" }}>
                {allDiaries[diaryId]?.totalPages.toString()}
              </span>
            </div>
          </div>
          <div
            className="w-full flex flex-col justify-start items-center noScrollbar overflow-auto pt-5 px-5"
            style={{ height: "22rem" }}
          >
            <div className="grid grid-cols-6 justify-start items-center w-full h-auto gap-12">
              {diaryPages.map((page, index) => {
                return (
                  <div
                    key={index}
                    className="singlePage cursor-pointer h-36 w-32 flex flex-col justify-between items-start p-2"
                    onClick={() => {
                      (hasReadPage[parseInt(page.pageNum.toString())] ||
                        allDiaries[diaryId]?.author == signer?._address) &&
                        router.push({
                          pathname: "/Page",
                          query: {
                            diaryId: diaryId,
                            pageNum: page.pageNum.toString(),
                          },
                        });
                    }}
                  >
                    <span className="title2" style={{ fontSize: "20px" }}>
                      {page.pageNum.toString()}
                    </span>
                    {hasReadPage[parseInt(page.pageNum.toString())] ||
                    allDiaries[diaryId]?.author == signer?._address ? (
                      <div></div>
                    ) : (
                      <button
                        className="w-5/6 h-10 button2 rounded-lg ml-2"
                        onClick={() => {
                          readingDiary(parseInt(page.pageNum.toString()));
                        }}
                      >
                        <span className="title" style={{ fontSize: "20px" }}>
                          Read
                        </span>
                      </button>
                    )}
                    <div className="flex flex-row justify-start items-baseline">
                      <span className="title" style={{ fontSize: "14px" }}>
                        Readers
                      </span>
                      <span
                        className="title2 ml-3"
                        style={{ fontSize: "20px" }}
                      >
                        {page.totalReaders.toString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full flex flex-row justify-center items-center">
            {allDiaries[diaryId]?.author == signer?._address ? (
              <button
                className="button w-52 flex flex-row justify-center items-center mt-4"
                style={{
                  fontSize: "24px",
                  height: "60px",
                  borderRadius: "20px",
                }}
                onClick={() => {
                  distributeFunds();
                }}
              >
                <span className="title text-2xl">Distribute Funds</span>
              </button>
            ) : (
              <button
                className="button w-48 flex flex-col justify-center items-center mt-4"
                style={{
                  fontSize: "24px",
                  height: "60px",
                  borderRadius: "20px",
                }}
                onClick={() => {
                  isEligible &&
                    router.push({
                      pathname: "/NftPage",
                      query: {
                        diaryId: diaryId,
                      },
                    });
                }}
                disabled={!isEligible}
              >
                <span className="title text-2xl">Mint NFT</span>
                {!isEligible && <span className="title text-xs">{"You're not eligible"}</span> }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diary;
