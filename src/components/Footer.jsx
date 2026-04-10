export default function Footer() {
  return (
    <footer className="relative border-t border-stone-800/50 bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 shadow-[0_0_20px_rgba(236,164,19,0.3)] transition-all duration-300">
          <svg className="w-6 h-6 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        </div>
        <p className="text-stone-500 text-sm font-sans tracking-wide">
          © 2026 Batch. All memories preserved forever.
        </p>
      </div>
    </footer>
  );
}
