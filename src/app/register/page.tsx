'use client'

import { Suspense } from 'react'
import AuthFormWithAnimation from '@/components/AuthFormWithAnimation'
import { Loader2 } from 'lucide-react'

function RegisterContent() {
  return <AuthFormWithAnimation initialMode="register" />
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--smakowalo-green-primary)]" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
