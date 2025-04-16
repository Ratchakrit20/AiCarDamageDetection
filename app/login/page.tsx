'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await signIn("credentials", {
                redirect: false, 
                username,
                password,
            });

            if (res?.error) {
                setError("Login failed. Please check your credentials.");
                return;
            }

            // ✅ เมื่อ login สำเร็จให้ redirect ไปหน้า Dashboard
            router.push("/welcome");
        } catch (error) {
            console.error("Error during login:", error);
            setError("Something went wrong. Please try again.");
        }
    };

    return (

        <div >
            <Navbar />
            <div>
                 {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-center items-center h-screen ">
                    <div className="w-full max-w-md p-8  bg-[#77777711] rounded-lg shadow-lg">
                    
                        <h1 className=" flex text-2xl font-bold text-white mb-4 justify-center"> 
                           Welcome back 
                        </h1>
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <input
                                type="text"
                                name="username"
                                placeholder="Username"

                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                            />
                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"

                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2 text-gray-400"
                                    onClick={() =>
                                        console.log('Toggle Password Visibility') /* TODO: Add visibility toggle */
                                    }
                                >
                                    
                                </button>
                            </div>
                           
                            <button
                                type="submit"
                                className="w-full py-2 rounded-lg bg-[#5e17eb] text-white font-bold hover:bg-[#5e17eb] transition"
                            >
                                Login
                            </button>
                            <p className="text-sm text-gray-500 mb-6 ">
                            Don't have an accouint{' '}
                            <a href="/register" className="text-[#5e17eb] hover:underline ">
                                Sing Up
                            </a>
                        </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>


    );
};
export default LoginPage
