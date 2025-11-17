'use client';

import Link from 'next/link';

export default function CircleCalendarTeaser() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-md p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-[2px] bg-black/20 z-10 pointer-events-none" />
        
        <div className="relative z-0">
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
            Next Circle Session
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Sacred Masculinity Deep Dive
          </h2>
          
          <div className="flex items-center gap-2 text-xl text-gray-300 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Wednesday, Nov 20 • 7:00 PM GMT
          </div>
          
          <p className="text-gray-400 mb-6">
            Monthly gathering for men returning to their truth
          </p>
          
          <div className="bg-black/40 border border-gray-700 rounded-md px-4 py-3 mb-6 inline-block">
            <div className="text-sm text-gray-400">Starting in</div>
            <div className="text-2xl font-bold text-white">5 days, 3 hours</div>
          </div>
        </div>
        
        <div className="relative z-20 mt-8 text-center">
          <Link 
            href="/auth/register"
            className="inline-block bg-white text-black font-semibold py-4 px-8 rounded-md hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Join Circle to Access Full Schedule →
          </Link>
          <p className="text-gray-400 text-sm mt-4">
            Members get full calendar access + add to your personal calendar
          </p>
        </div>
      </div>
    </div>
  );
}
