import type { Metadata } from "next";
import {  Urbanist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Header from "@/components/header";

const urbanist = Urbanist({
 
  subsets: ["latin"],
});
;
export const metadata: Metadata = {
  title: "David Saenz - Portfolio",
  keywords: [
    "David Saenz",
    "Portfolio",
    "Web Developer",
    "Software Engineer",
    "Full Stack Developer",
    "Next.js",
    "React",
    "JavaScript",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "Express",
    "MongoDB",
  ],
  description: "Get to know David Saenz, a passionate web developer with expertise in Next.js, React, and full-stack development. Explore my portfolio showcasing innovative projects and skills in modern web technologies.",
};

import { LanguageProvider } from "@/context/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${urbanist.className} antialiased`}>
       <LanguageProvider>
        <Navbar />
        <Header />
         {children}
       </LanguageProvider>
      </body>
    </html>
  );
}
