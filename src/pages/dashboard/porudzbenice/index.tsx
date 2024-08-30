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
import { OrderListTable, SortBy, SortDir } from '@/sections/order/order-list-table';
import { OrderListSearch } from '@/sections/order/order-list-search';
import { Order } from '@/schemas/order';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useDialog } from '@/hooks/use-dialog';
import { useMounted } from '@/hooks/use-mounted';
import { TablePagination } from '@mui/material'

const useOrdersSearch = () => {

  const [state, setState] = useState({
    query: undefined,
    page: 0,
    rowsPerPage: 5,
    sortBy: 'createdAt',
    sortDir: 'desc',
    tab: 'all'
  });

  const handleQueryChange = useCallback((filters: any) => {
    setState((prevState) => ({
      ...prevState,
      filters,
    }));
  }, []);

  const handlePageChange = useCallback((event: any, page: any) => {
    console.log('usao u handlePageChange');

    setState((prevState) => ({
      ...prevState,
      page,
    }));
  }, []);

  const handleRowsPerPageChange = useCallback((event: any) => {
    console.log('usao u handleRowsPerPageChange');

    setState((prevState) => ({
      ...prevState,
      page: 0,
      rowsPerPage: parseInt(event.target.value, 10),
    }));

  }, []);

  const handleSortChange = useCallback((sortDir: any) => {
    setState((prevState) => ({
      ...prevState,
      sortDir,
    }));
  }, []);

  const handleTabsChange = useCallback((event: any, tab: any) => {
    console.log('usao u handleTabsChange  ', tab);

    setState((prevState) => ({
      ...prevState,
      tab,
    }));
  }, []);

  return {
    handleQueryChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleTabsChange,
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
              onQueryChange={ordersSearch.handleQueryChange}
              onTabChange={ordersSearch.handleTabsChange}
              onSortChange={ordersSearch.handleSortChange}
              sortBy={ordersSearch.state.sortBy}
              sortDir={ordersSearch.state.sortDir}
              query={ordersSearch.state.query}
              tab={ordersSearch.state.tab}
            />
            <Divider />
            <TablePagination
              component="div"
              count={ordersStore.ordersCount}
              onPageChange={ordersSearch.handlePageChange}
              onRowsPerPageChange={ordersSearch.handleRowsPerPageChange}
              page={ordersSearch.state.page}
              rowsPerPage={ordersSearch.state.rowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
            <OrderListTable
              count={ordersStore.ordersCount}
              items={ordersStore.orders}
              onPageChange={ordersSearch.handlePageChange}
              onRowsPerPageChange={ordersSearch.handleRowsPerPageChange}
              onSelect={onSelect}
              page={ordersSearch.state.page}
              rowsPerPage={ordersSearch.state.rowsPerPage}
              sortDir={ordersSearch.state.sortDir as SortDir}
              sortBy={ordersSearch.state.sortBy as SortBy}
              tab={ordersSearch.state.tab}
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

    const allOrders = await ordersServices().getAllOrders();

    return {
      props: {
        allOrders: JSON.parse(JSON.stringify(allOrders)),
      },
    };
  } catch (error) {
    return {
      props: {
        allOrders: [],
      },
    };
  }
}

Page.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
