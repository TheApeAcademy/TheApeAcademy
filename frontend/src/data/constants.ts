import { RegionData } from '@/types';

export const REGIONS: RegionData[] = [
  {
    region: 'Europe',
    countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Poland'],
  },
  {
    region: 'America',
    countries: ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
  },
  {
    region: 'Gulf',
    countries: ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'],
  },
  {
    region: 'Africa',
    countries: ['Nigeria', 'South Africa', 'Egypt', 'Kenya', 'Ghana', 'Morocco', 'Ethiopia', 'Tanzania'],
  },
  {
    region: 'Asia',
    countries: ['China', 'Japan', 'South Korea', 'India', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia'],
  },
  {
    region: 'Oceania',
    countries: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'],
  },
];

export const SCHOOL_LEVELS = ['Primary', 'Middle', 'High', 'University'];

export const DEPARTMENTS: { [key: string]: string[] } = {
  Primary: ['General Education'],
  Middle: ['General Education', 'STEM Focus', 'Arts & Humanities'],
  High: ['Science', 'Arts', 'Technology', 'Commercial', 'Engineering'],
  University: [
    'Computer Science',
    'Engineering',
    'Business Administration',
    'Medicine',
    'Law',
    'Arts & Humanities',
    'Natural Sciences',
    'Social Sciences',
  ],
};

export const PLATFORMS = ['WhatsApp', 'Email', 'Snapchat', 'Telegram', 'Instagram', 'Discord'];

export const ASSIGNMENT_TYPES = ['Essay', 'Research Paper', 'Project', 'Homework', 'Lab Report', 'Presentation', 'Other'];
