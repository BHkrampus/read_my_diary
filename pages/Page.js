import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAccount, useSigner, useContract, useProvider } from "wagmi";
import contractConfig from "../contractConfig.json";
import { useDiaryStore } from "../state/store";
import Moment from "react-moment";

const Page = () => {
  const { isConnected, address } = useAccount();
  const allDiaries = useDiaryStore((state) => state.allDiaries);
  const [diaryId, setDiaryId] = useState();
  const [pageNum, setPageNum] = useState();
  const [page, setPage] = useState();
  const [hasReadPage, setHasReadPage] = useState();
  const provider = useProvider();
  const { data: signer, isError, isLoading } = useSigner();

  const contract = useContract({
    addressOrName: contractConfig.address,
    contractInterface: contractConfig.abi,
    signerOrProvider: provider,
  });

  const contract2 = useContract({
    addressOrName: contractConfig.address,
    contractInterface: contractConfig.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const diaryId = searchParams.get("diaryId");
    const pageNum = searchParams.get("pageNum");
    console.log(diaryId);
    console.log(pageNum);
    setDiaryId(diaryId);
    setPageNum(pageNum);
  }, []);

  useEffect(() => {
    const getPage = async () => {
      const page = await contract.diaryIdToPage(diaryId, pageNum);
      console.log({ page });
      setPage(page);
    };

    const getHasReadPage = async () => {
      const hasReadPage = await contract.userReadPage(
        signer._address,
        diaryId,
        pageNum
      );
      console.log(hasReadPage);
      setHasReadPage(hasReadPage);
    };

    if (isConnected && diaryId && pageNum && signer) {
      getPage();
      getHasReadPage();
    }
  }, [isConnected, diaryId, pageNum, signer]);

  return (
    <div className="background max-h-screen h-screen w-full flex flex-col justify-start items-center noScrollbar overflow-auto">
      <Navbar />
      {hasReadPage || allDiaries[diaryId]?.author == signer?._address ? (
        <div
          className="singlePage w-2/6 mb-5 flex flex-col justify-start items-center py-3 px-5"
          style={{ borderRadius: "0px 50px 50px 0px", height: "36rem" }}
        >
          <div className="flex flex-row w-full justify-between items-center">
            <span className="title2" style={{ fontSize: "36px" }}>
              {page?.pageNum.toString()}
            </span>
            <div className="title2 w-52 flex flex-col justify-end items-end mr-3">
              <Moment
              className="text-lg"
                date={page?.timestamp.toNumber() * 1000}
                format="LL"
              ></Moment>
              <Moment
                date={page?.timestamp.toNumber() * 1000}
                format="LT"
              ></Moment>
            </div>
          </div>
          <div className="w-full h-4/5 bg-pink-300 rounded-3xl mt-2 border-2 border-slate-600 py-3 px-5 noScrollbar overflow-auto">
            <span className="title" style={{ fontSize: "22px" }}>
              {page?.pageText}
            </span>
          </div>
          <div className="w-full flex flex-row justify-between items-center mt-3">
            <div className="flex flex-row justify-start items-center">
              <span className="title" style={{ fontSize: "24px" }}>
                Total readers
              </span>
              <span className="title2 ml-3" style={{ fontSize: "36px" }}>
                {page?.totalReaders.toString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col h-full justify-center items-center title"
          style={{ fontSize: "72px" }}
        >
          Invalid Page
        </div>
      )}
    </div>
  );
};

export default Page;
