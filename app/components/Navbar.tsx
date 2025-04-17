'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from 'next-auth/react';
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa"; // Updated import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { div } from 'framer-motion/client';

function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/register";

    return (
        <nav>
            <header className="px-5  shadow-sm font-work-sans">
                <nav className="flex justify-between items-center">


                    {!isAuthPage && (
                        <button
                            onClick={() => router.push('/welcome')}
                            className="m-2 w-14 h-14 transition-all duration-300 border-2 border-transparent hover:border-[#5e17eb] rounded-xl p-1"
                        >
                            <img
                                src="/img/logo-home1.png"
                                alt="Back"
                                className="w-full h-full object-contain"
                            />
                        </button>
                    )}

                    <div className="ml-auto p-3 flex items-center gap-5 text-white">
                        {session?.user ? (
                            <div className='flex gap-5 '>
                                <ul className='flex gap-3 px-1 py-1 m-1'>
                                    <li>
                                        <a
                                            className="relative text-white hover:text-[#5e17eb48] transition duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[3px] after:bg-[#5e17eb48] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
                                            href="/AiCarDamgeDetection/Detecting"
                                        >
                                            AI Car Damage Detection
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            className="relative text-white hover:text-[#5e17eb48] transition duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[3px] after:bg-[#5e17eb48] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
                                            href="/AiCarDamgeDetection/process"
                                        >
                                            Claim Progress

                                        </a>
                                    </li>
                                   
                                </ul>

                                <div className="flex items-center px-1  border-2 border-[#5e17eb48] rounded-full text-white gap-1">
                                    {session.user?.role === "admin" ? (
                                        <div className='bg-[#5e17eb48] px-1   border-[#5e17eb48] rounded-full'>
                                            <a href="/admin"><FontAwesomeIcon icon={faUserTie} className="text-white  text-xl " /></a>
                                        </div>

                                    ) : (
                                        <FaUserCircle className="text-[#5e17eb48] text-2xl pl-0 ml-0" />
                                    )}

                                    <span>{session.user?.firstName || "User"}</span>
                                    <button onClick={() => signOut()} className="text-red-400 gap-2">
                                        <FaSignOutAlt size={18} /> {/* Updated icon */}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <button className="px-4 py-0.5 border-2 border-[#5e17eb48] text-[#5e17eb48] rounded-full hover:bg-[#5e17eb] hover:text-white transition">
                                        Login
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <button className="px-4 py-1 bg-[#5e17eb48] text-white rounded-full hover:bg-[#5e17ebfb] transition">
                                        Sign up
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>
        </nav>
    );
}

export default Navbar;