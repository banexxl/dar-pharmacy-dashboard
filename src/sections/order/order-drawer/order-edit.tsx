import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Order } from '@/schemas/order';
import moment from 'moment';

const statusOptions = [
  {
    label: 'Canceled',
    value: 'canceled',
  },
  {
    label: 'Complete',
    value: 'complete',
  },
  {
    label: 'Pending',
    value: 'pending',
  },
  {
    label: 'Rejected',
    value: 'rejected',
  },
];

type OrderEditProps = {
  onCancel?: () => void;
  onSave?: () => void;
  order?: Order;
}

export const OrderEdit = (props: OrderEditProps) => {
  const { onCancel, onSave, order } = props;

  // Parse the ISO date string to a Date object
  const createdAtDate = moment(order?.createdAt).toDate()

  // Format the Date object
  const createdAt = format(createdAtDate, 'dd/MM/yyyy HH:mm');

  return (
    <Stack spacing={6}>
      <Stack spacing={3}>
        <Typography variant="h6">Details</Typography>
        <Stack spacing={3}>
          <TextField
            disabled
            fullWidth
            label="ID"
            name="id"
            value={order?._id}
          />
          <TextField
            disabled
            fullWidth
            label="ID porudžbenice"
            name="number"
            value={order?.orderNumber}
          />
          <TextField
            disabled
            fullWidth
            label="Ime"
            name="customer_name"
            value={order?.customer.name}
          />
          <TextField
            disabled
            fullWidth
            label="Datum"
            name="date"
            value={createdAt}
          />
          <TextField
            fullWidth
            label="Adresa"
            name="address"
            value={order?.customer.streetAddress}
          />
          <TextField
            fullWidth
            label="Država"
            name="country"
            value={order?.customer.country}
          />
          <TextField
            fullWidth
            label="Grad"
            name="state_region"
            value={order?.customer.city}
          />
          <TextField
            fullWidth
            label="Ukupan iznos"
            name="amount"
            value={order?.total}
          />
          <TextField
            fullWidth
            label="Status"
            name="status"
            select
            SelectProps={{ native: true }}
            value={order?.status}
          >
            {statusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </TextField>
        </Stack>
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          spacing={2}
        >
          <Button
            color="primary"
            onClick={onSave}
            size="small"
            variant="contained"
          >
            Save changes
          </Button>
          <Button
            color="inherit"
            onClick={onCancel}
            size="small"
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

OrderEdit.propTypes = {
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
  order: PropTypes.object,
};
