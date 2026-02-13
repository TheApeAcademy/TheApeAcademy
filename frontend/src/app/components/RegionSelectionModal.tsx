import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, GraduationCap, Building2, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { REGIONS, SCHOOL_LEVELS, DEPARTMENTS } from '@/data/constants';
import { UserPreferences } from '@/types';

interface RegionSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: UserPreferences) => void;
}

export function RegionSelectionModal({ isOpen, onClose, onComplete }: RegionSelectionModalProps) {
  const [step, setStep] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const handleComplete = () => {
    onComplete({
      region: selectedRegion,
      country: selectedCountry,
      schoolLevel: selectedLevel,
      department: selectedDepartment,
    });
    onClose();
  };

  const currentRegionCountries = REGIONS.find(r => r.region === selectedRegion)?.countries || [];
  const currentDepartments = DEPARTMENTS[selectedLevel] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Glass Card */}
              <div className="relative backdrop-blur-2xl bg-white/95 rounded-3xl border border-white/20 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {step === 1 && 'Select Region & Country'}
                    {step === 2 && 'Select School Level'}
                    {step === 3 && 'Select Department'}
                  </h2>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {step === 1 && (
                    <div className="space-y-6">
                      {REGIONS.map((regionData) => (
                        <div key={regionData.region} className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase tracking-wide">
                            <MapPin className="h-4 w-4" />
                            {regionData.region}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {regionData.countries.map((country) => (
                              <button
                                key={country}
                                onClick={() => {
                                  setSelectedRegion(regionData.region);
                                  setSelectedCountry(country);
                                }}
                                className={`p-4 rounded-xl text-left transition-all ${
                                  selectedCountry === country
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                                }`}
                              >
                                <div className="font-medium">{country}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-2 gap-4">
                      {SCHOOL_LEVELS.map((level) => (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`p-6 rounded-2xl text-left transition-all ${
                            selectedLevel === level
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                          }`}
                        >
                          <GraduationCap className="h-8 w-8 mb-3" />
                          <div className="font-semibold text-lg">{level}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid grid-cols-1 gap-3">
                      {currentDepartments.map((department) => (
                        <button
                          key={department}
                          onClick={() => setSelectedDepartment(department)}
                          className={`p-5 rounded-xl text-left transition-all flex items-center gap-3 ${
                            selectedDepartment === department
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                          }`}
                        >
                          <Building2 className="h-6 w-6" />
                          <div className="font-medium">{department}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-purple-500' : 'bg-gray-300'}`} />
                    <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-gray-300'}`} />
                    <div className={`h-2 w-12 rounded-full ${step >= 3 ? 'bg-purple-500' : 'bg-gray-300'}`} />
                  </div>

                  <div className="flex gap-3">
                    {step > 1 && (
                      <Button
                        onClick={() => setStep(step - 1)}
                        variant="outline"
                        className="rounded-xl"
                      >
                        Back
                      </Button>
                    )}
                    {step < 3 ? (
                      <Button
                        onClick={() => setStep(step + 1)}
                        disabled={
                          (step === 1 && !selectedCountry) ||
                          (step === 2 && !selectedLevel)
                        }
                        className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleComplete}
                        disabled={!selectedDepartment}
                        className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        Complete
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
