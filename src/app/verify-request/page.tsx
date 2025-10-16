'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/Logo"

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="text-center mb-4">
              <Link href="/">
                <Logo width={120} height={32} />
              </Link>
            </div>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-[var(--smakowalo-green-light)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[var(--smakowalo-green-primary)]" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-[var(--smakowalo-green-dark)]">
              Sprawdź swoją skrzynkę email
            </CardTitle>
            <CardDescription className="text-center">
              Wysłaliśmy link do logowania na podany adres email
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-800 mb-2">Email został wysłany!</h3>
              <p className="text-sm text-green-700 mb-4">
                Kliknij w link w wiadomości email, aby się zalogować. Jeśli nie widzisz wiadomości, sprawdź folder spam.
              </p>
              <p className="text-xs text-green-600">
                Link jest ważny przez 24 godziny
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Sprawdź folder spam lub promocje</p>
                <p>• Link może pojawić się z opóźnieniem do 5 minut</p>
                <p>• Upewnij się, że adres email jest poprawny</p>
              </div>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-[var(--smakowalo-green-primary)] flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Powrót do logowania
              </Link>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                Problemy z logowaniem?{" "}
                <Link href="/kontakt" className="text-[var(--smakowalo-green-primary)] hover:underline">
                  Skontaktuj się z nami
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
