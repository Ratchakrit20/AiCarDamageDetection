// components/Navbar.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import NotificationBar from "./NotificationBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { faFileInvoice } from "@fortawesome/free-solid-svg-icons";

function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <nav>
      <header className="px-5 shadow-sm font-work-sans">
        <nav className="flex justify-between items-center px-4 py-2 bg-transparent">
          <div className="flex items-center gap-4">
            {!isAuthPage && (
              <button
                onClick={() => router.push("/welcome")}
                className="w-12 h-12 transition-all duration-300 border-4 border-transparent hover:border-[#5e17eb] rounded-xl"
              >
                <img
                  src="/img/logo-home1.png"
                  alt="Back"
                  className="w-full h-full object-contain"
                />
              </button>
            )}

            {session?.user && (
              <ul className="flex gap-8 p-2">
                <li>
                  <a
                    href="/AiCarDamgeDetection/Detecting"
                    className="relative text-white font-medium hover:text-white transition duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[3px] after:bg-[#5e17eb48] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
                  >
                    AI Car Damage Detection
                  </a>
                </li>
                <li>
                  <a
                    href="/AiCarDamgeDetection/process"
                    className="relative text-white font-medium hover:text-white transition duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[3px] after:bg-[#5e17eb48] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
                  >
                    Claim Progress
                  </a>
                </li>
              </ul>
            )}
          </div>

          <div className="flex items-center text-white gap-2 relative">
            {session?.user && (
              <div className="flex items-center">
                <NotificationBar />
              </div>
            )}

            {session?.user ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center font-medium px-2 py-1 border-2 border-[#5e17eb48] rounded-full gap-2 hover:bg-[#5e17eb10]"
                >
                  <FaUserCircle className="text-[#4a3a7d] text-3xl" />
                  <span>{session.user.firstName || "User"}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#301c57] text-white rounded-lg shadow-lg z-50">
                    <Link
                      href="/account"
                      className="px-4 py-3 hover:bg-[#4a3a7d] flex items-center gap-2"
                    >
                      <FontAwesomeIcon size="lg" icon={faGear} />Account setting
                    </Link>
                    {session?.user?.role === "admin" && (
                      <Link
                        href="/admin/check-claimreports"
                        className="px-4 py-3 hover:bg-[#4a3a7d] flex items-center gap-2"
                      >
                        <FontAwesomeIcon size="lg" icon={faFileInvoice} />Report Approval
                      </Link>


                    )}
                    {session?.user?.role === "admin" && (
                      
                      <Link
                      href="/admin/approve-insurance"
                      className="px-4 py-3 hover:bg-[#4a3a7d] flex items-center gap-2"
                      >
                      <FontAwesomeIcon size="lg" icon={faFileInvoice} />Insurance Approval
                      </Link>


                    )}
                    {session?.user?.role === "admin" && (
                      
                      <Link
                      href="/admin/manage-users"
                      className="px-4 py-3 hover:bg-[#4a3a7d] flex items-center gap-2"
                      >
                      <FontAwesomeIcon size="lg" icon={faFileInvoice} />Manage users
                      </Link>


                    )}
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-3 hover:bg-[#4a3a7d] flex items-center gap-2"
                    >
                      <FaSignOutAlt size={20} />Log out
                    </button>

                  </div>
                )}
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