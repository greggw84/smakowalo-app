"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@supabase/supabase-js";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

// ✅ Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, storageKey: "smakowalo_auth" },
      })
    : null;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Single-flight OAuth guards
  const oauthInFlightRef = useRef(false);
  const [oauthProviderLoading, setOauthProviderLoading] = useState<
    "google" | "facebook" | null
  >(null);
  const lastOAuthClickRef = useRef(0);

  // Check OAuth guard before starting request
  const checkOAuthGuard = (provider: "google" | "facebook"): boolean => {
    const now = Date.now();

    if (oauthInFlightRef.current) {
      console.warn(
        `OAuth request already in flight, ignoring duplicate ${provider} click`,
      );
      return false;
    }

    if (now - lastOAuthClickRef.current < 300) {
      console.warn("OAuth click debounced (< 300ms since last click)");
      return false;
    }

    lastOAuthClickRef.current = now;
    oauthInFlightRef.current = true;
    setOauthProviderLoading(provider);
    console.info(`OAuth start: ${provider}`);
    return true;
  };

  // Validate callbackUrl to prevent open redirect attacks
  const getValidCallbackUrl = useCallback((): string => {
    const callbackUrl = searchParams.get("callbackUrl") || "/panel";

    // Only allow relative URLs (starting with /) or URLs from the same origin
    if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
      return callbackUrl;
    }

    // Check if it's a full URL from the same origin
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (!siteUrl) {
        // In production, NEXT_PUBLIC_SITE_URL must be set
        if (process.env.NODE_ENV === "production") {
          console.error(
            "CRITICAL: NEXT_PUBLIC_SITE_URL is not set in production",
          );
          // Fail safely - only allow /panel redirect
          return "/panel";
        }
        // In development, allow the callback but warn
        console.warn("NEXT_PUBLIC_SITE_URL is not set, defaulting to /panel");
        return "/panel";
      }

      const url = new URL(callbackUrl);
      const site = new URL(siteUrl);
      if (url.origin === site.origin) {
        return callbackUrl;
      }
    } catch {
      // Invalid URL, fall through to default
    }

    // Default to /panel for any invalid or external URLs
    return "/panel";
  }, [searchParams]);

  // ✅ Naprawa pętli redirectów (Supabase init delay fix)
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        if (data?.session) {
          // Honor callbackUrl parameter from query string (validated)
          const callbackUrl = getValidCallbackUrl();
          router.replace(callbackUrl);
        } else {
          const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
              if (session && !cancelled) {
                // Honor callbackUrl parameter from query string (validated)
                const callbackUrl = getValidCallbackUrl();
                router.replace(callbackUrl);
              }
            },
          );
          return () => listener.subscription.unsubscribe();
        }
      }
    };

    const timeout = setTimeout(() => checkSession(), 300);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [router, getValidCallbackUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setError("Nieprawidłowy email lub hasło.");
      console.error(error);
    } else if (data?.session) {
      setSuccess("Zalogowano pomyślnie! Przekierowywanie...");
      // Honor callbackUrl parameter from query string (validated)
      const callbackUrl = getValidCallbackUrl();
      setTimeout(() => router.replace(callbackUrl), 800);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    });
    setLoading(false);

    if (error) {
      setError(`Rejestracja nie powiodła się: ${error.message}`);
    } else {
      setSuccess(
        "Sprawdź swoją skrzynkę email i potwierdź adres, aby aktywować konto.",
      );
      setTab("login");
    }
  };

  const handleGoogleLogin = async () => {
    // Single-flight guard: prevent duplicate requests
    if (!checkOAuthGuard("google")) {
      return;
    }

    // Honor callbackUrl parameter - redirect back to login page after OAuth (validated)
    const callbackUrl = getValidCallbackUrl();
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });

    if (error) {
      setError("Błąd podczas logowania przez Google.");
      oauthInFlightRef.current = false;
      setOauthProviderLoading(null);
    }
    // Note: On success, browser will redirect, so we don't reset the flag
  };

  const handleFacebookLogin = async () => {
    // Single-flight guard: prevent duplicate requests
    if (!checkOAuthGuard("facebook")) {
      return;
    }

    // Honor callbackUrl parameter - redirect back to login page after OAuth (validated)
    const callbackUrl = getValidCallbackUrl();
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: redirectUrl },
    });

    if (error) {
      setError("Błąd podczas logowania przez Facebook.");
      oauthInFlightRef.current = false;
      setOauthProviderLoading(null);
    }
    // Note: On success, browser will redirect, so we don't reset the flag
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-smakowalo-cream to-white">
      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full shadow-md">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center text-[var(--smakowalo-green-dark)]">
              Witaj w Smakowało!
            </h2>
            <p className="text-center text-gray-600 mt-1">
              {tab === "login"
                ? "Zaloguj się, aby kontynuować"
                : "Zarejestruj się, aby rozpocząć kulinarną przygodę"}
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "login" | "register")}
            >
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="login">Zaloguj</TabsTrigger>
                <TabsTrigger value="register">Zarejestruj</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="jan@przyklad.pl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Hasło</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full smakowalo-green"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Logowanie...
                      </>
                    ) : (
                      "Zaloguj się"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="jan@przyklad.pl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Hasło</Label>
                    <Input
                      type="password"
                      placeholder="Min. 6 znaków"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Potwierdź hasło</Label>
                    <Input
                      type="password"
                      placeholder="Powtórz hasło"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full smakowalo-green"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Rejestracja...
                      </>
                    ) : (
                      "Utwórz konto"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center text-gray-500 text-sm mt-6">
              lub kontynuuj z
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <Button
                variant="outline"
                onClick={handleFacebookLogin}
                disabled={oauthProviderLoading !== null}
                aria-busy={oauthProviderLoading === "facebook"}
                className="w-full"
                style={
                  oauthProviderLoading !== null
                    ? { pointerEvents: "none" }
                    : undefined
                }
              >
                {oauthProviderLoading === "facebook" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Facebook
                  </>
                ) : (
                  "Facebook"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={oauthProviderLoading !== null}
                aria-busy={oauthProviderLoading === "google"}
                className="w-full"
                style={
                  oauthProviderLoading !== null
                    ? { pointerEvents: "none" }
                    : undefined
                }
              >
                {oauthProviderLoading === "google" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Google
                  </>
                ) : (
                  "Google"
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Tworząc konto, akceptujesz nasze{" "}
              <Link href="/terms" className="underline">
                Warunki użytkowania
              </Link>{" "}
              i{" "}
              <Link href="/privacy" className="underline">
                Politykę prywatności
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ✅ Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-gray-500">Ładowanie...</div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
