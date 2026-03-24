'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, LogIn, Link2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Navigation } from '@/components/website/navigation';
import { Footer } from '@/components/website/footer';

function clearSellerContext() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('seller_id');
  localStorage.removeItem('seller_name');
  localStorage.removeItem('phone_number');
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notMapped, setNotMapped] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNotMapped(params.get('error') === 'not_mapped');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      if (notMapped) return;
      if (!cancelled) router.push('/dashboard');
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [router, notMapped]);

  const handleGoogleLogin = async () => {
    debugger
    setError('');
    setLoading(true);

    const redirectTo = `
https://mock-project.supabase.co/auth/v1/authorize?provider=google&redirect_to=adjfbsfsorddqbndyrhq.supabase.co/auth/v1/callback`;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (signInError) {
      setError(signInError.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleSignOutCurrentGoogle = async () => {
    setError('');
    clearSellerContext();
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleLinkByPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLinking(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setError('Please sign in with Google first.');
        setLinking(false);
        return;
      }

      const response = await fetch('/api/auth/link-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error || 'Could not link this phone number');
        setLinking(false);
        return;
      }

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('seller_id', result.seller.seller_id);
      localStorage.setItem('seller_name', result.seller.seller_name);
      localStorage.setItem('phone_number', result.seller.phone_number);
      router.push('/dashboard');
    } catch {
      setError('Failed to link seller account');
      setLinking(false);
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col font-sans text-black overflow-hidden">
      <div className="relative z-50">
        <Navigation />
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <video
            src="/videos/intro.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        <div className="relative z-20 w-full max-w-md p-6">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 text-white">
            <div className="flex flex-col items-center mb-8 text-center">
              <h2 className="text-xl font-light text-white/90">Seller Login</h2>
              <p className="text-sm text-white/50 mt-2 font-light">
                Continue with Google to access your business dashboard
              </p>
            </div>

            {(error || notMapped) && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  {error || 'This Google account is not linked to a seller yet. Sign in, then link using your registered seller phone number.'}
                </span>
              </div>
            )}

            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-14 bg-white text-black hover:bg-gray-200 font-semibold text-base rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </Button>

            {notMapped && (
              <form onSubmit={handleLinkByPhone} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-wider font-semibold text-white/60">
                    Registered Seller Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder-white/20 rounded-xl focus:bg-white/10 focus:border-white/30"
                    maxLength={10}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={linking || phoneNumber.length < 10}
                  className="w-full h-12 bg-blue-500 text-white hover:bg-blue-600 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {linking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Linking account...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      <span>Link this Google account</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSignOutCurrentGoogle}
                  className="w-full text-white/70 hover:text-white hover:bg-white/10 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Use a different Google account
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
