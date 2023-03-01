import React from "react";
import Image from "next/image";
import { getEllipsisTxt } from "../helpers/formatters";

const NftComponent = ({diary}) => {
  return (
    <div
      className="nft rounded-3xl p-4"
      style={{ width: "28rem", height: "28rem" }}
    >
      <div className=" w-full h-full flex flex-col justify-between items-center">
        <div className="w-full h-4/6 flex flex-col justify-start items-center">
          <span className="title3" style={{ fontSize: "50px" }}>
            {diary?.diaryName}
          </span>
          <div className="flex flex-row justify-center items-center mt-5">
            <span className="title3" style={{ fontSize: "32px" }}>
              {" "}
              <span style={{ fontSize: "22px" }}>by</span>{" "}
              {getEllipsisTxt(diary?.author, 4)}
            </span>
          </div>
        </div>
        <div className="w-full h-2/6 flex flex-col justify-start items-center">
          <div className="w-full flex flex-row justify-between items-center px-5">
            <div className="flex flex-row justify-start items-baseline">
              <span className="title3" style={{ fontSize: "20px" }}>
                Page Fee
              </span>
              <span className="title4 ml-3 mr-4" style={{ fontSize: "32px" }}>
                {diary?.pageFee.toString()/10**18}
              </span>
              <Image alt="Matic" src="/images/Matic.png" width={30} height={30}>
              </Image>
            </div>
            <div className="flex flex-row justify-start items-baseline">
              <span className="title3" style={{ fontSize: "20px" }}>
                Pages
              </span>
              <span className="title4 ml-3" style={{ fontSize: "32px" }}>
                {diary?.totalPages.toString()}
              </span>
            </div>
          </div>
          <div className="w-full flex flex-row justify-between items-center px-5">
            <div className="flex flex-row justify-start items-baseline">
              <span className="title3" style={{ fontSize: "20px" }}>
                Readers
              </span>
              <span className="title4 ml-3" style={{ fontSize: "32px" }}>
                {diary?.totalReaders.toString()}
              </span>
            </div>
            <div className="flex flex-row justify-start items-baseline">
              <span className="title3" style={{ fontSize: "20px" }}>
                NFTs
              </span>
              <span className="title4 ml-3" style={{ fontSize: "32px" }}>
                {diary?.totalNfts.toString()}
              </span>
            </div>
          </div>
          <div className="w-full flex flex-row justify-center items-center px-5">
          <div className="mt-6">
          <Image
              alt="logo"
              src="/images/LogoSmall.png"
              width="32.2px"
              height="22.2px"
            ></Image>
          </div>
            
            <span className="title3 ml-5" style={{ fontSize: "22px" }}>
              Read My Diary
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftComponent;
