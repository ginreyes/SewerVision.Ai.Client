'use client'
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(prevState => !prevState);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <CardHeader className="text-center text-xl font-bold mb-2 justify-center">
            <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Logo" width={32} height={30} />
                <span>SewerVersion</span>
            </div>
        </CardHeader>
    
        <CardContent>
          <CardDescription className="mb-6">
            <div className="font-bold text-black pb-2.5">
              Welcome to SewerVision! 👋
            </div>
            Access your account and let the adventure begin!
          </CardDescription>
          <Form>
            <div className="mb-4">
              <Label htmlFor="email">Email or Username</Label>
              <Input 
                type="text" 
                id="email" 
                placeholder="Enter your email or username" 
                size="xl" 
                className="w-full mt-1 border rounded" 
              />
            </div>
            <div className="mb-4 relative">
              <Label htmlFor="password">Password</Label>
              <Input 
                type={passwordVisible ? 'text' : 'password'}  
                id="password" 
                placeholder="Enter your password" 
                size="xl" 
                className="w-full mt-1 border rounded" 
              />
              <div 
                className="absolute right-3 top-8 cursor-pointer text-gray-500" 
                onClick={togglePasswordVisibility}
                >
                {passwordVisible ? (
                    <FaEyeSlash size={20} className="text-gray-500" />
                ) : (
                    <FaEye size={20} className="text-gray-500" />
                )}
                </div>

            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm">Remember me</Label>
              </div>
              <Link href="/forgot-password" className="text- hover:underline">Forgot password?</Link>
            </div>
                <Button 
                    type="submit" 
                    className="w-full py-2 mb-4" 
                    variant="rose" 
                    text="Login" 
                />
            <div className="text-center text-sm">
                New on our platform? <span> <Link href="/register" className="text-[#D76A84] hover:text-[#D76A84] hover:underline">
                    Create an account
                </Link></span>
               
            </div>

          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
