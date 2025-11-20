'use client'

import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Płatność anulowana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 text-center">
            Nie martw się! Żadna płatność nie została pobrana.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Co możesz zrobić?
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Spróbuj ponownie z inną metodą płatności</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Zmień wybrany plan subskrypcji</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Skontaktuj się z nami, jeśli potrzebujesz pomocy</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/kreator">
              <Button className="w-full bg-[#4A7C59] hover:bg-[#3d6849]">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Spróbuj ponownie
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wróć do strony głównej
              </Button>
            </Link>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Potrzebujesz pomocy?
            </p>
            <Link href="/kontakt" className="text-[#4A7C59] hover:underline text-sm font-medium">
              Skontaktuj się z nami
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
