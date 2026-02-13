import React, { useState } from 'react';
import { Input } from '../Common/Input';
import { Button } from '../Common/Button';
import { SignupData } from '../../types';

interface SignupFormProps {
  onSubmit: (data: SignupData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, isLoading = false, error }) => {
  const [formData, setFormData] = useState<SignupData>({
    fullName: '',
    email: '',
    password: '',
    region: '',
    country: '',
    educationLevel: '',
    departmentOrCourse: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.region) newErrors.region = 'Region is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      // Error is handled by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>}

      <Input
        label="Full Name"
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        placeholder="John Doe"
        disabled={isLoading}
        required
      />

      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="you@example.com"
        disabled={isLoading}
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="At least 6 characters"
        disabled={isLoading}
        required
      />

      <Input
        label="Region"
        type="text"
        name="region"
        value={formData.region}
        onChange={handleChange}
        error={errors.region}
        placeholder="e.g., Lagos"
        disabled={isLoading}
        required
      />

      <Input
        label="Country"
        type="text"
        name="country"
        value={formData.country}
        onChange={handleChange}
        error={errors.country}
        placeholder="e.g., Nigeria"
        disabled={isLoading}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Education Level <span className="text-red-500">*</span>
        </label>
        <select
          name="educationLevel"
          value={formData.educationLevel}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.educationLevel ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select education level</option>
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
        disabled={isLoading}
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Create Account
      </Button>
    </form>
  );
};
