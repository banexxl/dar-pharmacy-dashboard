import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Alert from '@mui/material/Alert';
import { SeverityPill } from 'src/components/severity-pill';
import { Order, OrderStatus } from '@/schemas/order';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/format-currency';


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

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, OrderStatus>>({});
  const [internalSortBy, setInternalSortBy] = useState<string>(sortBy || 'created_at');
  const [internalSortDir, setInternalSortDir] = useState<'asc' | 'desc'>(sortDir || 'desc');

  const handleSortChange = (column: string) => {
    if (internalSortBy === column) {
      setInternalSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setInternalSortBy(column);
      setInternalSortDir('asc');
    }
  };

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pending', label: 'Na čekanju' },
    { value: 'shipped', label: 'Poslato' },
    { value: 'delivered', label: 'Dostavljeno' },
    { value: 'cancelled', label: 'Otkazano' },
  ];

  const getOrderStatus = (order: Order): OrderStatus => {
    return orderStatuses[order.id] ?? order.order_status;
  };

  const handleStatusClick = useCallback((event: React.MouseEvent<HTMLElement>, orderId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  }, []);

  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedOrderId(null);
  }, []);

  const handleStatusChange = useCallback(async (newStatus: OrderStatus) => {
    if (!selectedOrderId) return;

    handlePopoverClose();

    try {
      const response = await fetch('/api/orders/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrderId, status: newStatus }),
      });

      if (response.ok) {
        setOrderStatuses((prev) => ({ ...prev, [selectedOrderId]: newStatus }));
        toast.success('Status uspešno promenjen.');
      } else {
        toast.error('Greška prilikom promene statusa.');
      }
    } catch {
      toast.error('Greška prilikom promene statusa.');
    }
  }, [selectedOrderId, handlePopoverClose]);

  const visibleRows = useMemo(
    () =>
      [...items]
        .filter(order => tab === 'all' || order.order_status === tab)
        .sort(getComparator(internalSortDir, internalSortBy as any))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [items, tab, internalSortDir, internalSortBy, page, rowsPerPage],
  );

  return (
    <div>
      <Box sx={{ p: 2 }}>
        <Alert severity="info" sx={{ py: 0.5 }}>
          Kliknite na zaglavlje kolone za sortiranje. Kliknite na status porudžbine da ga promenite.
        </Alert>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" sortDirection={internalSortBy === 'created_at' ? internalSortDir : false}>
              <TableSortLabel
                active={internalSortBy === 'created_at'}
                direction={internalSortBy === 'created_at' ? internalSortDir : 'asc'}
                onClick={() => handleSortChange('created_at')}
              >
                Datum
              </TableSortLabel>
            </TableCell>
            <TableCell align="left" sortDirection={internalSortBy === 'order_number' ? internalSortDir : false}>
              <TableSortLabel
                active={internalSortBy === 'order_number'}
                direction={internalSortBy === 'order_number' ? internalSortDir : 'asc'}
                onClick={() => handleSortChange('order_number')}
              >
                Broj porudžbenice
              </TableSortLabel>
            </TableCell>
            <TableCell align="left" sortDirection={internalSortBy === 'total' ? internalSortDir : false}>
              <TableSortLabel
                active={internalSortBy === 'total'}
                direction={internalSortBy === 'total' ? internalSortDir : 'asc'}
                onClick={() => handleSortChange('total')}
              >
                Suma
              </TableSortLabel>
            </TableCell>
            <TableCell align="left" sortDirection={internalSortBy === 'payment_method' ? internalSortDir : false}>
              <TableSortLabel
                active={internalSortBy === 'payment_method'}
                direction={internalSortBy === 'payment_method' ? internalSortDir : 'asc'}
                onClick={() => handleSortChange('payment_method')}
              >
                Način plaćanja
              </TableSortLabel>
            </TableCell>
            <TableCell align="left" sortDirection={internalSortBy === 'full_name' ? internalSortDir : false}>
              <TableSortLabel
                active={internalSortBy === 'full_name'}
                direction={internalSortBy === 'full_name' ? internalSortDir : 'asc'}
                onClick={() => handleSortChange('full_name')}
              >
                Ime
              </TableSortLabel>
            </TableCell>
            <TableCell align="left" sortDirection={internalSortBy === 'email' ? internalSortDir : false}>
              <TableSortLabel
                active={internalSortBy === 'email'}
                direction={internalSortBy === 'email' ? internalSortDir : 'asc'}
                onClick={() => handleSortChange('email')}
              >
                Email
              </TableSortLabel>
            </TableCell>
            <TableCell align="left">Telefon</TableCell>
            <TableCell align="left" sortDirection={internalSortBy === 'city' ? internalSortDir : false}>
              <TableSortLabel
                active={internalSortBy === 'city'}
                direction={internalSortBy === 'city' ? internalSortDir : 'asc'}
                onClick={() => handleSortChange('city')}
              >
                Grad
              </TableSortLabel>
            </TableCell>
            <TableCell align="left" sortDirection={internalSortBy === 'order_status' ? internalSortDir : false}>
              <TableSortLabel
                active={internalSortBy === 'order_status'}
                direction={internalSortBy === 'order_status' ? internalSortDir : 'asc'}
                onClick={() => handleSortChange('order_status')}
              >
                Status
              </TableSortLabel>
            </TableCell>
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
            const totalAmount = formatCurrency(order.total, 'RSD');

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
                <TableCell align="left">{order.full_name || order.customer?.full_name || 'Neregistrovani korisnik'}</TableCell>
                <TableCell align="left">{order.email || order.customer?.email || '-'}</TableCell>
                <TableCell align="left">{order.phone_number || order.customer?.phone_number || '-'}</TableCell>
                <TableCell align="left">{order.city || order.customer?.city || '-'}</TableCell>
                <TableCell
                  align="left"
                  onClick={(e) => handleStatusClick(e, order.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <SeverityPill color={
                    getOrderStatus(order) == 'pending' ? 'warning' :
                      getOrderStatus(order) == 'shipped' ? 'info' :
                        getOrderStatus(order) == 'delivered' ? 'success' :
                          getOrderStatus(order) == 'cancelled' ? 'error' : 'warning'
                  }>{
                      getOrderStatus(order) == 'pending' ? 'Na čekanju' :
                        getOrderStatus(order) == 'shipped' ? 'Poslato' :
                          getOrderStatus(order) == 'delivered' ? 'Dostavljeno' :
                            getOrderStatus(order) == 'cancelled' ? 'Otkazano' : 'Na čekanju'
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
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuList dense>
          {statusOptions.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
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
