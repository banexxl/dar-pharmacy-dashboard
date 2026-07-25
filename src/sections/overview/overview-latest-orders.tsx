import { format, formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import Link from 'next/link';
import { Order } from '@/schemas/order';
import { indigo } from '@/theme/colors';

const statusMap = {
  pending: 'warning',
  delivered: 'success',
  refunded: 'error'
};

export const OverviewLatestOrders = (props: any) => {

  const { orders = [], sx } = props;
  console.log('orders', orders);

  return (
    <Card sx={sx}>
      <CardHeader title="Poslednje porudžbenice" />
      <Scrollbar sx={{ flexGrow: 1 }}>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Order
                </TableCell>
                <TableCell>
                  Customer
                </TableCell>
                <TableCell sortDirection="desc">
                  Date
                </TableCell>
                <TableCell>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order: Order) => {
                //const createdAt = format(order.createdAt, 'dd/MM/yyyy');
                const createdAt = new Date(order.created_at);
                const ago = formatDistanceToNow(createdAt);
                return (
                  <TableRow
                    hover
                    key={order.order_number}
                  >
                    <TableCell>
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      {order.customer.full_name}
                    </TableCell>
                    <TableCell>
                      {ago}
                    </TableCell>
                    <TableCell>
                      <SeverityPill color={
                        order.status == 'pending' ? 'warning'
                          : order.status == 'delivered' ? 'success'
                            : order.status == 'cancelled' ? 'error'
                              : order.status == 'shipped' ? 'info'
                                : 'primary'
                      }>
                        {order.status}
                      </SeverityPill>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={(
            <SvgIcon fontSize="small" style={{ textDecoration: 'none', color: indigo.main }}>
              <ArrowRightIcon />
            </SvgIcon>
          )}
          size="small"
          variant="text"
        >
          <Link href='/porudzbenice' style={{ textDecoration: 'none', color: indigo.main }}>
            Pogledaj sve
          </Link>
        </Button>
      </CardActions>
    </Card>
  );
};

OverviewLatestOrders.prototype = {
  orders: PropTypes.array,
  sx: PropTypes.object
};
