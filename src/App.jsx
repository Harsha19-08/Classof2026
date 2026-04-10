import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import JourneyPage from './pages/JourneyPage';
import YearbookPage from './pages/YearbookPage';
import MediaVaultPage from './pages/MediaVaultPage';
import WallPage from './pages/WallPage';
import AdminPage from './pages/AdminPage';
import { getCurrentUser, signOut, verifySession, getAllStudentPhotos } from './utils/auth';

function AppContent() {
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState('signin');
  const [user, setUser] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  // Load user from localStorage on mount and verify session
  useEffect(() => {
    const cached = getCurrentUser();
    if (cached) setUser(cached);

    verifySession().then((verified) => {
      if (verified) setUser(verified);
      else if (cached) setUser(null);
    });
  }, []);

  // Load user's own photo when user changes
  useEffect(() => {
    if (user?.rollNo) {
      loadUserPhoto(user.rollNo);
    } else {
      setUserPhoto(null);
    }
  }, [user]);

  const loadUserPhoto = async (rollNo) => {
    const photos = await getAllStudentPhotos();
    setUserPhoto(photos[rollNo?.toUpperCase()] || null);
  };

  const handleSignIn = (view = 'signin') => {
    setAuthView(view);
    setShowAuth(true);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
    setUserPhoto(null);
  };

  const handlePhotoUploaded = () => {
    if (user?.rollNo) loadUserPhoto(user.rollNo);
  };

  return (
    <div className="relative min-h-screen bg-stone-950 text-stone-100">
      {!isLanding && (
        <Navbar
          onSignIn={() => handleSignIn('signin')}
          user={user}
          onSignOut={handleSignOut}
          userPhoto={userPhoto}
          onPhotoUploaded={handlePhotoUploaded}
        />
      )}

      <main>
        <Routes>
          <Route path="/" element={<LandingPage onSignIn={() => handleSignIn('signin')} />} />
          <Route path="/journey" element={<JourneyPage user={user} />} />
          <Route path="/yearbook" element={<YearbookPage user={user} />} />
          <Route path="/media" element={<MediaVaultPage user={user} />} />
          <Route path="/wall" element={<WallPage user={user} />} />
          <Route path="/admin" element={<AdminPage user={user} />} />
        </Routes>
      </main>

      {!isLanding && <Footer />}

      <div className="bg-grain" />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        initialView={authView}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
