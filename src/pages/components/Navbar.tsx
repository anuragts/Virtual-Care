import { useUser } from "@auth0/nextjs-auth0/client";
import { Avatar, Grid, Popover, Text } from "@nextui-org/react";
import { FiLogOut } from "react-icons/fi";
import Link from "next/link";

export default  () => {
    const { user, isLoading } = useUser();

    return(
        <>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400&display=swap" rel="stylesheet"/>
        <div className="mt-5">
        <h1 className="text-4xl font-bold text-center ">VirtualCare</h1>
        {user && (
        <div className="float-right mx-5 cursor-pointer mt-[-3rem]">
          <Popover>
            <Popover.Trigger>
              <Avatar
                text={`${user.name}`}
                color="warning"
                size={"lg"}
                textColor="white"
                className=""
              />
            </Popover.Trigger>
            <Popover.Content>
              <Text css={{ p: "$8" }}>Username - {user.nickname}</Text>
              <Text css={{ p: "$8" }}>Full Name - {user.name}</Text>
              <div className=" flex justify-center  text-xl font-bold bg-red-600 text-white px-9 rounded-full py-2 ">
                {" "}
                <Link href={"/api/auth/logout"}>
                  <FiLogOut />
                </Link>{" "}
              </div>
            </Popover.Content>
          </Popover>
        </div>
      )}
        </div>
        </>
    )
}