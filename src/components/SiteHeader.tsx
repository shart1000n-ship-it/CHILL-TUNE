import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold" aria-label="CHILL & TUNE home">
          CHILL & TUNE
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link href="/radio" className="hover:underline">Radio</Link>
        </nav>
      </div>
    </header>
  );
}


