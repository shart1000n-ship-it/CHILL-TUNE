import { Suspense } from "react";
// Logo uses a plain <img> to avoid SVG optimization issues
import RadioClient from "./radio-client";

export const dynamicParams = true;

export default function RadioPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'transparent' }}>
      {/* 4K Rainy Night Window Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 bg-slate-900" 
           style={{
             backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=4000&q=80&v=${Date.now()}')`,
             filter: 'brightness(0.4) contrast(1.2)',
             minHeight: '100vh',
             width: '100%'
           }}>
        {/* Rain drops overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-transparent to-slate-900/30"></div>
        
        {/* Window frame effect */}
        <div className="absolute inset-8 border-4 border-slate-600/50 rounded-2xl opacity-60"></div>
        <div className="absolute inset-12 border-2 border-slate-500/30 rounded-xl opacity-40"></div>
        
        {/* Moon/light source */}
        <div className="absolute top-12 right-12 w-20 h-20 bg-yellow-200/30 rounded-full blur-md"></div>
        <div className="absolute top-16 right-16 w-16 h-16 bg-yellow-100/40 rounded-full blur-lg"></div>
        
        {/* Rain drops animation */}
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-8 bg-blue-300/60 animate-pulse"
              style={{
                left: `${Math.random() * 2}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Content overlay */}
      <div className="relative z-20 px-4 py-8 max-w-6xl mx-auto text-white">
        <div className="w-full flex justify-center mb-4">
          <div className="relative" style={{ width: 240, height: 240 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 800 800" role="img" aria-label="CHILL & TUNE">
              <defs>
                <linearGradient id="g-rt" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1e293b"/>
                  <stop offset="100%" stopColor="#0f172a"/>
                </linearGradient>
                <filter id="sh-rt" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.3"/>
                </filter>
              </defs>
              <rect x="0" y="0" width="800" height="800" rx="48" fill="url(#g-rt)"/>
              <g filter="url(#sh-rt)">
                <circle cx="400" cy="320" r="160" fill="none" stroke="#3b82f6" strokeWidth="14" strokeOpacity="0.35"/>
                <circle cx="400" cy="320" r="118" fill="none" stroke="#60a5fa" strokeWidth="10" strokeOpacity="0.6"/>
                <circle cx="400" cy="320" r="6" fill="#60a5fa"/>
                <path d="M330 500h140c40 0 72 32 72 72v36H258v-36c0-40 32-72 72-72z" fill="#1e293b" fillOpacity="0.35" stroke="#60a5fa" strokeOpacity="0.35" strokeWidth="2"/>
                <rect x="280" y="560" width="240" height="20" rx="10" fill="#60a5fa"/>
                <rect x="280" y="590" width="90" height="18" rx="9" fill="#60a5fa" opacity="0.9"/>
                <rect x="430" y="590" width="90" height="18" rx="9" fill="#60a5fa" opacity="0.9"/>
              </g>
              <g>
                <text x="400" y="360" textAnchor="middle" fill="#ffffff" fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" fontWeight="800" fontSize="44" letterSpacing="1.5">CHILL & TUNE</text>
                <text x="400" y="400" textAnchor="middle" fill="#93c5fd" fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" fontWeight="600" fontSize="18" letterSpacing="3">HIP-HOP • R&amp;B</text>
              </g>
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">CHILL & TUNE — Pure Hip-Hop & R&B</h1>
        <p className="text-sm text-slate-300 mb-6">24/7 Non-stop Hip-Hop & R&B Vibes</p>
        {/* Live365 notice removed */}
        <Suspense fallback={<div>Loading player…</div>}>
          <RadioClient />
        </Suspense>
      </div>
    </div>
  );
}


