'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

export default function Page() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'auth_error';
  const errorCode = searchParams.get('error_code') || '';
  const description = searchParams.get('error_description') || 'Something went wrong during sign-in.';

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', minHeight: '100vh', px: 3, py: 8 }}>
      <Card sx={{ maxWidth: 560, mx: 'auto', width: '100%' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4">Sign-in failed</Typography>
            <Typography color="text.secondary">{description}</Typography>
            <Typography color="text.secondary" variant="body2">
              {errorCode ? `Code: ${errorCode}` : `Error: ${error}`}
            </Typography>
            <Button component={Link} href="/auth/login" variant="contained">Back to login</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

