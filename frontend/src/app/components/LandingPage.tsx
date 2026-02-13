import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface LandingPageProps {
  onSubmitAssignment: () => void;
  onSelectRegion: () => void;
}

export function LandingPage({ onSubmitAssignment, onSelectRegion }: LandingPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background with blur */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1670387242992-e2408eb3eeca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhYnN0cmFjdCUyMGdyYWRpZW50JTIwYmx1cnxlbnwxfHx8fDE3Njk5MTQxMDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 backdrop-blur-3xl bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col p-6 md:p-12">
        {/* Large Glass Block - 75% */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex-[0.75] mb-6"
        >
          <div className="relative h-full backdrop-blur-2xl bg-white/10 rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/5 pointer-events-none"></div>

            {/* Content Container */}
            <div className="relative h-full flex flex-col p-8 md:p-12 lg:p-16">
              {/* Logo at Top */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex justify-center mb-8"
              >
                <div className="text-8xl md:text-9xl">🦍</div>
              </motion.div>

              {/* Middle Content - About ApeAcademy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex-1 flex flex-col justify-center text-center space-y-8 max-w-4xl mx-auto"
              >
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    Where Excellence Meets
                    <span className="block bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                      Academic Success
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed">
                    Experience premium assignment assistance delivered with unmatched quality and sophistication
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
                  >
                    <div className="text-4xl mb-3">⚡</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                    <p className="text-white/70 text-sm">
                      Rapid turnaround without compromising quality
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
                  >
                    <div className="text-4xl mb-3">💎</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Premium Quality</h3>
                    <p className="text-white/70 text-sm">
                      Luxury-grade assignments that exceed expectations
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
                  >
                    <div className="text-4xl mb-3">🌍</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Global Reach</h3>
                    <p className="text-white/70 text-sm">
                      Supporting students across continents and time zones
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="pt-4"
                >
                  <p className="text-white/60 text-sm md:text-base italic">
                    "Elevating academic performance through innovation, dedication, and premium service excellence"
                  </p>
                </motion.div>
              </motion.div>

              {/* ApeAcademy Text at Bottom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-center pt-8"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                  ApeAcademy
                </h1>
                <p className="text-white/70 text-lg md:text-xl mt-2">
                  Premium Student Assignment Platform
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Select Region Button - 25% */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex-[0.25] flex items-center justify-center"
        >
          <div className="w-full max-w-2xl">
            <button
              onClick={onSelectRegion}
              className="group w-full h-full min-h-[120px] backdrop-blur-2xl bg-white/10 rounded-[2rem] border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_80px_rgba(255,255,255,0.2)]"
            >
              <div className="relative h-full flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                    Select Your Region
                  </span>
                  <ChevronRight className="h-8 w-8 md:h-10 md:w-10 text-white group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}