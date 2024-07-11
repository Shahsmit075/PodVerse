import { SignIn } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <div className='flex-center glassmorphism-auth h-screen min-w-full'>
        <SignIn />
    </div>
  )
}

export default page