import Image from "next/image";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowWork from "./components/HowWork";
export default function Home() {
  return (
   <main>
    <Navbar/>
    <Hero />
    <HowWork />
   </main>
  
  );
}
