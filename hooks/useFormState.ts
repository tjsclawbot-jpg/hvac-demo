import { useState, useCallback, useEffect } from 'react';

export interface FormData {
  businessName?: string;
  businessDescription?: string;
  serviceCategory?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  features?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  color?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

const STORAGE_KEY = 'hvac-form-state';

export function useFormState() {
  const [formData, setFormData] = useState<FormData>({
    businessName: 'ProFlow HVAC',
    businessDescription: 'Professional heating, ventilation, and air conditioning services',
    phoneNumber: '(602) 555-HVAC',
    email: 'info@proflowhvac.com',
    address: '4521 Industrial Blvd, Phoenix, AZ',
    heroHeadline: 'Expert HVAC Solutions for Your Comfort',
    heroSubheadline: 'Professional heating, ventilation, and air conditioning services for residential and commercial properties in Phoenix.',
    features: ['24/7 Emergency Service', 'Expert Installation', 'Fast Response'],
    socialLinks: {
      facebook: 'https://facebook.com/proflowhvac',
      instagram: 'https://instagram.com/proflowhvac',
    },
    color: {
      primary: '#1e293b',
      secondary: '#2563eb',
      accent: '#ea580c',
    },
  });

  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(parsed);
        } catch {
          console.error('Failed to load saved form data');
        }
      }
      setHasLoaded(true);
    }
  }, []);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (hasLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, hasLoaded]);

  const updateField = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const updateNestedField = useCallback(
    (parent: keyof FormData, field: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] as Record<string, any>),
          [field]: value,
        },
      }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData({
      businessName: 'ProFlow HVAC',
      businessDescription: 'Professional heating, ventilation, and air conditioning services',
      phoneNumber: '(602) 555-HVAC',
      email: 'info@proflowhvac.com',
      address: '4521 Industrial Blvd, Phoenix, AZ',
      heroHeadline: 'Expert HVAC Solutions for Your Comfort',
      heroSubheadline: 'Professional heating, ventilation, and air conditioning services for residential and commercial properties in Phoenix.',
      features: ['24/7 Emergency Service', 'Expert Installation', 'Fast Response'],
      socialLinks: {
        facebook: 'https://facebook.com/proflowhvac',
        instagram: 'https://instagram.com/proflowhvac',
      },
      color: {
        primary: '#1e293b',
        secondary: '#2563eb',
        accent: '#ea580c',
      },
    });
  }, []);

  return {
    formData,
    updateField,
    updateNestedField,
    resetForm,
    isReady: hasLoaded,
  };
}
