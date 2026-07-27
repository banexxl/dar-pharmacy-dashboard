import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';
import { SeverityPill } from 'src/components/severity-pill';
import { Scrollbar } from 'src/components/scrollbar';
import { Customer } from '@/schemas/customer';
import { OrderDetailsProps, OrderStatus } from '@/schemas/order';
import Link from 'next/link';


export const OrderDetails = (props: OrderDetailsProps) => {
  const { onApprove, onEdit, onReject, order } = props;
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  // Ensure createdAt is a valid date
  const createdAt = order.created_at ? format(new Date(order.created_at), 'dd/MM/yyyy HH:mm') : 'Invalid Date';
  const totalAmount = numeral(order.total).format(`RSD0,0.00`);
  const align = lgUp ? 'horizontal' : 'vertical';
  const items = order.order_items || [];

  return (
    <Stack spacing={6}>
      <Stack spacing={3}>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={3}
        >
          <Typography variant="h6">Detalji</Typography>
          <Button
            color="inherit"
            disabled={order.order_status === 'delivered' || order.order_status === 'cancelled'}
            onClick={onEdit}
            size="small"
            startIcon={
              <SvgIcon>
                <Edit02Icon />
              </SvgIcon>
            }
          >
            Izmeni
          </Button>
        </Stack>
        <PropertyList>
          <PropertyListItem
            align={align}
            disableGutters

            label="ID"
            value={order.id}
          />
          <PropertyListItem
            align={align}
            disableGutters

            label="Broj porudžbine"
            value={order.order_number}
          />
          < PropertyListItem
            align={align}
            disableGutters
            label="Kupac"
          >
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {order.customer.full_name}
            </Typography>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {order.customer.phone_number}
            </Typography>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {order.customer.street_address}
            </Typography>
            <Typography
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
            </Typography>
          </PropertyListItem>
          <PropertyListItem
            align={align}
            disableGutters

            label="Datum"
            value={createdAt}
          />
          {/* <PropertyListItem
            align={align}
            disableGutters

            label="Promotion Code"
            value={order.promotionCode}
          /> */}
          <PropertyListItem
            align={align}
            disableGutters

            label="Total"
            value={totalAmount}
          />
          <PropertyListItem
            align={align}
            disableGutters

            label="Status"
          >
            <SeverityPill color={
              order.order_status == 'pending' ? 'warning' :
                order.order_status == 'shipped' ? 'info' :
                  order.order_status == 'delivered' ? 'success' :
                    order.order_status == 'cancelled' ? 'error' : 'warning'
            }>{
                order.order_status == 'pending' ? 'Na čekanju' :
                  order.order_status == 'shipped' ? 'Poslato' :
                    order.order_status == 'delivered' ? 'Dostavljeno' :
                      order.order_status == 'cancelled' ? 'Otkazano' : 'Na čekanju'
              }</SeverityPill>
          </PropertyListItem>
        </PropertyList>
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          justifyContent="flex-end"
          spacing={2}
        >
          <Link href={`/porudzbenice/${order.order_number}`}>
            <Button
              onClick={onApprove}
              size="small"
              variant="contained"
            >
              Detalji {order.order_number}
            </Button>
          </Link>
          {/* <Button
            color="error"
            onClick={onReject}
            size="small"
            variant="outlined"
          >
            Reject
          </Button> */}
        </Stack>
      </Stack>
      <Stack spacing={3}>
        <Typography variant="h6">Line items</Typography>
        <Scrollbar>
          <Table sx={{ minWidth: 400 }}>
            <TableHead>
              <TableRow>
                <TableCell>Naziv</TableCell>
                <TableCell sx={{ wordWrap: 'break-word', maxWidth: '100px' }}>Jedinica / Količina</TableCell>
                <TableCell sx={{ wordWrap: 'break-word', maxWidth: '80px' }}>Broj artikla</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.name}
                    </TableCell>
                    {/* <TableCell>{item.billingCycle}</TableCell> */}
                    <TableCell>{item.quantity}/{item.quantity_unit}</TableCell>
                    <TableCell>
                      {item.count}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>
      </Stack>
    </Stack >
  );
};

OrderDetails.propTypes = {
  onApprove: PropTypes.func,
  onEdit: PropTypes.func,
  onReject: PropTypes.func,
  order: PropTypes.object,
};
