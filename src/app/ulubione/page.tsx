import type { Metadata } from 'next'
import FavoritesPageClient from './FavoritesPageClient'

export const metadata: Metadata = {
  title: 'Ulubione dania - Smakowało',
  description: 'Twoje ulubione przepisy i dania. Zarządzaj swoją listą ulubionych posiłków w jednym miejscu.',
  openGraph: {
    title: 'Ulubione dania - Smakowało',
    description: 'Twoje ulubione przepisy i dania. Zarządzaj swoją listą ulubionych posiłków w jednym miejscu.',
  },
}

export default function FavoritesPage() {
  return <FavoritesPageClient />
}
