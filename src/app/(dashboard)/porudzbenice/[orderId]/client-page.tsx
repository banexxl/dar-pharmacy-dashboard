'use client';

import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import CalendarIcon from '@untitled-ui/icons-react/build/esm/Calendar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { Order } from '@/schemas/order';
import { OrderSummary } from '@/sections/order/order-summary';
import { OrderItems } from '@/sections/order/order-items';
import { format, isValid } from 'date-fns';

interface Props {
  order: Order | null;
}

const Page = ({ order }: Props) => {
  if (!order) {
    return (
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Typography variant="h5">Porudžbenica nije pronađena.</Typography>
        </Container>
      </Box>
    );
  }

  const createdAtDate = new Date(order.created_at);
  const formattedDate = isValid(createdAtDate)
    ? format(createdAtDate, 'dd.MM.yyyy. HH:mm')
    : '';

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <div>
              <Link
                color="text.primary"
                href={'/porudzbenice'}
                sx={{
                  alignItems: 'center',
                  display: 'inline-flex',
                }}
                underline="hover"
              >
                <SvgIcon sx={{ mr: 1 }}>
                  <ArrowLeftIcon />
                </SvgIcon>
                <Typography variant="subtitle2">Porudžbenice</Typography>
              </Link>
            </div>
            <div>
              <Stack spacing={1}>
                <Typography variant="h4">{order.order_number}</Typography>
                {formattedDate && (
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                  >
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Kreirano
                    </Typography>
                    <SvgIcon color="action" fontSize="small">
                      <CalendarIcon />
                    </SvgIcon>
                    <Typography variant="body2">{formattedDate}</Typography>
                  </Stack>
                )}
              </Stack>
            </div>
            <OrderSummary order={order} />
            <OrderItems items={order.order_items || []} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
