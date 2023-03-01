import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/dist/client/router";
import Image from "next/image";

const Navbar = () => {

    const router = useRouter();

  return (
    <div className="w-full h-auto flex flex-row justify-between items-center px-10 py-4">
      <Image alt="logo" src="/images/Logo.png" className="cursor-pointer" width={180} height={115} onClick={() => {
        router.push("/")
      }}></Image>
      <div className="h-40flex flex-row justify-center items-center">
      <span className="title cursor-pointer" style={{fontSize: "60px"}} onClick={() => {router.push("/Home")}}>Read My Diary</span>
      </div>
      
      <ConnectButton showBalance={true}></ConnectButton>
    </div>
  );
};

export default Navbar;
