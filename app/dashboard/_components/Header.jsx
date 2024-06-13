"use client"
import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

function Header() {
    const path=usePathname();
    useEffect(()=>{
        console.log(path)

    },[])
  return (
    <div className='flex items-center p-4 bg-secondary shadow-2xl justify-between'>
      <img src='logo.png' className='w-60 h-20 mr-4' alt='Logo' />
      <div className='flex-1'>
        <ul className=' hidden md:flex justify-center gap-6 font-bold text-3xl'>
          <li className={`hover:text-primary hover:font-bold transition cursor-pointer
            ${path=='/dashboard' && 'text-primary font-bold'}`}>Dashboard</li>
          <li className={`hover:text-primary hover:font-bold transition cursor-pointer
            ${path=='/dashboard/questions' && 'text-primary font-bold'}`}>Questions</li>
          <li className={`hover:text-primary hover:font-bold transition cursor-pointer
            ${path=='/dashboard/Upgrade' && 'text-primary font-bold'}`}>Upgrade</li>
          <li className={`hover:text-primary hover:font-bold transition cursor-pointer
            ${path=='/dashboard/how' && 'text-primary font-bold'}`}>How it Works?</li>
        </ul>
      </div>
      <UserButton />
    </div>
  );
}

export default Header;
