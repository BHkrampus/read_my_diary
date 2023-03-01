import Navbar from "../components/Navbar";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import NftPage from "./NftPage";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useDiaryStore } from "../state/store";
import { useSigner, useContract, useProvider } from "wagmi";
import contractConfig from "../contractConfig.json";
import ENS, { getEnsAddress } from "@ensdomains/ensjs";
import DiaryComponent from "../components/DiaryComponent";
import AddPage from "../components/AddPage";

const Home = () => {
  const { isConnected, address } = useAccount();

  const allDiaries = useDiaryStore((state) => state.allDiaries);
  const [myDiaries, setMyDiaries] = useState([]);
  const [readingDiaries, setReadingDiaries] = useState([]);
  const [ensName, setEnsName] = useState();
  // const { data } = useEnsResolver({
  //   name: "awkweb.eth",
  // });

  const provider = useProvider();

  const [formData, setFormData] = useState({
    diaryName: "",
    description: "",
    fee: "",
    totalNfts: "",
  });

  const [navStatus, setNavStatus] = useState({
    home: true,
    myDiaries: false,
    reading: false,
    publish: false,
  });

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

  const router = useRouter();

  const publishDiary = async () => {
    if (!isConnected) {
      alert("Connect your Wallet");
    } else {
      try {
        console.log(ethers.utils.parseUnits(formData.fee, 18).toString());
        const txn = await contract2.publishDiary(
          formData.diaryName,
          ethers.utils.parseUnits(formData.fee, 18),
          formData.description,
          formData.totalNfts
        );
        await txn.wait();
        setFormData({
          diaryName: "",
          fee: "",
        });

        router.reload(window.location.pathname)
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    // const getEnsName = async () => {
    //   const ens = new ENS({
    //     provider: provider,
    //     ensAddress: getEnsAddress("1"),
    //   });
    //   let name = await ens.getName(address);
    //   const ensName = name.name;
    //   console.log(ensName);
    //   setEnsName(ensName);
    // };

    if (isConnected) {
      // getEnsName();
      console.log({ allDiaries });
    }
    const getMyDiaries = async () => {
      const myDiaries = await contract.getMyDiaries(address);
      console.log({ myDiaries });
      setMyDiaries(myDiaries);
    };

    const getReadingDiaries = async () => {
      const readingDiaries = await contract.getReadingDiaries(address);
      console.log({ readingDiaries });
      setReadingDiaries(readingDiaries);
    };

    // const getEnsName = async () => {
    //   const web3 = await getWeb3
    // }

    if (isConnected) {
      getMyDiaries();
      getReadingDiaries();
    }
  }, [isConnected]);

  return (
    <div className="background h-screen w-full flex flex-col justify-start items-center noScrollbar overflow-auto">
      <Navbar></Navbar>
      <div className="w-full h-full flex flex-row justify-between items-center px-10">
        <div className="w-1/5 h-4/6 sidebar flex flex-col justify-center items-center">
          <span
            className="title my-5 cursor-pointer ease-linear duration-200"
            style={
              navStatus.home
                ? { fontSize: "44px", fontWeight: "bold" }
                : { fontSize: "36px" }
            }
            onClick={() => {
              setNavStatus({
                home: true,
                myDiaries: false,
                reading: false,
                publish: false,
              });
            }}
          >
            Home
          </span>
          <span
            className="title my-5 cursor-pointer ease-linear duration-200"
            style={
              navStatus.reading
                ? { fontSize: "44px", fontWeight: "bold" }
                : { fontSize: "36px" }
            }
            onClick={() => {
              setNavStatus({
                home: false,
                myDiaries: false,
                reading: true,
                publish: false,
              });
            }}
          >
            Reading
          </span>
          <span
            className="title my-5 cursor-pointer ease-linear duration-200"
            style={
              navStatus.myDiaries
                ? { fontSize: "44px", fontWeight: "bold" }
                : { fontSize: "36px" }
            }
            onClick={() => {
              setNavStatus({
                home: false,
                myDiaries: true,
                reading: false,
                publish: false,
              });
            }}
          >
            My Diaries
          </span>
          <span
            className="title my-5 cursor-pointer ease-linear duration-200"
            style={
              navStatus.publish
                ? { fontSize: "44px", fontWeight: "bold" }
                : { fontSize: "36px" }
            }
            onClick={() => {
              setNavStatus({
                home: false,
                myDiaries: false,
                reading: false,
                publish: true,
              });
            }}
          >
            Publish
          </span>
        </div>
        <div
          className="w-5/6 flex flex-col justify-start items-center bg-red-200 ml-10 pl-10 py-5 rounded-3xl"
          style={{ height: "32rem" }}
        >
          {navStatus.home ? (
            <div className="w-full h-full flex flex-col justify-start items-center noScrollbar overflow-auto">
              <div className="grid grid-cols-4 justify-start items-center w-full h-auto gap-12">
                {allDiaries
                  .map((diary, index) => (
                    <div
                      key={index}
                      className="cursor-pointer"
                      onClick={() => {
                        router.push({
                          pathname: "/Diary",
                          query: {
                            diaryId: index,
                          },
                        });
                      }}
                    >
                      <DiaryComponent diary={diary} />
                    </div>
                  ))
                  .reverse()}
              </div>
            </div>
          ) : navStatus.reading ? (
            <div className="w-full h-full flex flex-col justify-start items-start pr-10">
              <span className="title" style={{ fontSize: "32px" }}>
                Reading Diaries
              </span>
              <div className="w-full h-full noScrollbar overflow-auto mt-5">
                <div className="grid grid-cols-4 justify-start items-center w-full h-auto gap-12">
                  {readingDiaries
                    .map((diary, index) => (
                      <div
                        key={index}
                        className="cursor-pointer"
                        onClick={() => {
                          router.push({
                            pathname: "/Diary",
                            query: {
                              diaryId: diary.diaryId.toString(),
                            },
                          });
                          console.log(diary.diaryId);
                        }}
                      >
                        <DiaryComponent key={index} diary={diary} />
                      </div>
                    ))
                    .reverse()}
                </div>
              </div>
            </div>
          ) : navStatus.myDiaries ? (
            <div className="w-full h-full flex flex-col justify-start items-start pr-10">
              <span className="title" style={{ fontSize: "32px" }}>
                My Diaries
              </span>
              <div className="w-full h-full noScrollbar overflow-auto mt-5">
                <div className="grid grid-cols-3 justify-start items-center w-full h-auto gap-12">
                  {myDiaries
                    .map((diary, index) => (
                      <div
                        key={index}
                        className="flex flex-row justify-start items-end"
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            router.push({
                              pathname: "/Diary",
                              query: {
                                diaryId: diary.diaryId.toString(),
                              },
                            });
                          }}
                        >
                          <DiaryComponent key={index} diary={diary} />
                        </div>
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            router.push({
                              pathname: "/WritePage",
                              query: {
                                diaryId: diary.diaryId.toString(),
                              },
                            });
                          }}
                        >
                          <AddPage />
                        </div>
                      </div>
                    ))
                    .reverse()}
                </div>
              </div>
            </div>
          ) : navStatus.publish ? (
            <div className="w-full h-full flex flex-col justify-start items-start pr-10">
              <span className="title" style={{ fontSize: "40px" }}>
                Publish Your Diary
              </span>
              <form
                className="w-full h-full flex flex-col justify-evenly items-center mt-5 px-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  publishDiary();
                }}
              >
                <div className="w-full h-1/6 flex flex-row justify-start items-center">
                  <span className="title" style={{ fontSize: "32px" }}>
                    Diary Name
                  </span>
                  <div className="textfield w-4/6 h-full ml-10">
                    <input
                      type="text"
                      placeholder="(max 30 char)"
                      className="inputText title h-full ml-5 text-xl w-full placeholder-slate-400"
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          diaryName: e.target.value,
                        });
                      }}
                    ></input>
                  </div>
                </div>
                <div className="w-full h-32 flex flex-row justify-start items-start">
                  <span className="title" style={{ fontSize: "32px" }}>
                    Description
                  </span>
                  <div className="textfield w-4/6 h-full ml-12">
                    <textarea
                      type="text"
                      placeholder="(max 500 char)"
                      className="inputText title h-full ml-5 text-xl w-full mt-2"
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        });
                      }}
                    ></textarea>
                  </div>
                </div>
                <div className="w-full h-1/6 flex flex-row justify-between items-center">
                  <div className="w-1/2 h-1/6 flex flex-row justify-start items-center">
                    <span className="title" style={{ fontSize: "32px" }}>
                      Page Fee
                    </span>
                    <div
                      className="textfield w-2/6 h-16"
                      style={{ marginLeft: "70px" }}
                    >
                      <input
                        type="number"
                        step="any"
                        placeholder="Enter fee"
                        className="inputText title2 h-full ml-5 text-2xl w-full placeholder-slate-400"
                        onChange={(e) => {
                          setFormData({ ...formData, fee: e.target.value });
                        }}
                      ></input>
                    </div>
                  </div>
                  <div className="w-1/2 h-1/6 flex flex-row justify-start items-center">
                    <span className="title" style={{ fontSize: "32px" }}>
                      Total NFTs
                    </span>
                    <div
                      className="textfield w-2/6 h-16"
                      style={{ marginLeft: "30px" }}
                    >
                      <input
                        type="number"
                        placeholder="Total NFTs"
                        className="inputText title2 h-full ml-5 text-2xl w-full placeholder-red-400"
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            totalNfts: e.target.value,
                          });
                        }}
                      ></input>
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-row justify-between items-center">
                  <div className="w-4/5 h-full"></div>
                  <button
                    type="submit"
                    className="button w-48 flex flex-row justify-center items-center"
                    style={{
                      fontSize: "24px",
                      height: "60px",
                      borderRadius: "20px",
                    }}
                  >
                    <span className="title text-2xl">Submit</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
