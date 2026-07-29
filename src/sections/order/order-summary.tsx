'use client';

import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { format, isValid } from 'date-fns';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';
import { Order, OrderStatus } from '@/schemas/order';
import toast from 'react-hot-toast';

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Na čekanju' },
  { value: 'shipped', label: 'Poslato' },
  { value: 'delivered', label: 'Isporučeno' },
  { value: 'cancelled', label: 'Otkazano' },
];

const paymentStatusLabels: Record<string, string> = {
  pending: 'Na čekanju',
  paid: 'Plaćeno',
  failed: 'Neuspelo',
  refunded: 'Refundirano',
  cancelled: 'Otkazano',
};

const paymentMethodLabels: Record<string, string> = {
  'credit card': 'Kreditna kartica',
  paypal: 'PayPal',
  cash: 'Gotovina',
  check: 'Ček',
  'cash-on-delivery': 'Pouzećem',
};

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary = (props: OrderSummaryProps) => {
  const { order, ...other } = props;
  const mdUp = useMediaQuery((theme: any) => theme.breakpoints.up('md'));
  const [status, setStatus] = useState<OrderStatus>(order.order_status);
  const [saving, setSaving] = useState(false);

  const createdAtDate = new Date(order.created_at);
  const formattedCreatedAt = isValid(createdAtDate)
    ? format(createdAtDate, 'dd.MM.yyyy. HH:mm')
    : '-';

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(event.target.value as OrderStatus);
  }, []);

  const handleSaveStatus = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/orders/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, status }),
      });

      if (response.ok) {
        toast.success('Status uspešno promenjen.');
      } else {
        toast.error('Greška prilikom promene statusa.');
      }
    } catch {
      toast.error('Greška prilikom promene statusa.');
    } finally {
      setSaving(false);
    }
  }, [order.id, status]);

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...other}>
      <CardHeader title="Informacije o porudžbenici" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          label="Kupac"
        >
          <Typography variant="subtitle2">
            {order.customer ? order.customer.full_name : 'Neregistrovani korisnik'}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {order.customer ? order.customer.email : '-'}
          </Typography>
          {order.customer?.phone_number && (
            <Typography color="text.secondary" variant="body2">
              {order.customer.phone_number}
            </Typography>
          )}
          {order.customer?.street_address && (
            <Typography color="text.secondary" variant="body2">
              {order.customer.street_address}
              {order.customer.city ? `, ${order.customer.city}` : ''}
            </Typography>
          )}
        </PropertyListItem>
        <Divider />
        <PropertyListItem
          align={align}
          label="Broj porudžbenice"
          value={order.order_number}
        />
        <Divider />
        <PropertyListItem
          align={align}
          label="Datum"
          value={formattedCreatedAt}
        />
        <Divider />
        <PropertyListItem
          align={align}
          label="Način plaćanja"
          value={paymentMethodLabels[order.payment_method] || order.payment_method}
        />
        <Divider />
        <PropertyListItem
          align={align}
          label="Status plaćanja"
          value={paymentStatusLabels[order.payment_status] || order.payment_status}
        />
        <Divider />
        {order.transaction_number && (
          <>
            <PropertyListItem
              align={align}
              label="Broj transakcije"
              value={order.transaction_number}
            />
            <Divider />
          </>
        )}
        <PropertyListItem
          align={align}
          label="Ukupan iznos"
          value={`${order.total} RSD`}
        />
        <Divider />
        <PropertyListItem
          align={align}
          label="Status porudžbenice"
        >
          <Stack
            alignItems={{
              xs: 'stretch',
              sm: 'center',
            }}
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1}
          >
            <TextField
              label="Status"
              margin="normal"
              name="status"
              onChange={handleChange}
              select
              SelectProps={{ native: true }}
              sx={{
                flexGrow: 1,
                minWidth: 150,
              }}
              value={status}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
            <Button
              variant="contained"
              onClick={handleSaveStatus}
              disabled={saving}
            >
              {saving ? 'Čuvam...' : 'Sačuvaj'}
            </Button>
          </Stack>
        </PropertyListItem>
      </PropertyList>
    </Card>
  );
};

OrderSummary.propTypes = {
  order: PropTypes.object.isRequired,
};
