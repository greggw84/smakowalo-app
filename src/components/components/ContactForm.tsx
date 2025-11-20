'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { trackEvent } from './Analytics'

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  type: 'general' | 'delivery' | 'diet' | 'complaint' | 'cooperation'
}

const contactTypes = [
  { value: 'general', label: 'Ogólne pytanie' },
  { value: 'delivery', label: 'Dostawa i zamówienia' },
  { value: 'diet', label: 'Pytania dietetyczne' },
  { value: 'complaint', label: 'Reklamacja' },
  { value: 'cooperation', label: 'Współpraca biznesowa' }
]

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Partial<ContactFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Imię i nazwisko jest wymagane'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Adres email jest wymagany'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Podaj prawidłowy adres email'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Temat wiadomości jest wymagany'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Treść wiadomości jest wymagana'
    } else if (formData.message.length < 10) {
      newErrors.message = 'Wiadomość musi zawierać co najmniej 10 znaków'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Here you would integrate with your email service (like EmailJS, SendGrid, or your own API)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          type: 'general'
        })

        // Track form submission
        trackEvent.contactForm(formData.type)
      } else {
        throw new Error('Błąd podczas wysyłania wiadomości')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-[var(--smakowalo-green-dark)] mb-4">
              Skontaktuj się z nami
            </h2>
            <p className="text-gray-600">
              Masz pytania? Potrzebujesz pomocy? Jesteśmy tutaj dla Ciebie!
              Skontaktuj się z nami, a odpowiemy tak szybko, jak to możliwe.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[var(--smakowalo-green-primary)] rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--smakowalo-green-dark)]">Email</h3>
                <p className="text-gray-600">pomoc@smakowalo.pl</p>
                <p className="text-sm text-gray-500">Odpowiadamy w ciągu 24h</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[var(--smakowalo-green-primary)] rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--smakowalo-green-dark)]">Telefon</h3>
                <p className="text-gray-600">+48 999 999 999</p>
                <p className="text-sm text-gray-500">Pon-Pt: 8:00-18:00, Sob: 8:00-14:00</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[var(--smakowalo-green-primary)] rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--smakowalo-green-dark)]">Adres</h3>
                <p className="text-gray-600">ul. Przykładowa 123</p>
                <p className="text-gray-600">00-000 Warszawa</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--smakowalo-cream)] rounded-lg p-6">
            <h3 className="font-semibold text-[var(--smakowalo-green-dark)] mb-3">
              Często zadawane pytania
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Jak zmienić lub anulować zamówienie?</li>
              <li>• Jakie są opcje dostawy?</li>
              <li>• Czy dania są świeże czy mrożone?</li>
              <li>• Jak długo przechowywać posiłki?</li>
            </ul>
            <a href="/faq" className="text-[var(--smakowalo-green-primary)] hover:underline text-sm mt-2 inline-block">
              Zobacz wszystkie FAQ →
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-[var(--smakowalo-green-dark)]">
              Napisz do nas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Wiadomość wysłana!
                </h3>
                <p className="text-green-700 mb-4">
                  Dziękujemy za kontakt. Odpowiemy tak szybko, jak to możliwe.
                </p>
                <Button
                  onClick={() => setSubmitStatus('idle')}
                  variant="outline"
                  className="border-green-600 text-green-600"
                >
                  Wyślij kolejną wiadomość
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imię i nazwisko *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Jan Kowalski"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="jan@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+48 999 999 999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Typ zapytania
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--smakowalo-green-primary)]"
                    >
                      {contactTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temat *
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Temat twojej wiadomości"
                    className={errors.subject ? 'border-red-500' : ''}
                  />
                  {errors.subject && (
                    <p className="text-red-600 text-xs mt-1">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wiadomość *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Opisz swoje pytanie lub problem..."
                    rows={6}
                    className={errors.message ? 'border-red-500' : ''}
                  />
                  {errors.message && (
                    <p className="text-red-600 text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <p className="text-red-800">
                        Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie lub skontaktuj się z nami bezpośrednio.
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--smakowalo-green-primary)] hover:bg-[var(--smakowalo-green-dark)]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Wysyłanie...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Wyślij wiadomość
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Pola oznaczone * są wymagane. Twoje dane są bezpieczne i nie będą udostępniane osobom trzecim.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
