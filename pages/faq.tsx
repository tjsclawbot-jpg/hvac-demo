import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How long does it take to build my website?',
    answer: 'Your website can be built and launched in 3 days. Day 1 is discovery and setup, Day 2 is customization with our live preview builder, and Day 3 is launch and optimization. You have full control over the timeline though.',
  },
  {
    category: 'Getting Started',
    question: 'What if I don\'t know anything about web design?',
    answer: 'You don\'t need any technical skills. Our live preview builder is designed for non-technical users. Simply fill out your information, customize colors and content, and see changes instantly. We\'re here to help every step of the way.',
  },
  {
    category: 'Getting Started',
    question: 'Do I need a domain name?',
    answer: 'Yes, you\'ll need a domain name (like yourcompany.com). We can help you register one if you don\'t already have it, or you can use an existing domain. The domain is yours to keep forever.',
  },
  {
    category: 'Pricing & Costs',
    question: 'What are the total costs to get started?',
    answer: 'Website build: $5,000-$10,000 (one-time). Monthly hosting: $29/month. Optional monthly retainer (priority support + updates): $199/month. That\'s it. No hidden fees, no surprise charges.',
  },
  {
    category: 'Pricing & Costs',
    question: 'Is there a contract I\'m locked into?',
    answer: 'No. You own your website completely. You can cancel the hosting anytime with no penalties. The initial build is a one-time investment, and monthly services can be stopped anytime. No long-term contracts.',
  },
  {
    category: 'Features & Functionality',
    question: 'What features are included in my website?',
    answer: 'Professional design, mobile responsive, SEO optimized, SSL certificate, Google Analytics, contact forms, lead capture, social media integration, email integration, and up to 5 pages. Custom features can be added.',
  },
  {
    category: 'Hosting & Performance',
    question: 'What\'s your uptime guarantee?',
    answer: '99.9% uptime guarantee. This means your website will be online and accessible 99.9% of the time. We have redundant servers, automatic failover, and 24/7 monitoring.',
  },
  {
    category: 'Support & Maintenance',
    question: 'What happens if I need help after launch?',
    answer: 'We provide free email support included with hosting. For priority phone support and monthly strategy calls, upgrade to the monthly retainer plan ($199/month).',
  },
];

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const categories = Array.from(new Set(faqItems.map((item) => item.category)));

  return (
    <div className="min-h-screen bg-hvac-light flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-hvac-darkgray text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 my-8 rounded-lg border-t-4 border-hvac-orange">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
        <p className="text-xl opacity-95 max-w-3xl">
          Everything you need to know about building, hosting, and growing your HVAC website.
        </p>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-hvac-orange mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-hvac-orange rounded"></span>
              {category}
            </h2>

            <div className="space-y-4">
              {faqItems
                .filter((item) => item.category === category)
                .map((item, idx) => (
                  <div key={idx} className="bg-white border-l-4 border-hvac-orange rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <button
                      onClick={() =>
                        setExpandedIndex(expandedIndex === idx ? null : idx)
                      }
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-hvac-light transition"
                    >
                      <span className="text-lg font-semibold text-hvac-darkgray text-left">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-hvac-orange flex-shrink-0 transition-transform ${
                          expandedIndex === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {expandedIndex === idx && (
                      <div className="px-6 py-4 bg-hvac-light border-t-2 border-hvac-orange text-hvac-text">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-hvac-orange to-orange-600 text-white py-16 rounded-lg max-w-7xl mx-auto my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="opacity-95 mb-8">
            Your professional HVAC website can be live in 3 days. Everything you need is included.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-hvac-yellow hover:bg-yellow-300 text-hvac-darkgray px-8 py-3 rounded-lg font-semibold transition">
            Launch Your Website <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
