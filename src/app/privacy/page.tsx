import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Footer } from "@/components/Footer"
import { Shield, Mail } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Polityka Prywatności - Smakowało | Ochrona danych osobowych",
  description: "Polityka prywatności Smakowało - jak przetwarzamy i chronimy Twoje dane osobowe zgodnie z RODO. Poznaj swoje prawa.",
  keywords: "polityka prywatności, RODO, ochrona danych, Smakowało, dane osobowe, prywatność",
  openGraph: {
    title: "Polityka Prywatności - Smakowało",
    description: "Polityka prywatności Smakowało - ochrona danych osobowych",
    type: "website",
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-[var(--smakowalo-green-primary)] to-[var(--smakowalo-green-dark)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Polityka Prywatności
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-4">
            Twoja prywatność jest dla nas priorytetem
          </p>
          <p className="text-sm text-white/80">
            Ostatnia aktualizacja: 11 października 2025
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <a href="#administrator" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
              Administrator
            </a>
            <a href="#dane" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
              Zbierane dane
            </a>
            <a href="#cele" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
              Cele przetwarzania
            </a>
            <a href="#prawa" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
              Twoje prawa
            </a>
            <a href="#cookies" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
              Cookies
            </a>
            <a href="#kontakt" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
              Kontakt
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">

            <Card className="mb-8" id="administrator">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  1. Administrator danych
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Administratorem Twoich danych osobowych jest <strong>Smakowało Sp. z o.o.</strong>
                  z siedzibą w Tarnowo Podgórne, ul. Ks. Józefa Bryzy 42/2, 62-080 Tarnowo Podgórne,
                  KRS: 0001093816, NIP: 7812067133, REGON: 528059450.
                </p>
                <p className="text-gray-700">
                  Kontakt z administratorem: kontakt@smakowalo.pl lub +48 999 999 999.
                </p>
                <p className="text-gray-700">
                  W sprawach związanych z ochroną danych osobowych można się kontaktować
                  pod adresem: dane@smakowalo.pl
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8" id="dane">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  2. Jakie dane zbieramy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Dane tożsamości:</strong> imię, nazwisko, adres e-mail, numer telefonu
                </p>
                <p className="text-gray-700">
                  <strong>Dane adresowe:</strong> adres dostawy, kod pocztowy, miasto
                </p>
                <p className="text-gray-700">
                  <strong>Dane płatności:</strong> informacje o płatnościach (bez numeru karty)
                </p>
                <p className="text-gray-700">
                  <strong>Dane techniczne:</strong> adres IP, typ przeglądarki, preferencje
                </p>
                <p className="text-gray-700">
                  <strong>Dane behawioralne:</strong> historia zamówień, preferencje dietetyczne
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8" id="cele">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  3. Cele przetwarzania danych
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Realizacja zamówień:</strong> przetwarzanie i dostawa zamówień,
                  kontakt w sprawie dostawy (podstawa prawna: wykonanie umowy)
                </p>
                <p className="text-gray-700">
                  <strong>Prowadzenie konta klienta:</strong> zarządzanie kontem, historia zamówień
                  (podstawa prawna: wykonanie umowy)
                </p>
                <p className="text-gray-700">
                  <strong>Marketing:</strong> newsletter, oferty specjalne, badania satysfakcji
                  (podstawa prawna: uzasadniony interes lub zgoda)
                </p>
                <p className="text-gray-700">
                  <strong>Obsługa reklamacji:</strong> rozpatrywanie reklamacji i zwrotów
                  (podstawa prawna: uzasadniony interes)
                </p>
                <p className="text-gray-700">
                  <strong>Analityka:</strong> analiza ruchu na stronie, optymalizacja usług
                  (podstawa prawna: uzasadniony interes)
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  4. Podstawy prawne przetwarzania
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Wykonanie umowy (art. 6 ust. 1 lit. b RODO):</strong>
                  przetwarzanie niezbędne do realizacji zamówień i świadczenia usług
                </p>
                <p className="text-gray-700">
                  <strong>Uzasadniony interes (art. 6 ust. 1 lit. f RODO):</strong>
                  marketing, analityka, bezpieczeństwo, obsługa reklamacji
                </p>
                <p className="text-gray-700">
                  <strong>Zgoda (art. 6 ust. 1 lit. a RODO):</strong>
                  newsletter, cookies marketingowe, profilowanie
                </p>
                <p className="text-gray-700">
                  <strong>Obowiązek prawny (art. 6 ust. 1 lit. c RODO):</strong>
                  prowadzenie dokumentacji podatkowej, księgowej
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  5. Udostępnianie danych
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Firmy kurierskie:</strong> DPD Food (do realizacji dostaw)
                </p>
                <p className="text-gray-700">
                  <strong>Operatorzy płatności:</strong> Stripe, PayU (do obsługi płatności)
                </p>
                <p className="text-gray-700">
                  <strong>Dostawcy usług IT:</strong> hosting, analytics, email marketing
                </p>
                <p className="text-gray-700">
                  <strong>Doradcy prawni i księgowi:</strong> w zakresie wymaganym prawem
                </p>
                <p className="text-gray-700">
                  Wszystkie podmioty przetwarzają dane na podstawie umów powierzenia
                  i zgodnie z instrukcjami administratora.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  6. Okres przechowywania danych
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Dane zamówień:</strong> 5 lat od ostatniego zamówienia (obowiązki podatkowe)
                </p>
                <p className="text-gray-700">
                  <strong>Konto klienta:</strong> do momentu usunięcia konta przez klienta
                </p>
                <p className="text-gray-700">
                  <strong>Marketing:</strong> do odwołania zgody lub zgłoszenia sprzeciwu
                </p>
                <p className="text-gray-700">
                  <strong>Cookies:</strong> zgodnie z ustawieniami przeglądarki, maksymalnie 2 lata
                </p>
                <p className="text-gray-700">
                  <strong>Reklamacje:</strong> 3 lata od zamknięcia sprawy
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8" id="prawa">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  7. Twoje prawa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Prawo dostępu:</strong> możesz uzyskać informacje o przetwarzaniu Twoich danych
                </p>
                <p className="text-gray-700">
                  <strong>Prawo sprostowania:</strong> możesz poprawić nieprawidłowe dane
                </p>
                <p className="text-gray-700">
                  <strong>Prawo usunięcia:</strong> możesz żądać usunięcia danych
                </p>
                <p className="text-gray-700">
                  <strong>Prawo ograniczenia:</strong> możesz ograniczyć przetwarzanie danych
                </p>
                <p className="text-gray-700">
                  <strong>Prawo przenoszenia:</strong> możesz otrzymać dane w formacie strukturalnym
                </p>
                <p className="text-gray-700">
                  <strong>Prawo sprzeciwu:</strong> możesz sprzeciwić się przetwarzaniu
                </p>
                <p className="text-gray-700">
                  <strong>Prawo odwołania zgody:</strong> w każdej chwili bez wpływu na zgodność z prawem
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8" id="cookies">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  8. Cookies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  <strong>Cookies niezbędne:</strong> umożliwiają podstawowe funkcjonowanie strony
                </p>
                <p className="text-gray-700">
                  <strong>Cookies funkcjonalne:</strong> zapamiętują Twoje preferencje
                </p>
                <p className="text-gray-700">
                  <strong>Cookies analityczne:</strong> Google Analytics (za zgodą)
                </p>
                <p className="text-gray-700">
                  <strong>Cookies marketingowe:</strong> personalizacja reklam (za zgodą)
                </p>
                <p className="text-gray-700">
                  Możesz zarządzać cookies w ustawieniach przeglądarki lub przez panel preferencji na stronie.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  9. Bezpieczeństwo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Stosujemy odpowiednie środki techniczne i organizacyjne:
                </p>
                <p className="text-gray-700">
                  • Szyfrowanie danych (SSL/TLS)<br/>
                  • Kontrola dostępu do danych<br/>
                  • Regularne kopie zapasowe<br/>
                  • Monitoring bezpieczeństwa<br/>
                  • Szkolenia pracowników<br/>
                  • Audyty bezpieczeństwa
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8" id="kontakt">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  10. Skarga do organu nadzorczego
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Masz prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych:
                </p>
                <p className="text-gray-700">
                  <strong>Urząd Ochrony Danych Osobowych</strong><br/>
                  ul. Stawki 2, 00-193 Warszawa<br/>
                  tel. +48 22 531 03 00<br/>
                  e-mail: kancelaria@uodo.gov.pl
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[var(--smakowalo-green-dark)]">
                  11. Zmiany polityki
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Możemy aktualizować niniejszą Politykę Prywatności.
                  O istotnych zmianach poinformujemy e-mailem lub przez komunikat na stronie.
                </p>
                <p className="text-gray-700">
                  Aktualna wersja jest zawsze dostępna na naszej stronie internetowej.
                </p>
              </CardContent>
            </Card>

            <div className="text-center mt-12">
              <p className="text-gray-500 text-sm">
                Polityka Prywatności obowiązuje od dnia 1 stycznia 2024 roku
              </p>
              <p className="text-gray-500 text-sm">
                Ostatnia aktualizacja: 11 października 2025 roku
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[var(--smakowalo-green-primary)] to-[var(--smakowalo-green-dark)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Masz pytania o prywatność?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Skontaktuj się z nami w sprawach związanych z ochroną danych osobowych
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:dane@smakowalo.pl">
              <Button
                size="lg"
                className="bg-white text-[var(--smakowalo-green-primary)] hover:bg-gray-100 text-lg px-8 py-3 rounded-lg"
              >
                <Mail className="w-5 h-5 mr-2" />
                Napisz do nas
              </Button>
            </a>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[var(--smakowalo-green-primary)] text-lg px-8 py-3 rounded-lg"
              >
                Wróć do strony głównej
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
