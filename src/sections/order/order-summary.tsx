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
import { Order } from '@/schemas/order'; // Import the correct type for Order

const statusOptions = ['Canceled', 'Complete', 'Rejected'];

interface OrderSummaryProps {
  order: Order; // Ensure Order type is correctly defined
}

export const OrderSummary = (props: OrderSummaryProps) => {
  console.log('props', props);

  const { order, ...other } = props;
  const mdUp = useMediaQuery((theme: any) => theme.breakpoints.up('md'));
  const [status, setStatus] = useState(statusOptions[0]);

  // Convert order.createdAt to a Date object and validate
  const createdAtDate = new Date(order.createdAt);
  const formattedCreatedAt = isValid(createdAtDate)
    ? format(createdAtDate, 'dd/MM/yyyy HH:mm')
    : 'Invalid date';

  const handleChange = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
    setStatus(event.target.value as string);
  }, []);

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...other}>
      <CardHeader title="Basic info" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          label="Customer"
          key={Math.random()}
        >
          <Typography variant="subtitle2">{order.customer.name}</Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {order.customer.email}
          </Typography>
          {/* <Typography
            color="text.secondary"
            variant="body2"
          >
            {order.customer.city}
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {order.customer.country}
          </Typography> */}
        </PropertyListItem>
        <Divider />
        <PropertyListItem
          align={align}
          label="ID"
          value={order._id}
        />
        <Divider />
        <PropertyListItem
          align={align}
          label="Invoice"
          value={order.number}
        />
        <Divider />
        <PropertyListItem
          align={align}
          label="Date"
          value={formattedCreatedAt}
        />
        <Divider />
        {/* <PropertyListItem
          align={align}
          label="Promotion Code"
          value={order.promotionCode}
        />
        <Divider /> */}
        <PropertyListItem
          align={align}
          label="Total Amount"
          value={`${'RSD'}${order.total}`}
        />
        <Divider />
        <PropertyListItem
          align={align}
          label="Status"
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
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </TextField>
            <Button variant="contained">Save</Button>
          </Stack>
        </PropertyListItem>
      </PropertyList >
    </Card >
  );
};

// Define PropTypes to ensure props are validated at runtime
OrderSummary.propTypes = {
  order: PropTypes.shape({
    createdAt: PropTypes.string.isRequired,
    customer: PropTypes.shape({
      name: PropTypes.string.isRequired,
      address1: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      country: PropTypes.string.isRequired,
    }).isRequired,
    id: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
    promotionCode: PropTypes.string,
    currency: PropTypes.string.isRequired,
    totalAmount: PropTypes.number.isRequired,
  }).isRequired,
};
