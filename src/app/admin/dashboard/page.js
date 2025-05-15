import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Image } from 'lucide-react'
import React from 'react'

const adminDashboard = () => {
  return (
    <div className='w-full h-full screen'>
      <div className='flex pb-10'>
          <h1 className='font-bold  text-3xl' >
              Overview
          </h1>
      </div>
 
      <div className='flex justify-items-end  gap-4'>
        <Card className='w-[160px] h-full'>
            <CardHeader>
              <Image src="/icons/total_uploads.png" alt="total Uploads" width={54} height={54} />
            </CardHeader>
            <CardContent>
              <h1 className='text-center font-bold text-ml'>Total Uploads</h1>
              <p className='text-center'>45</p>
              <div className='bg-[#55D46A]  opacity-10'>
                <p className='text-center font-bold text-[#24B26B]'>4%</p>
              </div>
            </CardContent>
          </Card>

          <Card className='w-[160px] h-full'>
            <CardHeader>
              <Image src="/icons/total_uploads.png" alt="total Uploads" width={54} height={54} />
            </CardHeader>
            <CardContent>
              <h1 className='text-center font-bold text-ml'>Total Uploads</h1>
              <p className='text-center'>45</p>
              <div className='bg-[#55D46A]  opacity-10'>
                <p className='text-center font-bold text-[#24B26B]'>4%</p>
              </div>
            </CardContent>
          </Card>
          
      </div>

      <div className='flex justify-items-end  gap-4 pt-5'>
        <Card className='w-[160px] h-full'>
            <CardHeader>
              <Image src="/icons/total_uploads.png" alt="total Uploads" width={54} height={54} />
            </CardHeader>
            <CardContent>
              <h1 className='text-center font-bold text-ml'>Total Uploads</h1>
              <p className='text-center'>45</p>
              <div className='bg-[#55D46A]  opacity-10'>
                <p className='text-center font-bold text-[#24B26B]'>4%</p>
              </div>
            </CardContent>
          </Card>

          <Card className='w-[160px] h-full'>
            <CardHeader>
              <Image src="/icons/total_uploads.png" alt="total Uploads" width={54} height={54} />
            </CardHeader>
            <CardContent>
              <h1 className='text-center font-bold text-ml'>Total Uploads</h1>
              <p className='text-center'>45</p>
              <div className='bg-[#55D46A]  opacity-10'>
                <p className='text-center font-bold text-[#24B26B]'>4%</p>
              </div>
            </CardContent>
          </Card>
          
      </div>

      <div className='flex justify-start'>
        <Card className='w-[350px] h-full mt-5'>
          <CardHeader>
           <h1 className='text-black font-bold text-center'>
           Linear Ft Processed
           </h1>
          </CardHeader>
          <CardContent>
           
          </CardContent>
        </Card>
      </div>
       
    </div>
  )
}

export default adminDashboard
