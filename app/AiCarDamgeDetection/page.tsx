'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link';

function AiCarDamageDetection() {
    const { data: session } = useSession();

    const options = [
        {
            title: "Detect Car Damage",
            href: "/AiCarDamgeDetection/Detecting",
            image: "/img/damage-classification-B.png",
        },
        {
            title: "Claims Process",
            href: "/AiCarDamgeDetection/process",
            image: "/img/Process-B.png",
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0b1120] text-white">
            <Navbar />
            <div className="flex flex-col items-center justify-center px-6 py-12 md:flex-row md:space-x-10">
                {options.map((opt, index) => (
                    <div
                        key={index}
                        className="bg-white/10 backdrop-blur-md shadow-xl border border-white/20 hover:border-orange-500 transition-all duration-300 rounded-2xl p-8 w-full max-w-xs text-center mb-6 md:mb-0"
                    >
                        <Image
                            src={opt.image}
                            width={140}
                            height={140}
                            alt={opt.title}
                            className="mx-auto mb-4"
                        />
                        <h3 className="text-xl font-semibold text-orange-400 mb-3">{opt.title}</h3>

                        <Link href={opt.href}>
                            <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-5 rounded-full transition">
                                Continue <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                            </button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AiCarDamageDetection;
