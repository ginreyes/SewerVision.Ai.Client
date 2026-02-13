'use client'
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "@/lib/helper";

export default function NotFound() {
    const router = useRouter();
    const [role, setRole] = useState(null);
    
    useEffect(() => {
        const storedRole = getCookie("role");
        if (storedRole) {
          setRole(storedRole);
          router.push(`/${storedRole}/dashboard`);
        }
      }, [router])
      

    const goHome = () => {
        if (role) {
          router.push(`/${role}/dashboard`);
        } else {
          router.push("/");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-4">
            <h1 className="text-9xl font-bold text-black">404</h1>
            <h3 className="text-center">
                <span className="text-2xl text-black block">Page Not Found ⚠️</span>
                <span className="text-lg text-gray-500">We couldn’t find the page you are looking for.</span>
            </h3>
            <Button 
                onClick={goHome} 
                variant="rose" 
                className="px-6 py-2 bg-rose-500 text-white rounded hover:bg-rose-600"
                text = 'Back To Home'
            />
               
            <div className="mt-6">
                <Image src="/404.png" alt="Page Not Found" width={924} height={574} />
            </div>
        </div>
    );
}
