import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { SeverityPill } from 'src/components/severity-pill';
import { Order } from '@/schemas/order';
import { useMemo } from 'react';


export function descendingComparator<T>(a: T, b: T, sortBy: keyof T) {
  if (b[sortBy] < a[sortBy]) {
    return -1;
  }
  if (b[sortBy] > a[sortBy]) {
    return 1;
  }
  return 0;
}

export type SortDir = 'asc' | 'desc';

export type SortBy =
  | 'created_at'
  | 'order_number'
  | 'total'
  | 'payment_method'
  | 'payment_status'
  | 'order_status';

export function getComparator<SortBy extends string | number | symbol>(
  sortDir: SortDir,
  sortBy: SortBy,
): (
  a: { [key in SortBy]: number | string },
  b: { [key in SortBy]: number | string },
) => number {
  return sortDir === 'desc'
    ? (a, b) => descendingComparator(a, b, sortBy)
    : (a, b) => -descendingComparator(a, b, sortBy);
}

export const OrderListTable = (props: any) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => { },
    onRowsPerPageChange,
    onTabChange,
    onSelect,
    page = 0,
    rowsPerPage = 0,
    sortBy,
    sortDir,
    tab
  } = props;

  const visibleRows = useMemo(
    () =>
      [...items]
        .filter(order => tab === 'all' || order.order_status === tab)
        .sort(getComparator(sortDir, sortBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [items, tab, sortDir, sortBy, page, rowsPerPage],
  );

  return (
    <div>
      <Table>
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
          {visibleRows.map((order: Order) => {

            const createdAtDate = new Date(order.created_at);

            if (isNaN(createdAtDate.getTime())) {
              console.error('Invalid date for order:', order);
              return null;
            }

            const createdAtMonth = format(createdAtDate, 'LLL').toUpperCase();
            const createdAtDay = format(createdAtDate, 'd');
            const totalAmount = numeral(order.total).format(`${'RSD'}0,0.00`);

            return (
              <TableRow
                hover
                key={order.id}
                onClick={() => onSelect?.(order.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ alignItems: 'center', display: 'flex' }}>
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
                    <Typography align="center" variant="subtitle2">
                      {createdAtMonth}
                    </Typography>
                    <Typography align="center" variant="h6">
                      {createdAtDay}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="left">
                  <Typography variant="subtitle2">{order.order_number}</Typography>
                </TableCell>
                <TableCell>
                  <Typography color="text.secondary" variant="body2">
                    RSD {totalAmount}
                  </Typography>
                </TableCell>
                <TableCell align="left">
                  {
                    order.payment_method == 'cash-on-delivery' ? 'Pouzećem'
                      : order.payment_method == 'cash' ? 'Gotovinom'
                        : order.payment_method == 'check' ? 'Čekom'
                          : order.payment_method == 'credit card' ? 'Kreditnom karticom'
                            : order.payment_method == 'paypal' ? 'PayPal' : 'Nepoznato'
                  }
                </TableCell>
                <TableCell align="left">{order.customer ? order.customer.full_name : 'Neregistrovani korisnik'}</TableCell>
                <TableCell align="left">{order.customer ? order.customer.email : 'Neregistrovani korisnik'}</TableCell>
                <TableCell align="left">
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
    </div >
  );
};

OrderListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onTabChange: PropTypes.func,
  onSelect: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  sortBy: PropTypes.string.isRequired,
  sortDir: PropTypes.string.isRequired,
  tab: PropTypes.string.isRequired
};
