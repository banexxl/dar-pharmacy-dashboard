import Link from 'next/link';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

export const metadata = { title: 'Auth Error' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const error = single(query.error) || 'auth_error';
  const errorCode = single(query.error_code) || '';
  const description = single(query.error_description) || 'Something went wrong during sign-in.';

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
