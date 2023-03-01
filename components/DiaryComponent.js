import React from "react";
import { getEllipsisTxt } from "../helpers/formatters";
import Image from "next/image";

const DiaryComponent = ({ diary }) => {

  const pageFee = parseInt(diary.pageFee.toString())/10**18;

  return (
    <div className="wholeDiary">
      <div className="innerDiary"></div>
      <div className="outerDiary"></div>
      <div className="innerContent">
        <div
          className="flex flex-col justify-between items-start ml-2"
          style={{ zIndex: "3" }}
        >
          <span
            className="title h-32"
            style={{ fontSize: "28px", zIndex: "4" }}
          >
            {diary.diaryName}
          </span>
          <div className="flex flex-col justify-start items-start">
            <div className="flex flex-row justify-start items-baseline">
              <span className="title" style={{ fontSize: "16px" }}>
                Author:
              </span>
              <span className="title2 ml-2">
              {getEllipsisTxt(diary.author, 4)}
              </span>
            </div>
            <div className="flex flex-row justify-start items-baseline mt-2">
              <span className="title" style={{ fontSize: "16px" }}>
                Page Fee:
              </span>
              <span className="title2 ml-2 mr-3">
              {pageFee}
              </span>
              <Image alt="Matic" src="/images/Matic.png" width={20} height={20}></Image>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryComponent;
