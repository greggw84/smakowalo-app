import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--smakowalo-cream)] px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <Logo width={150} height={40} />
        </div>

        <h1 className="text-4xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
          404 - Strona nie znaleziona
        </h1>

        <p className="text-gray-600 mb-8">
          Przepraszamy, strona której szukasz nie istnieje lub została przeniesiona.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button asChild className="smakowalo-green">
            <Link href="/">
              Strona główna
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/menu">
              Menu
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
