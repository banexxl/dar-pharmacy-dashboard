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
import { Order, OrderStatus, statusMap } from '@/schemas/order';

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
            <TableCell align="center">Datum</TableCell>
            <TableCell align="left">Broj porudžbenice</TableCell>
            <TableCell align='left'>Suma</TableCell>
            <TableCell align="left">Način plaćanja</TableCell>
            <TableCell align="left">Ime</TableCell>
            <TableCell align="left">Email</TableCell>
            <TableCell align="left">Status</TableCell>
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
                    <Typography variant="subtitle2">{order.orderNumber}</Typography>

                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    RSD {totalAmount}
                  </Typography>
                </TableCell>
                <TableCell align="left">{
                  order.paymentMethod == 'cash-on-delivery' ? 'Pouzećem'
                    : order.paymentMethod == 'cash' ? 'Gotovinom'
                      : order.paymentMethod == 'check' ? 'Čekom'
                        : order.paymentMethod == 'credit card' ? 'Kreditnom karticom'
                          : order.paymentMethod == 'paypal' ? 'PayPal' : 'Nepoznato'
                }</TableCell>
                <TableCell align="left">{order.customer.name}</TableCell>
                <TableCell align="left">{order.customer.email}</TableCell>
                <TableCell align="left">
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
