import { useState } from 'react';
import { signIn, requestAccess } from '../utils/auth';

export default function AuthModal({ isOpen, onClose, initialView = 'signin', onAuthSuccess }) {
  const [view, setView] = useState(initialView);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    major: 'IT',
    rollNo: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', major: 'IT', rollNo: '' });
    setError('');
    setSuccess('');
  };

  const switchView = (v) => {
    setView(v);
    resetForm();
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const result = await signIn({ email: formData.email, password: formData.password });
    setLoading(false);

    if (result.success) {
      setSuccess(`Welcome back, ${result.user.name}!`);
      setTimeout(() => {
        onAuthSuccess?.(result.user);
        onClose();
        resetForm();
      }, 1200);
    } else {
      setError(result.error);
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const result = await requestAccess(formData);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      // Don't close modal - let user see the success message and switch to sign in
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => { onClose(); resetForm(); }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-stone-900/90 backdrop-blur-xl border border-stone-700/50 rounded-2xl p-8 shadow-2xl shadow-black/50">
        {/* Close Button */}
        <button
          onClick={() => { onClose(); resetForm(); }}
          className="absolute top-4 right-4 text-stone-500 hover:text-stone-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
            {view === 'register' && (
              <button
                onClick={() => switchView('signin')}
                className="mt-1 text-gold-500 hover:underline text-xs font-medium"
              >
                → Go to Sign In
              </button>
            )}
          </div>
        )}

        {view === 'signin' ? (
          /* Sign In View */
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-serif text-gold-500 mb-2">Welcome Back</h2>
              <p className="text-stone-400 text-sm">Sign in to access your digital yearbook</p>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500 transition-all disabled:opacity-50"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500 transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold-500/90 hover:bg-gold-400 text-stone-900 font-semibold rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(236,164,19,0.4)] hover:shadow-[0_4px_30px_rgba(236,164,19,0.6)] disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing In...
                </>
              ) : 'Sign In'}
            </button>

            <p className="text-center text-sm text-stone-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchView('register')}
                className="text-gold-500 hover:underline font-medium"
              >
                Request Access
              </button>
            </p>
          </form>
        ) : (
          /* Register / Request Access View */
          <form onSubmit={handleRequestAccess} className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-serif text-gold-500 mb-2">Request Access</h2>
              <p className="text-stone-400 text-sm">Your request will be reviewed by the admin</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleChange}
                disabled={loading || !!success}
                className="px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500 transition-all disabled:opacity-50"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || !!success}
                className="px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500 transition-all disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                name="major"
                value={formData.major}
                onChange={handleChange}
                disabled={loading || !!success}
                className="px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500 transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="CSE(AIDS)">CSE(AIDS)</option>
                <option value="CSE(CYBER)">CSE(CYBER)</option>
                <option value="MECH">MECH</option>
                <option value="EC">EC</option>
                <option value="EX">EX</option>
              </select>
              <input
                type="text"
                name="rollNo"
                placeholder="Roll Number (22R21..)"
                value={formData.rollNo}
                onChange={handleChange}
                disabled={loading || !!success}
                className="px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500 transition-all disabled:opacity-50"
              />
            </div>

            <input
              type="password"
              name="password"
              placeholder="Create Password *"
              value={formData.password}
              onChange={handleChange}
              disabled={loading || !!success}
              className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/80 rounded-lg text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500 transition-all disabled:opacity-50"
            />

            {!success && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gold-500/90 hover:bg-gold-400 text-stone-900 font-semibold rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(236,164,19,0.4)] hover:shadow-[0_4px_30px_rgba(236,164,19,0.6)] disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : 'Request Access'}
              </button>
            )}

            <p className="text-center text-sm text-stone-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchView('signin')}
                className="text-gold-500 hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
