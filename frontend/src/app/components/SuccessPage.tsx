import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Assignment } from '@/types';

interface SuccessPageProps {
  assignment: Assignment;
  onBackToHome: () => void;
}

export function SuccessPage({ assignment, onBackToHome }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl"
      >
        <div className="backdrop-blur-xl bg-white/90 rounded-3xl border border-white/20 shadow-2xl p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', duration: 0.6 }}
            className="mb-6"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 mb-3"
          >
            Assignment Submitted!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 mb-8"
          >
            Your assignment has been successfully submitted and will be delivered via {assignment.platform.split(' ')[0]}
          </motion.p>

          {/* Assignment Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8"
          >
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Course:</span>
                <span className="font-semibold text-gray-900">{assignment.courseName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Class:</span>
                <span className="font-semibold text-gray-900">{assignment.className}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Teacher:</span>
                <span className="font-semibold text-gray-900">{assignment.teacherName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Files:</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {assignment.files.length}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8"
          >
            <p className="text-sm text-blue-900">
              📱 You will receive your completed assignment via {assignment.platform.split(' ')[0]} within 24-48 hours. We'll notify you once it's ready!
            </p>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              onClick={onBackToHome}
              size="lg"
              className="h-14 px-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg font-semibold"
            >
              Back to Home
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-sm text-gray-500"
          >
            Thank you for using ApeAcademy! 🦍
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
