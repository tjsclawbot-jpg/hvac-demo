import { FormData } from '@/hooks/useFormState';

export interface SiteContent {
  hero: {
    headline: string;
    subheadline: string;
  };
  business: {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
  };
  features: {
    title: string;
    description: string;
  }[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

/**
 * Converts form data to structured site content
 */
export function formToSiteContent(formData: FormData): SiteContent {
  const features = [
    {
      title: formData.features?.[0] || '24/7 Emergency Service',
      description: 'Available anytime, day or night, for urgent HVAC issues.',
    },
    {
      title: formData.features?.[1] || 'Expert Installation',
      description: 'Professional installation of all major HVAC brands and systems.',
    },
    {
      title: formData.features?.[2] || 'Fast Response',
      description: 'Quick service calls with same-day availability.',
    },
  ];

  return {
    hero: {
      headline: formData.heroHeadline || 'Expert HVAC Solutions for Your Comfort',
      subheadline:
        formData.heroSubheadline ||
        'Professional heating, ventilation, and air conditioning services for residential and commercial properties in Phoenix.',
    },
    business: {
      name: formData.businessName || 'ProFlow HVAC',
      description:
        formData.businessDescription ||
        'Professional heating, ventilation, and air conditioning services',
      phone: formData.phoneNumber || '(602) 555-HVAC',
      email: formData.email || 'info@proflowhvac.com',
      address: formData.address || '4521 Industrial Blvd, Phoenix, AZ',
    },
    features,
    colors: {
      primary: formData.color?.primary || '#1e293b',
      secondary: formData.color?.secondary || '#2563eb',
      accent: formData.color?.accent || '#ea580c',
    },
    social: {
      facebook: formData.socialLinks?.facebook,
      instagram: formData.socialLinks?.instagram,
      linkedin: formData.socialLinks?.linkedin,
    },
  };
}

/**
 * Generates inline CSS style from form data colors
 */
export function generateColorStyles(colors: SiteContent['colors']): string {
  return `
    :root {
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
    }
  `;
}

/**
 * Generates a preview HTML string for the website
 */
export function generatePreviewHTML(content: SiteContent): string {
  const { primary, secondary, accent } = content.colors;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${content.business.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
        
        .nav { background: ${secondary}; color: white; padding: 1rem 2rem; }
        .nav-brand { font-weight: bold; font-size: 1.2rem; }
        
        .hero {
          background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
        }
        .hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.1rem; max-width: 600px; margin: 0 auto; opacity: 0.9; }
        
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          padding: 4rem 2rem;
          background: #f8f9fa;
        }
        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          border-left: 4px solid ${accent};
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .feature-card h3 { color: ${secondary}; margin-bottom: 0.5rem; }
        
        .contact {
          background: ${accent};
          color: white;
          padding: 2rem;
          text-align: center;
        }
        .contact h2 { margin-bottom: 1rem; }
        .contact-info { font-size: 1.1rem; margin: 1rem 0; }
        
        .footer {
          background: ${primary};
          color: white;
          padding: 2rem;
          text-align: center;
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <nav class="nav">
        <div class="nav-brand">${content.business.name}</div>
      </nav>
      
      <section class="hero">
        <h1>${content.hero.headline}</h1>
        <p>${content.hero.subheadline}</p>
      </section>
      
      <section class="features">
        ${content.features
          .map(
            (f) => `
          <div class="feature-card">
            <h3>${f.title}</h3>
            <p>${f.description}</p>
          </div>
        `
          )
          .join('')}
      </section>
      
      <section class="contact">
        <h2>Get in Touch</h2>
        <div class="contact-info">
          <div>📞 ${content.business.phone}</div>
          <div>✉️ ${content.business.email}</div>
          <div>📍 ${content.business.address}</div>
        </div>
      </section>
      
      <footer class="footer">
        <p>&copy; 2026 ${content.business.name}. All rights reserved.</p>
      </footer>
    </body>
    </html>
  `;
}
