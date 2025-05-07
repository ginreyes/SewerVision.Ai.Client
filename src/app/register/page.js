'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
              Adventure starts here 🚀
            </div>
            Join SewerVision.ai and Transform Sewer Management!
          </CardDescription>
          <Form>
            {['username', 'email'].map((field) => (
              <div key={field} className="mb-4">
                <Label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                <Input
                  type="text"
                  id={field}
                  name={field}
                  placeholder={`Enter your ${field}`}
                  size="xl"
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded"
                />
              </div>
            ))}
            {['password', 'confirmPassword'].map((field, index) => (
              <div key={field} className="mb-4 relative">
                <Label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                <Input
                  type={(index === 0 ? passwordVisible : confirmPasswordVisible) ? 'text' : 'password'}
                  id={field}
                  name={field}
                  placeholder={`Enter your ${field}`}
                  size="xl"
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded"
                />
                <div
                  className="absolute right-3 top-8 cursor-pointer text-gray-500"
                  onClick={index === 0 ? togglePasswordVisibility : toggleConfirmPasswordVisibility}
                >
                  {(index === 0 ? passwordVisible : confirmPasswordVisible) ? (
                    <FaEyeSlash size={20} className="text-gray-500" />
                  ) : (
                    <FaEye size={20} className="text-gray-500" />
                  )}
                </div>
              </div>
            ))}
            <div className="mb-4">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Checkbox id="privacy" />
              <Label htmlFor="privacy" className="text-sm">I agree to the privacy policy & terms</Label>
            </div>
            <Button type="submit" className="w-full py-2 mb-4" variant="rose" text="Register" />
            <div className="text-center text-sm">
              Already have an account? <Link href="/login" className="text-[#D76A84] hover:underline">Login</Link>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
