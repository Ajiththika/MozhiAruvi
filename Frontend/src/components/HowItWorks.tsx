import React from "react";

const steps = [
  {
    id: 1,
    title: "Register Free",
    description: "Sign up and get 50 credits instantly. Start learning right away.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Take Lessons",
    description: "Interactive lessons with voice practice, quizzes and pronunciation exercises.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Ask Tutors",
    description: "Stuck? Send a question to a tutor or book a private class for deeper help.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Go Premium",
    description: "When credits run out, upgrade to Premium for unlimited access to everything.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-spacing bg-white">
      <div className="container-wide">
        <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-1.5 w-12 rounded-full bg-primary" />
            <label>The Process</label>
            <span className="h-1.5 w-12 rounded-full bg-primary" />
          </div>
          <h2>
            Start Learning in 4 Simple Steps
          </h2>
          <p className="max-w-xl mx-auto">
            From registration to mastery—here's your journey to becoming fluent in Tamil.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className="card-premium group relative p-12 overflow-hidden border border-slate-50 shadow-xl shadow-slate-200/20"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 select-none">
                <span className="text-9xl font-extrabold text-primary">{step.id}</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-primary mb-8 transition-transform group-hover:scale-110 duration-500 shadow-sm border border-slate-100/50">
                  {step.icon}
                </div>
                <h3>{step.title}</h3>
                <p className="text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

