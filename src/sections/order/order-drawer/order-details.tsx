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
import { IProduct } from '@/sections/products/products-table';
import { ICustomer } from '@/schemas/customer';


export type OrderStatus = 'canceled' | 'complete' | 'pending' | 'rejected';

interface Order {
  _id: string;
  status: OrderStatus;
  createdAt: Date;
  total: number;
  items: IProduct[];
  customer: ICustomer
}

export interface OrderDetailsProps {
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
  order: Order;
}

export const statusMap: Record<OrderStatus, string> = {
  canceled: 'warning',
  complete: 'success',
  pending: 'info',
  rejected: 'error',
};

export const OrderDetails = (props: OrderDetailsProps) => {
  const { onApprove, onEdit, onReject, order } = props;
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  // Ensure createdAt is a valid date
  const createdAt = order.createdAt ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm') : 'Invalid Date';
  const statusColor = statusMap[order.status as OrderStatus] || 'default'; // Provide default value
  const totalAmount = numeral(order.total).format(`RSD0,0.00`);
  const align = lgUp ? 'horizontal' : 'vertical';
  const items = order.items || [];

  return (
    <Stack spacing={6}>
      <Stack spacing={3}>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={3}
        >
          <Typography variant="h6">Details</Typography>
          <Button
            color="inherit"
            onClick={onEdit}
            size="small"
            startIcon={
              <SvgIcon>
                <Edit02Icon />
              </SvgIcon>
            }
          >
            Edit
          </Button>
        </Stack>
        <PropertyList>
          <PropertyListItem
            align={align}
            disableGutters

            label="ID"
            value={props.order._id}
          />
          <PropertyListItem
            align={align}
            disableGutters

            label="Number"
            value={order._id}
          />
          <PropertyListItem
            align={align}
            disableGutters
            label="Customer"
          >
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {order.customer.name}
            </Typography>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {order.customer.streetAddress}
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

            label="Date"
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

            label="Total Amount"
            value={totalAmount}
          />
          <PropertyListItem
            align={align}
            disableGutters

            label="Status"
          >
            <SeverityPill color={statusColor}>{order.status}</SeverityPill>
          </PropertyListItem>
        </PropertyList>
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          justifyContent="flex-end"
          spacing={2}
        >
          <Button
            onClick={onApprove}
            size="small"
            variant="contained"
          >
            Approve
          </Button>
          <Button
            color="error"
            onClick={onReject}
            size="small"
            variant="outlined"
          >
            Reject
          </Button>
        </Stack>
      </Stack>
      <Stack spacing={3}>
        <Typography variant="h6">Line items</Typography>
        <Scrollbar>
          <Table sx={{ minWidth: 400 }}>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Billing Cycle</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const unitAmount = numeral(item.quantityUnit).format(`RSD0,0.00`);

                return (
                  <TableRow key={item._id}>
                    <TableCell>
                      {item.name} x {item.quantity}
                    </TableCell>
                    {/* <TableCell>{item.billingCycle}</TableCell> */}
                    <TableCell>{unitAmount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>
      </Stack>
    </Stack>
  );
};

OrderDetails.propTypes = {
  onApprove: PropTypes.func,
  onEdit: PropTypes.func,
  onReject: PropTypes.func,
  order: PropTypes.object,
};
