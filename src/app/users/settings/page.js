import { Card, CardContent, CardDescription } from '@/components/ui/card'
import Navbar from '@/components/ui/navbar'
import React from 'react'

const Settings = () => {
  return (
    <div className='w-full h-full flex  justify-end' >
       <Card className='w-[500px]'>
        <CardDescription>
          <h1 className='text-2xl font-bold'>Settings</h1>
          <p className='text-sm text-gray-500'>Manage your account settings and set e-mail preferences.</p>
        </CardDescription>
          <CardContent>

          </CardContent>
       </Card>
    </div>
  )
}

export default Settings
