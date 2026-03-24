import React from "react";

const features = [
  {
    id: 1,
    title: "Expert-Crafted Curriculum",
    description: "Lessons designed by Tamil scholars with decades of teaching experience.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21l9-5-9-5-9 5 9 5v-5z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Audio & Spoken Practice",
    description: "Listen to native speakers and practice pronunciation in every lesson.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "One-on-One Tutor Support",
    description: "Stuck on a lesson? Ask a tutor directly or book a private class.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "50 Free Credits to Start",
    description: "Every new learner gets 50 credits free. No credit card needed.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: "Gamified Experience",
    description: "Earn XP, build streaks, and unlock lessons like a game.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 6,
    title: "Community & Events",
    description: "Join cultural events, poetry nights, and connect with Tamil enthusiasts.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section-spacing bg-white">
      <div className="container-wide">
        <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-1.5 w-12 rounded-full bg-primary" />
            <label>Why choose us</label>
            <span className="h-1.5 w-12 rounded-full bg-primary" />
          </div>
          <h2>
            Why Learners Love Mozhi Aruvi
          </h2>
          <p className="max-w-xl mx-auto">
            We're not just another language app. We bring the soul of Tamil to your screen through authentic experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="card-premium p-10 flex flex-col items-start gap-4 border border-slate-50 transition-all duration-500 group hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-primary mb-6 transition-all duration-500 group-hover:bg-slate-900 group-hover:text-white group-hover:scale-110 shadow-sm border border-slate-100/50">
                {feature.icon}
              </div>
              <h3>
                {feature.title}
              </h3>
              <p className="text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

