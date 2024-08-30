import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import { format } from 'date-fns';
import Typography from '@mui/material/Typography';
import { ordersServices } from '@/services/order-services';
import { OrderDrawer } from '@/sections/order/order-drawer';
import { OrderListContainer } from '@/sections/order/order-list-container';
import { OrderListTable } from '@/sections/order/order-list-table';
import { OrderListSearch } from '@/sections/order/order-list-search';
import { Order } from '@/schemas/order';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useDialog } from '@/hooks/use-dialog';
import { useMounted } from '@/hooks/use-mounted';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@mui/material';
import { SeverityPill } from '@/components/severity-pill';
import numeral from 'numeral';

const useOrdersSearch = () => {
  const [state, setState] = useState({
    filters: {
      query: undefined,
      status: undefined,
    },
    page: 0,
    rowsPerPage: 5,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const handleFiltersChange = useCallback((filters: any) => {
    setState((prevState) => ({
      ...prevState,
      filters,
    }));
  }, []);

  const handleSortChange = useCallback((sortDir: any) => {
    setState((prevState) => ({
      ...prevState,
      sortDir,
    }));
  }, []);

  const handlePageChange = useCallback((event: any, page: any) => {
    console.log('page', page);

    setState((prevState) => ({
      ...prevState,
      page,
    }));
  }, []);

  const handleRowsPerPageChange = useCallback((event: any) => {
    console.log('event', event);
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  }, []);

  return {
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

const useCurrentOrder = (orders: Order[], orderId: string | undefined) => {
  return useMemo(() => {
    if (!orderId) {
      return undefined;
    }

    return orders.find((order) => order._id === orderId);
  }, [orders, orderId]);
};

const Page = (props: any) => {

  const rootRef = useRef(null);
  const ordersSearch = useOrdersSearch();
  const dialog = useDialog();

  const [ordersStore, setOrderStore] = useState({
    orders: [],
    ordersCount: 0,
  });

  const currentOrder = useCurrentOrder(ordersStore.orders, dialog.data);

  const isMounted = useMounted();

  useEffect(() => {
    if (isMounted()) {
      setOrderStore({
        orders: props.allOrders,
        ordersCount: props.allOrders.length,
      });
    }
  }, [isMounted, props.allOrders]);

  const onSelect = useCallback(
    (orderId: string) => {
      // Close drawer if is the same order
      if (dialog.open && dialog.data === orderId) {
        dialog.handleClose();
        return;
      }

      dialog.handleOpen(orderId);
    },
    [dialog]
  );

  return (
    <>
      <Divider />
      <Box
        component="main"
        ref={rootRef}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          ref={rootRef}
          sx={{
            bottom: 0,
            display: 'flex',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        >
          <OrderListContainer open={dialog.open}>
            <Box sx={{ p: 3 }}>
              <Stack
                alignItems="flex-start"
                direction="row"
                justifyContent="space-between"
                spacing={4}
              >
                <div>
                  <Typography variant="h4">Porudžbenice</Typography>
                </div>
                <div>
                  <Button
                    startIcon={
                      <SvgIcon>
                        <PlusIcon />
                      </SvgIcon>
                    }
                    variant="contained"
                  >
                    Dodaj
                  </Button>
                </div>
              </Stack>
            </Box>
            <Divider />
            <OrderListSearch
              onFiltersChange={ordersSearch.handleFiltersChange}
              onSortChange={ordersSearch.handleSortChange}
              sortBy={ordersSearch.state.sortBy}
              sortDir={ordersSearch.state.sortDir}
            />
            <Divider />
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
                  {ordersStore.orders.map((order: Order) => {

                    const createdAtDate = new Date(order.createdAt);

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
                        key={order._id}
                        onClick={() => onSelect?.(order._id)}
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
                          <Typography variant="subtitle2">{order.orderNumber}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary" variant="body2">
                            RSD {totalAmount}
                          </Typography>
                        </TableCell>
                        <TableCell align="left">
                          {
                            order.paymentMethod == 'cash-on-delivery' ? 'Pouzećem'
                              : order.paymentMethod == 'cash' ? 'Gotovinom'
                                : order.paymentMethod == 'check' ? 'Čekom'
                                  : order.paymentMethod == 'credit card' ? 'Kreditnom karticom'
                                    : order.paymentMethod == 'paypal' ? 'PayPal' : 'Nepoznato'
                          }
                        </TableCell>
                        <TableCell align="left">{order.customer.name}</TableCell>
                        <TableCell align="left">{order.customer.email}</TableCell>
                        <TableCell align="left">
                          <SeverityPill color={
                            order.status == 'pending' ? 'warning' :
                              order.status == 'shipped' ? 'info' :
                                order.status == 'delivered' ? 'success' :
                                  order.status == 'cancelled' ? 'error' : 'warning'
                          }>{order.status}</SeverityPill>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={ordersStore.ordersCount}
                onPageChange={ordersSearch.handlePageChange}
                onRowsPerPageChange={ordersSearch.handleRowsPerPageChange}
                page={ordersSearch.state.page}
                rowsPerPage={ordersSearch.state.rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </div >
            {/* <OrderListTable
              count={ordersStore.ordersCount}
              items={ordersStore.orders}
              onPageChange={ordersSearch.handlePageChange}
              onRowsPerPageChange={ordersSearch.handleRowsPerPageChange}
              onSelect={handleOrderOpen}
              page={ordersSearch.state.page}
              rowsPerPage={ordersSearch.state.rowsPerPage}
            /> */}
          </OrderListContainer>
          <OrderDrawer
            container={rootRef.current}
            onClose={dialog.handleClose}
            open={dialog.open}
            order={currentOrder}
          />
        </Box>
      </Box>
    </>
  );
};

export async function getServerSideProps(context: any) {
  try {

    const allOrders = await ordersServices().getAllOrders();

    return {
      props: {
        allOrders: JSON.parse(JSON.stringify(allOrders)),
      },
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      props: {
        allOrders: [],
      },
    };
  }
}

Page.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
