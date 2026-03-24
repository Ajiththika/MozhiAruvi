import Button from "./common/Button";

export default function InteractiveLessons() {
  return (
    <section id="lessons" className="section-spacing bg-slate-50">
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          
          {/* Left Column */}
          <div className="flex-1 space-y-10">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-12 rounded-full bg-primary" />
              <label>Interactive Lessons</label>
            </div>
            <h1>
              Every Lesson Has Voice Practice
            </h1>
            <p className="text-lg md:text-xl">
              Each lesson includes listening exercises, pronunciation practice where you speak the words, quizzes, and progression. Level up as you learn.
            </p>

            <ul className="space-y-6">
              {[
                "Smart pronunciation tools in every lesson",
                "Listen to native speaker audio",
                "Game-style quizzes with rewards",
                "Ask a tutor when you're stuck",
                "50 free credits to get started"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-700 font-bold italic tracking-tight">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6">
              <Button 
                href="/auth/signup" 
                variant="primary"
                size="xl"
                className="w-full sm:w-auto"
              >
                Go to Lessons <span>&rarr;</span>
              </Button>
            </div>
          </div>

          {/* Right Column (Mock UI Card) */}
          <div className="flex-1 w-full max-w-xl">
            <div className="card-premium p-10 md:p-14 border border-white shadow-2xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-10">
                <label className="text-slate-400">Pronunciation practice</label>
                <span className="text-[10px] font-extrabold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-widest border border-primary/10">Level 02</span>
              </div>

              <div className="text-center mb-12">
                <h2 className="text-6xl md:text-8xl font-black text-primary mb-6 drop-shadow-sm tracking-tighter">வணக்கம்</h2>
                <p className="text-2xl font-bold text-slate-900">Vannakkam — Hello</p>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Accuracy Score</span>
                    <span className="text-primary">75%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50 p-0.5">
                    <div className="h-full bg-primary rounded-full w-[75%] shadow-[0_0_12px_rgba(42,87,148,0.3)]"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Practice Block 1 */}
                <div className="flex items-center justify-between p-6 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.686 2 6 4.686 6 8v5H4v4h2v1c0 1.103.897 2 2 2h2v-2H8v-1h4v1.5a2.5 2.5 0 01-5 0h-2a4.5 4.5 0 009 0V8c0-2.206-1.794-4-4-4z"/><path d="M16 13h2v4h-2zM16 8c0-2.206-1.794-4-4-4v2c1.103 0 2 .897 2 2v5h-2v4h2c1.103 0 2-.897 2-2v-1h2v-4h-2V8z"/></svg>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Listen & Repeat</div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-tight">Hear the word, then say it</div>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center bg-white shadow-inner">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Practice Block 2 */}
                <div className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors duration-500">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Spell It Out</div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-tight">Practice each letter</div>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-slate-200 bg-slate-50"></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

