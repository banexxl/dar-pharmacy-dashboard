import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/services/supabase-server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(
      new URL(
        '/auth/error?error=no_code',
        requestUrl.origin
      )
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

  return NextResponse.redirect(
    new URL('/', requestUrl.origin)
  );
}