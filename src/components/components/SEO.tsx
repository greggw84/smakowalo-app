import Head from 'next/head'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  keywords?: string[]
  structuredData?: object
}

export default function SEO({
  title = 'Smakowało - Zestaw posiłków dla zapracowanych',
  description = 'Zdrowe jedzenie, twój sposób. Zestawy posiłków dla zapracowanych z 8 opcjami diet do wyboru każdego tygodnia. Wysoka jakość, świeże składniki, łatwe przygotowanie.',
  image = 'https://smakowalo.pl/og-image.jpg',
  url = 'https://smakowalo.pl',
  type = 'website',
  keywords = [
    'zdrowe jedzenie',
    'catering dietetyczny',
    'zestawy posiłków',
    'dieta pudełkowa',
    'zdrowa dieta',
    'posiłki dla zapracowanych',
    'meal prep',
    'keto',
    'wegetariańskie',
    'wegańskie'
  ],
  structuredData
}: SEOProps) {
  const siteTitle = title.includes('Smakowało') ? title : `${title} | Smakowało`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content="Smakowało" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Smakowało" />
      <meta property="og:locale" content="pl_PL" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  )
}
