"use client";
import Image from "next/image";
import Link from "next/link";
const Hero = () => {
  const handleScroll = () => {
    // Scroll logic here
  };

  return (
    <div className="hero w-2/4 bg-[#ffffff]  text-black p-10 rounded-[13px] mx-auto my-5 ">
      {/* Flex container for layout */}
      <div className="flex items-center justify-between space-x-8">
        {/* Left Section: Text */}
        <div className="flex-1">
          <h1 className="text-5xl text-[#5e17eb] font-bold  before:font-bold mb-6">AI Car Damage Detection</h1>
          <p className="text-lg   mb-8">
            Our product detects damage using images, eliminating the need for
            physical inspections. It provides a comprehensive vehicle
            inspection system.
          </p>
          {/* Buttons */}
          <div className="flex space-x-4">
            {/* ปุ่ม Get Started */}

            {/* ปุ่ม AI Detection ที่โยงไปหน้า `/aicardamagedetect` */}
            <Link
              href="/AiCarDamgeDetection/Detecting"
              className="bg-[#5e17eb] text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg hover:bg-[#5e17eb79] transition duration-300"
            >
              Get Started
            </Link>
          </div>

        </div>

        <div className="flex-1 flex justify-end ">
          <div className="relative w-full max-w-[300px] h-auto">
            <Image
              src="/img/carhero.png"
              alt="Car Hero"
              width={300}
              height={200}
              className="object-contain w-full h-auto"
            />
          </div>

        </div>
      </div>
      {/* Right Section: Image */}


    </div>
  );
};

export default Hero;