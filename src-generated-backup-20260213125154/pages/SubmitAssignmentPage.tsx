import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssignments } from '../hooks/useAssignments';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Common/Button';
import { Input } from '../components/Common/Input';

export const SubmitAssignmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createAssignment, isLoading } = useAssignments();

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    educationLevel: '',
    departmentOrCourse: '',
    deadline: '',
    deliveryPlatform: 'email',
    file: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    if (!formData.file) newErrors.file = 'File is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const form = new FormData();
      form.append('subject', formData.subject);
      form.append('description', formData.description);
      form.append('educationLevel', formData.educationLevel);
      form.append('departmentOrCourse', formData.departmentOrCourse || '');
      form.append('deadline', formData.deadline);
      form.append('deliveryPlatform', formData.deliveryPlatform);
      if (formData.file) {
        form.append('file', formData.file);
      }

      await createAssignment(form);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button variant="secondary" onClick={() => navigate('/dashboard')} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Submit Assignment</h1>
          <p className="text-gray-600 mt-2">Fill in the details of your assignment below</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              error={errors.subject}
              placeholder="e.g., Mathematics Assignment"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your assignment..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.educationLevel ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select level</option>
                  <option value="highschool">High School</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="graduate">Graduate</option>
                  <option value="professional">Professional</option>
                </select>
                {errors.educationLevel && <p className="text-red-500 text-sm mt-1">{errors.educationLevel}</p>}
              </div>

              <Input
                label="Department/Course (Optional)"
                type="text"
                name="departmentOrCourse"
                value={formData.departmentOrCourse}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
              />
            </div>

            <Input
              label="Deadline"
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Platform <span className="text-red-500">*</span>
              </label>
              <select
                name="deliveryPlatform"
                value={formData.deliveryPlatform}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="google_messages">Google Messages</option>
                <option value="imessage">iMessage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.file ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="text-sm text-gray-500 mt-1">Max file size: 50MB</p>
              {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
              {formData.file && <p className="text-green-600 text-sm mt-1">✓ {formData.file.name}</p>}
            </div>

            <div className="flex gap-4">
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Submit Assignment
              </Button>
              <Button variant="secondary" type="button" onClick={() => navigate('/dashboard')} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
