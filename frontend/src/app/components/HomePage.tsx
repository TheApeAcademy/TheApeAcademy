import { motion } from 'motion/react';
import { User as UserIcon, MapPin, GraduationCap, FileText, LogOut, Settings } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { User, UserPreferences } from '@/types';

interface HomePageProps {
  user: User | null;
  preferences: UserPreferences | null;
  onSubmitAssignment: () => void;
  onSelectRegion: () => void;
  onLogin: () => void;
  onLogout: () => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
}

export function HomePage({
  user,
  preferences,
  onSubmitAssignment,
  onSelectRegion,
  onLogin,
  onLogout,
  showProfile,
  setShowProfile,
}: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🦍</span>
            <span className="text-2xl font-bold text-gray-900">ApeAcademy</span>
          </div>

          <button
            onClick={() => (user ? setShowProfile(!showProfile) : onLogin())}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <UserIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Profile Dropdown */}
      {showProfile && user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-6 z-50"
        >
          <div className="backdrop-blur-2xl bg-white/95 rounded-2xl border border-white/20 shadow-xl p-4 w-64">
            <div className="space-y-3">
              <div className="pb-3 border-b border-gray-200">
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
              <Button
                onClick={onLogout}
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Preferences Card */}
        {preferences && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/80 rounded-3xl border border-white/20 shadow-lg p-8 mb-8"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Location</div>
                  <div className="font-semibold text-gray-900">{preferences.country}</div>
                  <div className="text-xs text-gray-500">{preferences.region}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">School Level</div>
                  <div className="font-semibold text-gray-900">{preferences.schoolLevel}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Department</div>
                  <div className="font-semibold text-gray-900">{preferences.department}</div>
                </div>
              </div>
            </div>

            <Button
              onClick={onSelectRegion}
              variant="outline"
              className="mt-6 rounded-xl"
            >
              <Settings className="h-4 w-4 mr-2" />
              Update Preferences
            </Button>
          </motion.div>
        )}

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Submit Your Assignment
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional, fast, and reliable assignment submission service
          </p>

          <Button
            onClick={onSubmitAssignment}
            size="lg"
            className="h-16 px-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Submit Assignment Now
          </Button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: '⚡',
              title: 'Fast Delivery',
              description: 'Get your assignments delivered quickly',
            },
            {
              icon: '🔒',
              title: 'Secure Payment',
              description: 'Safe and encrypted payment process',
            },
            {
              icon: '💎',
              title: 'Premium Quality',
              description: 'High-quality work guaranteed',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/20 shadow-lg p-8 text-center hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Section */}
        {!preferences && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-200 p-8 text-center"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Get Started Today
            </h3>
            <p className="text-gray-600 mb-6">
              Select your region and preferences to personalize your experience
            </p>
            <Button
              onClick={onSelectRegion}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Select Region Now
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
