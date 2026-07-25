import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const errorRedirect = (request: NextRequest, error: string, description: string, code = '') => {
  const url = new URL('/auth/error', request.url);
  url.searchParams.set('error', error);
  url.searchParams.set('error_description', description);
  if (code) url.searchParams.set('error_code', code);
  return NextResponse.redirect(url);
};

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get('error');
  if (error) {
    return errorRedirect(
      request,
      error,
      request.nextUrl.searchParams.get('error_description') || '',
      request.nextUrl.searchParams.get('error_code') || '',
    );
  }

  const code = request.nextUrl.searchParams.get('code');
  if (!code) return errorRedirect(request, 'no_code', 'No code provided in the callback.');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_SUPABASE_SECRET_KEY;
  if (!url || !key) return errorRedirect(request, 'missing_supabase_key', 'Supabase auth is not configured.');

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
  if (authError) return errorRedirect(request, 'exchange_failed', authError.message);

  const email = data.session?.user.email?.toLowerCase();
  if (!email) return errorRedirect(request, 'no_email', 'No email was returned from Google OAuth.');

  const { data: admin, error: adminError } = await supabase.from('admins').select('id').eq('email', email).maybeSingle();
  if (adminError) return errorRedirect(request, 'admin_lookup_failed', adminError.message);
  if (!admin) return errorRedirect(request, 'access_denied', 'Your account is not listed in the admins table.');

  return NextResponse.redirect(new URL('/', request.url));
}
