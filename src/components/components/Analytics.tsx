'use client'

import { useEffect, useState, Suspense } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'

// Google Analytics configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Google Analytics inner component
function GoogleAnalyticsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    const url = pathname + searchParams.toString()

    // Track page views
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      page_location: url,
    })
  }, [pathname, searchParams])

  return null
}

// Google Analytics component
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_location: window.location.href,
              page_title: document.title,
              debug_mode: ${process.env.NODE_ENV === 'development'}
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsInner />
      </Suspense>
    </>
  )
}

// Facebook Pixel (Meta Pixel) component
export function FacebookPixel() {
  const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

  if (!FACEBOOK_PIXEL_ID) {
    return null
  }

  return (
    <Script
      id="facebook-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FACEBOOK_PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      }}
    />
  )
}

// Analytics event tracking functions
export const trackEvent = {
  // Product interactions
  viewProduct: (productId: string, productName: string, price: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'PLN',
        value: price,
        items: [{
          item_id: productId,
          item_name: productName,
          price: price,
          quantity: 1
        }]
      })
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: [productId],
        content_name: productName,
        content_type: 'product',
        value: price,
        currency: 'PLN'
      })
    }
  },

  // Add to cart
  addToCart: (productId: string, productName: string, price: number, quantity = 1) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'PLN',
        value: price * quantity,
        items: [{
          item_id: productId,
          item_name: productName,
          price: price,
          quantity: quantity
        }]
      })
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [productId],
        content_name: productName,
        content_type: 'product',
        value: price * quantity,
        currency: 'PLN'
      })
    }
  },

  // Begin checkout
  beginCheckout: (items: any[], value: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'PLN',
        value: value,
        items: items
      })
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: value,
        currency: 'PLN',
        num_items: items.length
      })
    }
  },

  // Purchase completion
  purchase: (transactionId: string, items: any[], value: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        currency: 'PLN',
        value: value,
        items: items
      })
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: value,
        currency: 'PLN'
      })
    }
  },

  // Search
  search: (searchTerm: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchTerm
      })
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Search', {
        search_string: searchTerm
      })
    }
  },

  // Newsletter signup
  newsletterSignup: (email: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: 'newsletter'
      })
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Subscribe')
    }
  },

  // Contact form submission
  contactForm: (formType: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generate_lead', {
        form_type: formType
      })
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead')
    }
  }
}

// Hook for page view tracking
export function usePageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    const url = pathname + searchParams.toString()

    // Track custom page view event
    window.gtag?.('event', 'page_view', {
      page_location: url,
      page_title: document.title
    })
  }, [pathname, searchParams])
}

// GDPR Consent Banner component
export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(true)
  const [consentGiven, setConsentGiven] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('analytics-consent')
    if (consent) {
      setShowBanner(false)
      setConsentGiven(consent === 'true')
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('analytics-consent', 'true')
    setConsentGiven(true)
    setShowBanner(false)

    // Initialize analytics after consent
    if (GA_MEASUREMENT_ID) {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted'
      })
    }
  }

  const handleDecline = () => {
    localStorage.setItem('analytics-consent', 'false')
    setConsentGiven(false)
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Używamy plików cookie i podobnych technologii do analizy ruchu i personalizacji treści.{' '}
          <a href="/privacy-policy" className="text-[var(--smakowalo-green-primary)] hover:underline">
            Dowiedz się więcej
          </a>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Odrzuć
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-[var(--smakowalo-green-primary)] text-white rounded hover:bg-[var(--smakowalo-green-dark)]"
          >
            Akceptuj
          </button>
        </div>
      </div>
    </div>
  )
}

// Combined Analytics provider
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <GoogleAnalytics />
      <FacebookPixel />
      <ConsentBanner />
    </>
  )
}

// Type declarations for global analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
  }
}
