import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PublicLessonsClient from "./PublicLessonsClient";

async function getPublicLessonsData() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${url}/lessons`, { 
      next: { revalidate: 3600 } 
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.lessons || [];
  } catch(e) {
    return [];
  }
}

export default async function PublicLessonsPage() {
  const lessons = await getPublicLessonsData();

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 md:py-20 animate-in fade-in duration-700">
         <PublicLessonsClient initialLessons={lessons} />
      </main>
      <Footer />
    </div>
  );
}
