import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { LandingPage } from '@/app/components/LandingPage';
import { RegionSelectionModal } from '@/app/components/RegionSelectionModal';
import { AuthModal } from '@/app/components/AuthModal';
import { HomePage } from '@/app/components/HomePage';
import { SubmitAssignmentPage } from '@/app/components/SubmitAssignmentPage';
import { SuccessPage } from '@/app/components/SuccessPage';
import { User, UserPreferences, Assignment } from '@/types';
import {
  getUser,
  saveUser,
  logout as logoutUser,
  getPreferences,
  savePreferences,
  saveAssignment,
  isAuthenticated,
} from '@/utils/storage';

type Page = 'landing' | 'home' | 'submit' | 'success';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Load user and preferences on mount
  useEffect(() => {
    if (isAuthenticated()) {
      const storedUser = getUser();
      const storedPreferences = getPreferences();
      if (storedUser) setUser(storedUser);
      if (storedPreferences) setPreferences(storedPreferences);
      // Auto-navigate to home if user is logged in
      setCurrentPage('home');
    }
  }, []);

  const handleAuth = (newUser: User, isSignup: boolean) => {
    saveUser(newUser);
    setUser(newUser);
    toast.success(isSignup ? 'Account created successfully!' : 'Welcome back!');
    setCurrentPage('home');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setShowProfile(false);
    toast.success('Logged out successfully');
    setCurrentPage('landing');
  };

  const handleRegionComplete = (prefs: UserPreferences) => {
    savePreferences(prefs);
    setPreferences(prefs);
    toast.success('Preferences saved!');
    setShowRegionModal(false);
    // Navigate to home after region selection
    if (currentPage === 'landing') {
      setCurrentPage('home');
    }
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    saveAssignment(assignment);
    setCurrentAssignment(assignment);
    setCurrentPage('success');
    toast.success('Assignment submitted successfully!');
  };

  const handleNavigateToSubmit = () => {
    if (!user) {
      setShowAuthModal(true);
      toast.info('Please log in to submit an assignment');
      return;
    }
    setCurrentPage('submit');
  };

  const handleNavigateToHome = () => {
    setCurrentPage('home');
    setCurrentAssignment(null);
  };

  return (
    <>
      <Toaster position="top-center" richColors />

      {/* Landing Page */}
      {currentPage === 'landing' && (
        <LandingPage
          onSubmitAssignment={handleNavigateToSubmit}
          onSelectRegion={() => setShowRegionModal(true)}
        />
      )}

      {/* Home Page */}
      {currentPage === 'home' && (
        <HomePage
          user={user}
          preferences={preferences}
          onSubmitAssignment={handleNavigateToSubmit}
          onSelectRegion={() => setShowRegionModal(true)}
          onLogin={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          showProfile={showProfile}
          setShowProfile={setShowProfile}
        />
      )}

      {/* Submit Assignment Page */}
      {currentPage === 'submit' && (
        <SubmitAssignmentPage
          user={user}
          onBack={handleNavigateToHome}
          onSubmit={handleSubmitAssignment}
          onLogin={() => setShowAuthModal(true)}
        />
      )}

      {/* Success Page */}
      {currentPage === 'success' && currentAssignment && (
        <SuccessPage
          assignment={currentAssignment}
          onBackToHome={handleNavigateToHome}
        />
      )}

      {/* Modals */}
      <RegionSelectionModal
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        onComplete={handleRegionComplete}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />

      {/* Click outside to close profile */}
      {showProfile && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowProfile(false)}
        />
      )}
    </>
  );
}