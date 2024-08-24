import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead'; // Import TableHead
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { SeverityPill } from 'src/components/severity-pill';
import { OrderDetailsProps, OrderStatus, statusMap } from './order-drawer/order-details';
import { Order } from '@/schemas/order';

export const OrderListTable = (props: any) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => { },
    onRowsPerPageChange,
    onSelect,
    page = 0,
    rowsPerPage = 0,
  } = props;

  return (
    <div>
      <Table>
        {/* Add Table Head */}
        <TableHead>
          <TableRow>
            <TableCell align="center">Date</TableCell>
            <TableCell align="left">Order Number</TableCell>
            <TableCell align="right">Payment Method</TableCell>
            <TableCell align="right">Customer Name</TableCell>
            <TableCell align="right">Customer Email</TableCell>
            <TableCell align="right">Status</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((order: Order) => {
            // Parse the date string into a Date object
            const createdAtDate = new Date(order.createdAt);

            // Ensure the date is valid
            if (isNaN(createdAtDate.getTime())) {
              console.error('Invalid date for order:', order);
              return null; // Skip rendering this row if the date is invalid
            }

            const createdAtMonth = format(createdAtDate, 'LLL').toUpperCase();
            const createdAtDay = format(createdAtDate, 'd');
            const totalAmount = numeral(order.total).format(`${'RSD'}0,0.00`);

            // Ensure order.status is treated as OrderStatus
            const statusColor = statusMap[order.status as OrderStatus] || 'warning';

            return (
              <TableRow
                hover
                key={order._id}
                onClick={() => onSelect?.(order._id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.200',
                      borderRadius: 2,
                      maxWidth: 'fit-content',
                      ml: 5,
                      p: 1,
                    }}
                  >
                    <Typography
                      align="center"
                      variant="subtitle2"
                    >
                      {createdAtMonth}
                    </Typography>
                    <Typography
                      align="center"
                      variant="h6"
                    >
                      {createdAtDay}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="left">
                  <Box>
                    <Typography variant="subtitle2">{order.number}</Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Total of {totalAmount}
                    </Typography>
                  </Box>
                </TableCell> {/* Order Number */}
                <TableCell align="right">{order.paymentMethod}</TableCell> {/* Payment Method */}
                <TableCell align="right">{order.customer.name}</TableCell> {/* Customer Name */}
                <TableCell align="right">{order.customer.email}</TableCell> {/* Customer Email */}
                <TableCell align="right">
                  <SeverityPill color={statusColor}>{order.status}</SeverityPill>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

OrderListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelect: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
};
