import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Order } from '@/schemas/order';
import moment from 'moment';
import { useFormik } from 'formik';
import * as Yup from 'yup'; // For validation

const statusOptions = [
  {
    label: 'Otkazano',
    value: 'cancelled',
  },
  {
    label: 'Dostavljeno',
    value: 'delivered',
  },
  {
    label: 'Na čekanju',
    value: 'pending',
  },
  {
    label: 'Poslato',
    value: 'shipped',
  },
];

type OrderEditProps = {
  onCancel?: () => void;
  onSave?: (values: any) => void;
  order?: Order;
};

export const OrderEdit = (props: OrderEditProps) => {
  const { onCancel, onSave, order } = props;
  // Parse and format the createdAt date
  const createdAtDate = moment(order?.created_at).toDate();
  const createdAt = format(createdAtDate, 'dd/MM/yyyy HH:mm');

  // Formik setup
  const formik = useFormik({
    initialValues: {
      address: order?.customer.street_address || '',
      country: order?.customer.country || '',
      city: order?.customer.city || '',
      status: order?.status || '',
      orderNumber: order?.order_number || '',
    },
    validationSchema: Yup.object({
      address: Yup.string().required('Address is required'),
      country: Yup.string().required('Country is required'),
      city: Yup.string().required('City is required'),
      status: Yup.string().required('Status is required'),
      orderNumber: Yup.string().required('Order number is required'),
    }),
    onSubmit: (values) => {
      if (onSave) {
        onSave(values); // Pass the updated values to the onSave handler
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={6}>
        <Stack spacing={3}>
          <Typography variant="h6">Detalji</Typography>
          <Stack spacing={3}>
            <TextField
              disabled
              fullWidth
              label="ID"
              name="id"
              value={order?.id}
            />
            <TextField
              disabled
              fullWidth
              label="ID porudžbenice"
              name="number"
              value={order?.order_number}
            />
            <TextField
              disabled
              fullWidth
              label="Ime"
              name="customer_name"
              value={order?.customer.full_name}
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
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
            />
            <TextField
              fullWidth
              label="Država"
              name="country"
              value={formik.values.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.country && Boolean(formik.errors.country)}
              helperText={formik.touched.country && formik.errors.country}
            />
            <TextField
              fullWidth
              label="Grad"
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.city && Boolean(formik.errors.city)}
              helperText={formik.touched.city && formik.errors.city}
            />
            <TextField
              fullWidth
              label="Ukupan iznos"
              name="amount"
              disabled
              value={order?.total}
            />
            <TextField
              fullWidth
              label="Status"
              name="status"
              select
              SelectProps={{ native: true }}
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </Stack>
          <Stack alignItems="center" direction="row" flexWrap="wrap" spacing={2}>
            <Button color="primary" type="submit" size="small" variant="contained">
              Sačuvaj
            </Button>
            <Button color="inherit" onClick={onCancel} size="small">
              Odustani
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </form>
  );
};

OrderEdit.propTypes = {
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
  order: PropTypes.object,
};
