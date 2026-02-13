import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, X, FileText, Calendar, User as UserIcon, Mail } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { User, Assignment, FileInfo } from '@/types';
import { PLATFORMS, ASSIGNMENT_TYPES } from '@/data/constants';

interface SubmitAssignmentPageProps {
  user: User | null;
  onBack: () => void;
  onSubmit: (assignment: Assignment) => void;
  onLogin: () => void;
}

export function SubmitAssignmentPage({ user, onBack, onSubmit, onLogin }: SubmitAssignmentPageProps) {
  const [assignmentType, setAssignmentType] = useState('');
  const [courseName, setCourseName] = useState('');
  const [className, setClassName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [platform, setPlatform] = useState('');
  const [platformContact, setPlatformContact] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isPaid, setIsPaid] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      const newFiles: FileInfo[] = Array.from(uploadedFiles).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handlePayment = () => {
    // Simulate payment - in real app, integrate Stripe/Paystack
    setIsPaid(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onLogin();
      return;
    }

    const assignment: Assignment = {
      id: `assignment_${Date.now()}`,
      userId: user.id,
      courseName,
      className,
      teacherName,
      dueDate,
      platform: `${platform} (${platformContact})`,
      files,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      paymentId: `payment_${Date.now()}`,
    };

    onSubmit(assignment);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🦍</span>
            <span className="text-2xl font-bold text-gray-900">ApeAcademy</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Assignment</h1>
          <p className="text-gray-600 mb-8">Fill in the details to submit your assignment</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info Section */}
            {user && (
              <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/20 shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Name</div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium text-gray-900">{user.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Details */}
            <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/20 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="assignmentType">Assignment Type</Label>
                  <Select value={assignmentType} onValueChange={setAssignmentType}>
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input
                      id="courseName"
                      placeholder="e.g., Mathematics 101"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="className">Class</Label>
                    <Input
                      id="className"
                      placeholder="e.g., Grade 10A"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacherName">Teacher Name</Label>
                    <Input
                      id="teacherName"
                      placeholder="e.g., Prof. Smith"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about your assignment..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded-xl bg-gray-50 min-h-24"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Platform */}
            <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/20 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Platform</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="h-12 rounded-xl bg-gray-50">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="platformContact">Contact (Phone/Email/Username)</Label>
                  <Input
                    id="platformContact"
                    placeholder="e.g., +1234567890"
                    value={platformContact}
                    onChange={(e) => setPlatformContact(e.target.value)}
                    required
                    className="h-12 rounded-xl bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/20 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <div className="text-gray-900 font-medium mb-1">Click to upload files</div>
                  <div className="text-sm text-gray-500">PDF, DOCX, or images up to 10MB</div>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">{file.name}</div>
                          <div className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="backdrop-blur-xl bg-white/80 rounded-2xl border border-white/20 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment</h3>
              
              {!isPaid ? (
                <div className="text-center p-8">
                  <div className="text-3xl font-bold text-gray-900 mb-2">$49.99</div>
                  <div className="text-gray-600 mb-6">Assignment submission fee</div>
                  <Button
                    type="button"
                    onClick={handlePayment}
                    className="h-12 px-8 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    Pay Now (Mock)
                  </Button>
                  <p className="text-xs text-gray-500 mt-3">
                    Mock payment for demo purposes
                  </p>
                </div>
              ) : (
                <div className="text-center p-8 bg-green-50 rounded-xl">
                  <div className="text-4xl mb-3">✓</div>
                  <div className="font-semibold text-green-600 mb-1">Payment Successful</div>
                  <div className="text-sm text-gray-600">You can now submit your assignment</div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isPaid || !courseName || !className || !platform}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPaid ? 'Submit Assignment' : 'Complete Payment First'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
