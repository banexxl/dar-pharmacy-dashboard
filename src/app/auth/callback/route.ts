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
      error_description: errorDescription ?? 'OAuth authentication failed',
    });

    return NextResponse.redirect(
      new URL(`/auth/error?${params.toString()}`, requestUrl.origin)
    );
  }

  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/error?error=no_code', requestUrl.origin)
    );
  }
  const supabase = await createSupabaseServerClient();
  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('OAuth exchange failed:', error);

    return NextResponse.redirect(
      new URL(
        `/auth/error?error=exchange_failed&error_description=${encodeURIComponent(
          error.message
        )}`,
        requestUrl.origin
      )
    );
  }

  // Retrieve the session after OAuth to get the user details
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  // If there's an error retrieving the session, log it and redirect to error page
  if (sessionError) {
    const redirectUrl = `${requestUrl.origin}/auth/error?error=${sessionError.message}`;
    return NextResponse.redirect(redirectUrl);
  }

  // If no session is found, log it and redirect to error page
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
      const deleteResult = await supabase.auth.admin.deleteUser(sessionData.session.user.id);
      console.log('[auth/callback] delete user result', deleteResult);
      const allCookies = cookieStore.getAll();
      allCookies.forEach(cookie => cookieStore.delete(cookie.name));

      if (permission.error?.code === 'EmailInUse') {
        console.log('[auth/callback] redirect EmailInUse', {
          email,
          error: permission.error,
        });
        const errorDescription = encodeURIComponent(permission.error?.message || 'This email is already in use');
        const redirectUrl = `${requestUrl.origin}/auth/error?error=email_in_use&error_description=${errorDescription}`;
        return NextResponse.redirect(redirectUrl);
      }

      if (permission.error?.code === 'UserNotFound') {
        console.log('[auth/callback] redirect UserNotFound', {
          email,
          error: permission.error,
        });
        const errorDescription = encodeURIComponent('Your account was not found. Please register first, or contact support.');
        const redirectUrl = `${requestUrl.origin}/auth/error?error=user_not_found&error_description=${errorDescription}`;
        return NextResponse.redirect(redirectUrl);
      }

      console.log('[auth/callback] redirect sign_in_required', {
        email,
        error: permission.error,
      });

      const redirectUrl = `${requestUrl.origin}/auth/sign-in?message=sign_in_required`;
      return NextResponse.redirect(redirectUrl);
    }
  }
  console.log('[auth/callback] permission granted', { email });
  return NextResponse.redirect(
    new URL('/', requestUrl.origin)
  );
}