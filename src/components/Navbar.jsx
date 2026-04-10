import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { uploadMyPhoto } from '../utils/auth';

export default function Navbar({ onSignIn, user, onSignOut, userPhoto, onPhotoUploaded }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef(null);

  const navLinks = [
    { to: '/journey', label: 'The Journey' },
    { to: '/yearbook', label: 'Yearbook' },
    { to: '/media', label: 'Media Vault' },
    { to: '/wall', label: 'The Wall' },
  ];

  const isActive = (path) => location.pathname === path;

  const initials = user ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '';

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadMsg('❌ Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadMsg('❌ Image must be under 5MB.');
      return;
    }

    setUploading(true);
    setUploadMsg('');
    const result = await uploadMyPhoto(file);
    setUploading(false);

    if (result.success) {
      setUploadMsg('✅ Photo uploaded!');
      onPhotoUploaded?.();
      setTimeout(() => setUploadMsg(''), 2000);
    } else {
      setUploadMsg(`❌ ${result.error}`);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-stone-950/90 backdrop-blur-md border-b border-stone-800/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gold-500/10 border border-gold-500/30 shadow-[0_0_15px_rgba(236,164,19,0.3)] group-hover:shadow-[0_0_25px_rgba(236,164,19,0.5)] transition-all duration-300">
            <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <span className="font-serif font-bold text-lg text-stone-100 tracking-tight ml-1">
            Batch '26
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium tracking-wide transition-colors duration-300 ${
                isActive(link.to)
                  ? 'text-gold-500'
                  : 'text-stone-400 hover:text-stone-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-700 hover:border-gold-500/50 transition-all duration-300"
              >
                {/* Avatar - shows photo or initials */}
                <div className="w-7 h-7 rounded-full overflow-hidden bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                  {userPhoto ? (
                    <img src={userPhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gold-500 text-xs font-bold">{initials}</span>
                  )}
                </div>
                <span className="hidden sm:block text-stone-300 text-sm font-medium max-w-[120px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <svg className={`w-4 h-4 text-stone-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-72 bg-stone-900/95 backdrop-blur-xl border border-stone-700/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                    {/* User Info with Photo */}
                    <div className="p-4 border-b border-stone-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-800 flex items-center justify-center flex-shrink-0 border border-stone-700">
                          {userPhoto ? (
                            <img src={userPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-stone-500 font-serif text-lg font-bold">{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-stone-100 font-serif text-sm font-semibold truncate">{user.name}</p>
                          <p className="text-stone-500 text-xs truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gold-500 text-xs font-semibold">{user.major}</span>
                            {user.rollNo && (
                              <>
                                <span className="text-stone-600">•</span>
                                <span className="text-stone-500 text-xs font-mono">{user.rollNo}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upload Photo Button */}
                    <div className="border-b border-stone-800/50">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full text-left px-4 py-3 text-sm text-stone-300 hover:bg-stone-800/50 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin text-gold-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-gold-500">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {userPhoto ? 'Change Yearbook Photo' : 'Upload Yearbook Photo'}
                          </>
                        )}
                      </button>
                      {uploadMsg && (
                        <p className="px-4 pb-2 text-xs text-stone-400">{uploadMsg}</p>
                      )}
                    </div>

                    {/* Admin Link */}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-4 py-3 text-sm text-gold-500 hover:bg-stone-800/50 transition-all flex items-center gap-2 border-b border-stone-800/50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}

                    {/* Sign Out */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-stone-400 hover:text-red-400 hover:bg-stone-800/50 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="px-5 py-1.5 text-sm font-semibold tracking-wider uppercase border border-stone-700 rounded-full text-stone-200 hover:border-gold-500 hover:text-gold-500 transition-all duration-300"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-stone-400 hover:text-stone-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-stone-950/95 backdrop-blur-xl border-t border-stone-800/50 px-4 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block text-sm font-medium tracking-wide ${
                isActive(link.to) ? 'text-gold-500' : 'text-stone-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
