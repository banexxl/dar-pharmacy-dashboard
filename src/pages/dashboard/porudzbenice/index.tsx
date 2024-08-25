import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
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
    setState((prevState) => ({
      ...prevState,
      page,
    }));
  }, []);

  const handleRowsPerPageChange = useCallback((event: any) => {
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
  console.log('props', props);

  const rootRef = useRef(null);
  const ordersSearch = useOrdersSearch();
  const dialog = useDialog();

  const [ordersStore, setOrderStore] = useState({
    orders: [],
    ordersCount: 0,
  });

  const currentOrder = useCurrentOrder(ordersStore.orders, dialog.data);
  console.log('currentOrder', currentOrder);

  const isMounted = useMounted();

  useEffect(() => {
    if (isMounted()) {
      setOrderStore({
        orders: props.allOrders,
        ordersCount: props.allOrders.length,
      });
    }
  }, [isMounted, props.allOrders]);

  const handleOrderOpen = useCallback(
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
            <OrderListTable
              count={ordersStore.ordersCount}
              items={ordersStore.orders}
              onPageChange={ordersSearch.handlePageChange}
              onRowsPerPageChange={ordersSearch.handleRowsPerPageChange}
              onSelect={handleOrderOpen}
              page={ordersSearch.state.page}
              rowsPerPage={ordersSearch.state.rowsPerPage}
            />
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
    const page = context.query.page || 1;
    const limit = context.query.limit || 5;

    const allOrders = await ordersServices().getAllOrders();

    return {
      props: {
        allOrders: JSON.parse(JSON.stringify(allOrders)),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      props: {
        allOrders: [],
        page: 1,
        limit: 5,
      },
    };
  }
}

Page.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
