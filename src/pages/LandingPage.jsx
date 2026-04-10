import { useNavigate } from 'react-router-dom';

export default function LandingPage({ onSignIn }) {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/journey');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-stone-950">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-gold-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Student Login button - top right */}
      <button
        onClick={onSignIn}
        className="absolute top-6 right-6 md:right-8 px-5 py-2 text-xs font-semibold tracking-[0.2em] uppercase border border-stone-700 rounded-full text-stone-300 hover:border-gold-500 hover:text-gold-500 transition-all duration-300 z-10"
      >
        Student Login
      </button>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        {/* Glowing Logo */}
        <div 
          className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-6 rounded-full bg-gold-500/10 border border-gold-500/30 shadow-[0_0_30px_rgba(236,164,19,0.3)] hover:shadow-[0_0_40px_rgba(236,164,19,0.5)] transition-all duration-700 opacity-0 animate-fade-in" 
          style={{ animationDelay: '0.1s' }}
        >
          <svg className="w-8 h-8 md:w-10 md:h-10 text-gold-500 drop-shadow-[0_0_8px_rgba(236,164,19,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        </div>

        {/* Cursive tagline */}
        <p
          className="font-handwriting text-gold-500 text-2xl md:text-3xl mb-6 opacity-0 animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          A Journey We'll Always Carry
        </p>

        {/* Main title */}
        <h1
          className="font-serif text-5xl md:text-7xl lg:text-9xl font-bold text-stone-100 leading-[0.9] tracking-tight mb-8 opacity-0 animate-fade-in"
          style={{ animationDelay: '0.7s' }}
        >
          Batch{' '}
          <span className="text-gold-500 italic">2022</span>
          <span className="text-stone-400 font-light">—</span>26
        </h1>

        {/* Gold divider */}
        <div
          className="w-24 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent mx-auto mb-8 opacity-0 animate-fade-in"
          style={{ animationDelay: '1s' }}
        />

        {/* Subtitle */}
        <p
          className="text-stone-400 font-light text-sm md:text-base max-w-lg mx-auto leading-relaxed mb-16 opacity-0 animate-fade-in"
          style={{ animationDelay: '1.2s' }}
        >
          Four years of laughter, late nights, and lessons learned. Join us as
          we look back on the moments that defined us.
        </p>

        {/* CTA Button */}
        <div
          className="opacity-0 animate-fade-in cursor-pointer"
          style={{ animationDelay: '1.5s' }}
          onClick={handleStart}
        >
          <p className="text-stone-500 text-xs tracking-[0.3em] uppercase mb-6 hover:text-stone-300 transition-colors duration-500">
            Click to Start the Journey
          </p>
          <div className="flex flex-col items-center gap-1 animate-bounce">
            <div className="w-px h-8 bg-gradient-to-b from-stone-500 to-transparent" />
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-950 to-transparent pointer-events-none" />
    </div>
  );
}
