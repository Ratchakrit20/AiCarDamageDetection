'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useSession } from 'next-auth/react';
import Hero from "../components/Hero";
import HowWork from "../components/HowWork";
function Welcomepage() {

    const {data:session } = useSession();
    console.log(session)

  return (
    <div className=''>
      <Navbar/>
       <Hero />
       <HowWork />
      <div>
        
      </div>
    </div>
  )
}

export default Welcomepage
