import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import React from 'react';

const AdminDashboard = () => {
  return (
    <div className='w-full h-full p-4'>
      <div className='flex pb-6'>
        <h1 className='font-bold text-4xl md:text-5xl'>Overview</h1>
      </div>

      {/* Parent Flex Container */}
      <div className='flex flex-col md:flex-row gap-4'>
        {/* Left Side - Four Responsive Cards */}
        <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full'>
          {[{
            icon: 'total_uploads.png', label: 'Total Uploads', value: '45', percentage: '4%', color: '#24B26B'},
            {icon: 'total_errors.png', label: 'Errors', value: '5', percentage: '4.85%', color: '#24B26B'},
            {icon: 'total_dollar.png', label: 'In Progress', value: '15', percentage: '4.85%', color: '#24B26B'},
            {icon: 'total_reviews.png', label: 'Waiting for Review', value: '0', percentage: '4.85%', color: '#24B26B'}].map((card, index) => (
            <Card key={index} className='w-full h-[234px] md:h-60 lg:h-64 shadow-lg flex flex-col justify-between'>
              <CardHeader className='flex justify-left'>
                <Image src={`/icons/${card.icon}`} alt={card.label} width={64} height={64} />
              </CardHeader>
              <CardContent className='text-left'>
                <h1 className='text-gray-600 text-base'>{card.label}</h1>
                <p className='text-2xl font-bold'>{card.value}</p>
                <div className={`flex items-center justify-start gap-1 bg-[${card.color}]/10 rounded p-1`}>
                  <Image src='/icons/green-arrow.png' alt='Increase' width={12} height={12} />
                  <p className={`text-center font-bold text-[${card.color}]`}>{card.percentage}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Side - Horizontal Cards */}
        <div className='flex gap-4 w-full h-[498px]'>
          {[1, 2].map((item) => (
            <Card key={item} className='w-1/2 h-[498px] shadow-lg'>
              <CardHeader>
                <h1 className='text-black font-bold text-lg'>Linear Ft Processed</h1>
              </CardHeader>
              <CardContent className='h-full'></CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
