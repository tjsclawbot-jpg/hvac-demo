'use client';

import React, { useMemo, useState } from 'react';
import { formToSiteContent, generatePreviewHTML } from '@/lib/formToSite';
import { useFormState, FormData } from '@/hooks/useFormState';

export function LivePreview() {
  const { formData, updateField, updateNestedField } = useFormState();
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const siteContent = useMemo(() => {
    return formToSiteContent(formData);
  }, [formData]);

  const previewHTML = useMemo(() => {
    return generatePreviewHTML(siteContent);
  }, [siteContent]);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      // Simulate API call to deploy the site
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert('✅ Website published successfully! Your changes are now live.');
      setIsSaving(false);
    } catch (error) {
      alert('❌ Failed to publish website');
      setIsSaving(false);
    }
  };

  const handleAddFeature = () => {
    const newFeature = prompt('Enter new feature:');
    if (newFeature && formData.features) {
      updateField('features', [...formData.features, newFeature]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Website Builder</h1>
          <p className="text-gray-300">Customize your website in real-time. Changes appear instantly in the preview.</p>
        </div>

        {/* Toggle and Controls */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            {showPreview ? '📋 Show Form Only' : '👁️ Show Preview'}
          </button>

          <button
            onClick={handleConfirm}
            disabled={isSaving}
            className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              isSaving
                ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isSaving ? '⏳ Publishing...' : '✅ Publish Website'}
          </button>

          <div className="flex-1 text-right text-sm text-gray-400">
            Auto-saved to localStorage
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
          {/* Form Section */}
          <div className="bg-slate-800 rounded-lg border border-blue-600 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Website Settings</h2>

            {/* Business Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-orange-500 mb-4">Business Information</h3>

              <label className="block text-white mb-2 text-sm font-medium">Business Name</label>
              <input
                type="text"
                value={formData.businessName || ''}
                onChange={(e) => updateField('businessName', e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
                placeholder="Your Business Name"
              />

              <label className="block text-white mb-2 text-sm font-medium">Description</label>
              <textarea
                value={formData.businessDescription || ''}
                onChange={(e) => updateField('businessDescription', e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4 h-20"
                placeholder="Brief business description"
              />

              <label className="block text-white mb-2 text-sm font-medium">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber || ''}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
                placeholder="(602) 555-HVAC"
              />

              <label className="block text-white mb-2 text-sm font-medium">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
                placeholder="info@example.com"
              />

              <label className="block text-white mb-2 text-sm font-medium">Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
                placeholder="Your Address"
              />
            </div>

            {/* Hero Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-orange-500 mb-4">Hero Section</h3>

              <label className="block text-white mb-2 text-sm font-medium">Headline</label>
              <input
                type="text"
                value={formData.heroHeadline || ''}
                onChange={(e) => updateField('heroHeadline', e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
                placeholder="Main Headline"
              />

              <label className="block text-white mb-2 text-sm font-medium">Subheadline</label>
              <textarea
                value={formData.heroSubheadline || ''}
                onChange={(e) => updateField('heroSubheadline', e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4 h-20"
                placeholder="Supporting text"
              />
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-orange-500 mb-4">Features</h3>
              {formData.features?.map((feature, idx) => (
                <div key={idx} className="mb-3">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...formData.features!];
                      newFeatures[idx] = e.target.value;
                      updateField('features', newFeatures);
                    }}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                    placeholder={`Feature ${idx + 1}`}
                  />
                </div>
              ))}
              <button
                onClick={handleAddFeature}
                className="text-blue-400 hover:text-blue-300 text-sm mt-2 transition"
              >
                + Add Feature
              </button>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-orange-500 mb-4">Colors</h3>

              <label className="block text-white mb-2 text-sm font-medium">Primary Color</label>
              <div className="flex gap-2 items-center mb-4">
                <input
                  type="color"
                  value={formData.color?.primary || '#1e293b'}
                  onChange={(e) => updateNestedField('color', 'primary', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-2 border-slate-600"
                />
                <input
                  type="text"
                  value={formData.color?.primary || ''}
                  onChange={(e) => updateNestedField('color', 'primary', e.target.value)}
                  className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <label className="block text-white mb-2 text-sm font-medium">Secondary Color</label>
              <div className="flex gap-2 items-center mb-4">
                <input
                  type="color"
                  value={formData.color?.secondary || '#2563eb'}
                  onChange={(e) => updateNestedField('color', 'secondary', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-2 border-slate-600"
                />
                <input
                  type="text"
                  value={formData.color?.secondary || ''}
                  onChange={(e) => updateNestedField('color', 'secondary', e.target.value)}
                  className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <label className="block text-white mb-2 text-sm font-medium">Accent Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={formData.color?.accent || '#ea580c'}
                  onChange={(e) => updateNestedField('color', 'accent', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-2 border-slate-600"
                />
                <input
                  type="text"
                  value={formData.color?.accent || ''}
                  onChange={(e) => updateNestedField('color', 'accent', e.target.value)}
                  className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-orange-500 mb-4">Social Links</h3>

              <label className="block text-white mb-2 text-sm font-medium">Facebook</label>
              <input
                type="url"
                value={formData.socialLinks?.facebook || ''}
                onChange={(e) => updateNestedField('socialLinks', 'facebook', e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
                placeholder="https://facebook.com/yourpage"
              />

              <label className="block text-white mb-2 text-sm font-medium">Instagram</label>
              <input
                type="url"
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) => updateNestedField('socialLinks', 'instagram', e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
                placeholder="https://instagram.com/yourprofile"
              />

              <label className="block text-white mb-2 text-sm font-medium">LinkedIn</label>
              <input
                type="url"
                value={formData.socialLinks?.linkedin || ''}
                onChange={(e) => updateNestedField('socialLinks', 'linkedin', e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="bg-white rounded-lg border-2 border-blue-600 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                <span className="text-white font-semibold">📱 Live Preview</span>
                <span className="text-blue-100 text-xs">Real-time update</span>
              </div>
              <iframe
                srcDoc={previewHTML}
                className="flex-1 w-full border-0"
                title="Website Preview"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
