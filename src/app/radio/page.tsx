import { Suspense } from "react";
// Logo uses a plain <img> to avoid SVG optimization issues
import RadioClient from "./radio-client";

export const dynamicParams = true;

export default function RadioPage() {
  return (
    <div className="min-h-screen bg-purple-700">
      <div className="px-4 py-8 max-w-6xl mx-auto text-white">
        <div className="w-full flex justify-center mb-4">
          <div className="relative" style={{ width: 240, height: 240 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 800 800" role="img" aria-label="CHILL & TUNE">
              <defs>
                <linearGradient id="g-rt" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6d28d9"/>
                  <stop offset="100%" stopColor="#a855f7"/>
                </linearGradient>
                <filter id="sh-rt" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.3"/>
                </filter>
              </defs>
              <rect x="0" y="0" width="800" height="800" rx="48" fill="url(#g-rt)"/>
              <g filter="url(#sh-rt)">
                <circle cx="400" cy="320" r="160" fill="none" stroke="#fff" strokeWidth="14" strokeOpacity="0.35"/>
                <circle cx="400" cy="320" r="118" fill="none" stroke="#fff" strokeWidth="10" strokeOpacity="0.6"/>
                <circle cx="400" cy="320" r="6" fill="#fff"/>
                <path d="M330 500h140c40 0 72 32 72 72v36H258v-36c0-40 32-72 72-72z" fill="#1f1341" fillOpacity="0.35" stroke="#fff" strokeOpacity="0.35" strokeWidth="2"/>
                <rect x="280" y="560" width="240" height="20" rx="10" fill="#fff"/>
                <rect x="280" y="590" width="90" height="18" rx="9" fill="#fff" opacity="0.9"/>
                <rect x="430" y="590" width="90" height="18" rx="9" fill="#fff" opacity="0.9"/>
              </g>
              <g>
                <text x="400" y="360" textAnchor="middle" fill="#ffffff" fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" fontWeight="800" fontSize="44" letterSpacing="1.5">CHILL & TUNE</text>
                <text x="400" y="400" textAnchor="middle" fill="#e9d5ff" fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" fontWeight="600" fontSize="18" letterSpacing="3">HIP-HOP • R&amp;B</text>
              </g>
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">CHILL & TUNE — Hip-Hop & R&B</h1>
        <p className="text-sm text-white/90 mb-6">Non-stop Hip-Hop & R&B</p>
        {/* Live365 notice removed */}
        <Suspense fallback={<div>Loading player…</div>}>
          <RadioClient />
        </Suspense>
      </div>
    </div>
  );
}


