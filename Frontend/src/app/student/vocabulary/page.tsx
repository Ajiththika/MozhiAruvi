import React from "react";
import { Search, Volume2, Bookmark, BookmarkCheck, PlayCircle, Book } from "lucide-react";

const VOCAB_MOCK = [
  { id: "1", tamil: "வணக்கம்", transliteration: "Vanakkam", english: "Hello / Greetings", saved: true, category: "Greetings" },
  { id: "2", tamil: "நன்றி", transliteration: "Nandri", english: "Thank you", saved: false, category: "Greetings" },
  { id: "3", tamil: "எப்படி இருக்கீங்க?", transliteration: "Eppadi irukkeenga?", english: "How are you?", saved: true, category: "Questions" },
  { id: "4", tamil: "என் பெயர்", transliteration: "En peyar", english: "My name is", saved: false, category: "Introduction" },
  { id: "5", tamil: "நான்", transliteration: "Naan", english: "Iam / I", saved: true, category: "Pronouns" },
  { id: "6", tamil: "அம்மா", transliteration: "Amma", english: "Mother", saved: false, category: "Family" },
  { id: "7", tamil: "அப்பா", transliteration: "Appa", english: "Father", saved: false, category: "Family" },
];

export default function StudentVocabularyPage() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
         <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-600">
               My Vocabulary 📚
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-600">
               Words and phrases you've unlocked from lessons.
            </p>
         </div>
         <button className="flex items-center gap-2 rounded-xl bg-mozhi-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-mozhi-primary">
             <PlayCircle className="h-4 w-4" />
             Practice Flashcards
         </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
          <input
            type="text"
            placeholder="Search Tamil or English meaning..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-600 focus:border-mozhi-primary focus:ring-2 focus:ring-mozhi-primary/20 dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600 dark:focus:border-mozhi-primary"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
           {["All", "Saved", "Greetings", "Questions", "Family"].map((cat, i) => (
             <button
               key={cat}
               className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                 i === 0 
                   ? "bg-slate-50 text-white border-slate-200 dark:bg-slate-50 dark:text-slate-600 dark:border-slate-200" 
                   : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-50 dark:text-slate-600 dark:border-slate-200 dark:hover:bg-slate-50"
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {VOCAB_MOCK.map((word) => (
          <div
            key={word.id}
            className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-200 dark:bg-slate-50"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="mb-2 inline-block rounded-md bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-50 dark:text-slate-600">
                  {word.category}
                </span>
                <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-600 font-tamil">
                  {word.tamil}
                </h3>
                <p className="mt-1 text-sm text-mozhi-primary dark:text-mozhi-secondary font-medium">
                  {word.transliteration}
                </p>
              </div>
              <button className="text-slate-600 transition-colors hover:text-mozhi-primary dark:text-slate-600 dark:hover:text-mozhi-secondary">
                 {word.saved ? (
                    <BookmarkCheck className="h-5 w-5 fill-blue-600 text-mozhi-primary dark:fill-blue-500 dark:text-mozhi-secondary" />
                 ) : (
                    <Bookmark className="h-5 w-5" />
                 )}
              </button>
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-slate-200 pt-4 dark:border-slate-200">
              <p className="text-base text-slate-600 dark:text-slate-600">
                {word.english}
              </p>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-colors hover:bg-mozhi-light/50 hover:text-mozhi-primary dark:bg-slate-50 dark:text-slate-600 dark:hover:bg-mozhi-primary/20 dark:hover:text-mozhi-secondary">
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Practice CTA Card */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-mozhi-light bg-mozhi-light/50/50 p-6 text-center dark:border-blue-900/30 dark:bg-mozhi-dark/50">
           <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mozhi-light dark:bg-mozhi-primary/20">
              <Book className="h-6 w-6 text-mozhi-primary dark:text-mozhi-secondary" />
           </div>
           <h3 className="mt-4 text-lg font-semibold text-slate-600 dark:text-slate-600">Master 7 Words</h3>
           <p className="mt-1 text-sm text-slate-600 dark:text-slate-600">
              You are ready for a quick flashcard review session.
           </p>
           <button className="mt-4 rounded-lg bg-mozhi-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-mozhi-primary">
              Start Quiz
           </button>
        </div>
      </div>
    </div>
  );
}