import React from "react";
import Image from "next/image";

const AddPage = () => {
  return (
    <div className="addPage">
      <span className="title" style={{fontSize: "22px"}}>Write</span>
      <Image alt="Add icon" src="/images/Add.png" width={30} height={30}>
      </Image>
    </div>
  );
};

export default AddPage;
