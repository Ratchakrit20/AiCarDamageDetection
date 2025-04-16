'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

function AiCarDamgeDetection() {
    const { data: session } = useSession();
    console.log(session);

    return (
        <div>
            <Navbar />
            <div className='flex justify-center items-center h-screen bg-white'>
                <div className="bg-gray-100 m-2  text-white p-6 rounded-2xl w-80 shadow-lg flex flex-col items-center border-2 border-transparent hover:border-gray-900 transition-all duration-300">

                    {/* Icon */}
                    <div className="w-30 h-30 mb-4">
                        <Image src="/img/DB.png" width={160} height={120} alt="Detect Car Damage" />
                    </div>

                    {/* Title */}
                    <h2 className="text-orange-500 font-bold text-lg mb-3 text-center">
                    Add New data 
                    </h2>

                    {/* Features List */}
                   

                    {/* Button */}
                    <button className="bg-orange-500 text-white p-2 px-3 my-2 rounded-full hover:bg-orange-600 transition">
                        <a href="AiCarDamgeDetection/uploadform"><FontAwesomeIcon icon={faArrowRight} /> </a>                 
                         </button>
                </div>
                <div className="bg-gray-100 m-2 text-white p-6 rounded-2xl w-80 shadow-lg flex flex-col items-center border-2 border-transparent hover:border-gray-900 transition-all duration-300">

                    {/* Icon */}
                    <div className="w-30 h-30 mb-4">
                        <Image src="/img/Ai-B.png" width={160} height={160} alt="Detect Car Damage" />
                    </div>

                    {/* Title */}
                    <h2 className="text-orange-500 font-bold text-lg mb-3 text-center">
                    Model
                    </h2>

                    {/* Features List */}
                    

                    {/* Button */}
                    <button className="bg-orange-500  text-white p-2 px-3 my-2 rounded-full hover:bg-orange-600 transition">
                        <a href="AiCarDamgeDetection/uploadform"><FontAwesomeIcon icon={faArrowRight} /> </a>                 
                         </button>
                </div>
                
            </div>


        </div>
    );
}

export default AiCarDamgeDetection;
