'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';

function RegisterPage() {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password != confirmPassword) {
            setError("Password do not match!");
            return;
        }
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setError("Please complete all input!");
            return;
        }

        try {
            const resCheckUser = await fetch("http://localhost:3000/api/checkUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email })
            });
            const { existingEmail, existingUsername } = await resCheckUser.json();

            if (existingEmail) {
                setError("Email already exists!");
                return;
            }

            if (existingUsername) {
                setError("Username already exists!");
                return;
            }
            const res = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstName, lastName, email, username, password
                })
            });
            if (res.ok) {
                const form = e.target as HTMLFormElement;;
                setError("");
                setSuccess("User registration successfully")
                form.reset();

            } else {

                console.log("User registration fialed.")
            }

        } catch (error) {
            console.log("Error during registration", error);
        }

    }

    return (

        <div>
            <Navbar />
            <div>
                <div className="flex justify-center items-center h-screen ">
                    <div className="w-full max-w-md p-8 bg-[#77777711] rounded-lg shadow-lg">
                        <h1 className=" flex text-2xl font-bold text-white mb-4">Create new account</h1>
                        <p className="text-sm text-gray-500 mb-6 ">
                            Already a Member?{' '}
                            <a href="/login" className="text-[#5e17eb] hover:underline">
                                Log in
                            </a>
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {error && (
                                <div className='bg-red-500 w-fit text-sm text-white py-1 px-3 rounded-md mt-2'>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className='bg-green-900 w-fit text-sm text-white py-1 px-3 rounded-md mt-2'>
                                    {success}
                                </div>
                            )}


                            <div className="flex gap-4 ">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First name"

                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-1/2  px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last name"

                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-1/2  px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                                />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                            />
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
                            <div className="relative">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"

                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2 text-gray-400"
                                    onClick={() =>
                                        console.log('Toggle Confirm Password Visibility') /* TODO: Add visibility toggle */
                                    }
                                >

                                </button>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 rounded-lg bg-[#5e17eb] text-white font-bold  "
                            >
                                Create account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>


    );
};
export default RegisterPage
