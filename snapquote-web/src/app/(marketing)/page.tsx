"use client";

import dynamic from "next/dynamic";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Solution from "@/components/sections/Solution";
import Features from "@/components/sections/Features";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";

// WebGL never renders on the server — the canvas mounts client-side only,
// behind the HTML overlay.
const Experience = dynamic(() => import("@/components/canvas/Experience"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Experience />
      <Nav />
      <main className="relative">
        <Hero />
        <Solution />
        <Features />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
