'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AiOutlineLogout } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/");
  };

  const handleSettings = () => {
    router.push("/admin/settings");
  };

  // handleOpenSidebar = () =>{

  // };

  return (
    <nav className="border-b-2 p-4">
      <div className="flex justify-between items-center ">
        {/* Left side: Dashboard button and Search bar */}
        <div className="flex items-center space-x-4">
          <button>
            <Image src="/Menu.png" alt="Search Icon" width={22} height={22} />
          </button>
             

          <div className="relative flex items-center w-full rounded-lg  flex-1">
            <span className="px-2">
              <Image src="/search.png" alt="Search Icon" width={22} height={22} />
            </span>
            <Input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-transparent border-none focus-visible:ring-0 text-gray-700"
            />
          </div>
        </div>

        {/* Right side: Settings, Notification, and Avatar */}
        <div className="flex items-center justify-items-end space-x-4">
          <button className="focus:outline-none cursor-pointer" onClick={handleSettings}>
            <Image src="/setting.png" alt="Settings" width={22} height={22} />
          </button>

          <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
            <PopoverTrigger asChild>
              <button className="focus:outline-none cursor-pointer">
                <Image src="/Notification.png" alt="Notification" width={22} height={22} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-2">
              <div className="flex flex-col space-y-2">
                <p className="text-sm">No new notifications</p>
              </div>
            </PopoverContent>
          </Popover>

          <span className="bg-gray">|</span>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className="focus:outline-none cursor-pointer">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/avatar_default.png" alt="User Avatar" />
                  <AvatarFallback>DF</AvatarFallback>
                </Avatar>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2">
              <div className="flex flex-col space-y-1">
                <Link href="/admin/profile">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-2 cursor-pointer" 
                    text='Profile Settings' 
                    iconComponent={RxAvatar} 
                  />
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-2 cursor-pointer" 
                  onClick={handleLogout}
                  text='Log out'
                  iconComponent={AiOutlineLogout}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
