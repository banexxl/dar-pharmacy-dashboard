import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/services/supabase-server';
import { checkIfAdmin } from '../actions';
import { cookies } from 'next/headers';

function normalizeEmail(v?: string | null) {
  return (v ?? '').trim().toLowerCase();
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();

  const oauthError = requestUrl.searchParams.get('error');
  const errorCode = requestUrl.searchParams.get('error_code');
  const errorDescription =
    requestUrl.searchParams.get('error_description');

  if (oauthError) {
    const params = new URLSearchParams({
      error: oauthError,
      error_code: errorCode ?? '',
      error_description: errorDescription ?? 'Authentication failed',
    });

    return NextResponse.redirect(
      new URL(`/auth/error?${params.toString()}`, requestUrl.origin)
    );
  }

  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/error?error=no_code', requestUrl.origin)
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Code exchange failed:', error);

    return NextResponse.redirect(
      new URL(
        `/auth/error?error=exchange_failed&error_description=${encodeURIComponent(
          error.message
        )}`,
        requestUrl.origin
      )
    );
  }

  // If this is a password recovery flow, redirect to the reset-password page
  if (type === 'recovery') {
    return NextResponse.redirect(
      new URL('/auth/reset-password', requestUrl.origin)
    );
  }

  // For regular sign-in, check admin permission
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    const redirectUrl = `${requestUrl.origin}/auth/error?error=${sessionError.message}`;
    return NextResponse.redirect(redirectUrl);
  }

  if (!sessionData.session) {
    const redirectUrl = `${requestUrl.origin}/auth/error?error=No session found.`;
    return NextResponse.redirect(redirectUrl);
  }

  const email = normalizeEmail(sessionData.session.user.email);
  if (email) {
    const permission = await checkIfAdmin(email);
    if (!permission.success) {
      console.log('[auth/callback] permission denied', {
        email,
        error: permission.error,
      });

      await supabase.auth.signOut();
      const allCookies = cookieStore.getAll();
      allCookies.forEach(cookie => cookieStore.delete(cookie.name));

      if (permission.error?.code === 'UserNotFound') {
        const errorDescription = encodeURIComponent('Your account was not found. Please contact support.');
        const redirectUrl = `${requestUrl.origin}/auth/error?error=user_not_found&error_description=${errorDescription}`;
        return NextResponse.redirect(redirectUrl);
      }

      const redirectUrl = `${requestUrl.origin}/auth/login`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  console.log('[auth/callback] permission granted', { email });
  return NextResponse.redirect(
    new URL('/', requestUrl.origin)
  );
}