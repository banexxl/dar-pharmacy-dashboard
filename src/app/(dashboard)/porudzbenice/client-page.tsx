'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ChangeEvent } from 'react';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { useMounted } from '@/hooks/use-mounted';
import type { Order } from '@/schemas/order';
import { OrderListContainer } from '@/sections/order/order-list-container';
import { OrderListSearch } from '@/sections/order/order-list-search';
import { OrderListTable } from '@/sections/order/order-list-table';
import type {
  SortBy,
  SortDir,
} from '@/sections/order/order-list-table';
import { useRouter } from 'next/navigation';

type OrdersPageProps = {
  allOrders: Order[];
};

const useOrdersSearch = () => {
  const [state, setState] = useState({
    query: '',
    page: 0,
    rowsPerPage: 5,
    sortBy: 'createdAt',
    sortDir: 'desc' as SortDir,
    tab: 'all',
  });

  const handleQueryChange = useCallback((query: string) => {
    setState((previousState) => ({
      ...previousState,
      query,
      page: 0,
    }));
  }, []);

  const handlePageChange = useCallback(
    (_event: unknown, page: number) => {
      setState((previousState) => ({
        ...previousState,
        page,
      }));
    },
    []
  );

  const handleRowsPerPageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setState((previousState) => ({
        ...previousState,
        page: 0,
        rowsPerPage: Number.parseInt(event.target.value, 10),
      }));
    },
    []
  );

  const handleSortChange = useCallback((sortDir: SortDir) => {
    setState((previousState) => ({
      ...previousState,
      page: 0,
      sortDir,
    }));
  }, []);

  const handleTabsChange = useCallback((tab: string) => {
    setState((previousState) => ({
      ...previousState,
      page: 0,
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

const Page = ({ allOrders }: OrdersPageProps) => {
  const ordersSearch = useOrdersSearch();
  const isMounted = useMounted();

  const [ordersStore, setOrderStore] = useState<{
    orders: Order[];
    ordersCount: number;
  }>({
    orders: [],
    ordersCount: 0,
  });

  const router = useRouter();

  useEffect(() => {
    if (isMounted()) {
      setOrderStore({
        orders: allOrders ?? [],
        ordersCount: allOrders?.length ?? 0,
      });
    }
  }, [isMounted, allOrders]);

  const filteredOrders = useMemo(() => {
    const query = ordersSearch.state.query
      .trim()
      .toLocaleLowerCase();

    const filtered = ordersStore.orders.filter((order: any) => {
      const status =
        order.order_status ??
        order.orderStatus ??
        order.status ??
        'pending';

      const matchesTab =
        ordersSearch.state.tab === 'all' ||
        status === ordersSearch.state.tab;

      if (!matchesTab) {
        return false;
      }

      if (!query) {
        return true;
      }

      const customer =
        order.customer ??
        order.customers ??
        order.client ??
        {};

      const orderItems =
        order.order_items ?? [];

      const searchableValues = [
        order.order_number,
        order.orderNumber,
        order.transaction_number,
        order.transactionNumber,
        order.payment_method,
        order.paymentMethod,
        order.payment_status,
        order.paymentStatus,
        order.order_status,
        order.orderStatus,
        order.status,
        order.total,
        order.created_at,
        order.createdAt,
        customer.full_name,
        customer.name,
        customer.email,
        customer.phone_number,
        customer.phoneNumber,
        customer.street_address,
        customer.streetAddress,
        customer.city,
        customer.province_state,
        customer.provinceState,
        customer.country,
        customer.zip_postal_code,
        customer.zipPostalCode,
        ...orderItems.flatMap((item: any) => [
          item.name,
          item.manufacturer,
          item.main_category,
          item.mainCategory,
          item.mid_category,
          item.midCategory,
          item.sub_category,
          item.subCategory,
        ]),
      ];

      return searchableValues.some((value) =>
        String(value ?? '')
          .toLocaleLowerCase()
          .includes(query)
      );
    });

    return [...filtered].sort((first: any, second: any) => {
      const firstDate = new Date(
        first.created_at ?? first.createdAt ?? 0
      ).getTime();

      const secondDate = new Date(
        second.created_at ?? second.createdAt ?? 0
      ).getTime();

      return ordersSearch.state.sortDir === 'asc'
        ? firstDate - secondDate
        : secondDate - firstDate;
    });
  }, [
    ordersStore.orders,
    ordersSearch.state.query,
    ordersSearch.state.sortDir,
    ordersSearch.state.tab,
  ]);

  return (
    <>
      <Divider />

      <Box>
        <OrderListContainer>
          <Box sx={{ p: 3 }}>
            <Stack
              alignItems="flex-start"
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Typography variant="h4">
                Porudžbenice
              </Typography>
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

          <OrderListTable
            count={filteredOrders.length}
            items={filteredOrders}
            onPageChange={ordersSearch.handlePageChange}
            onRowsPerPageChange={
              ordersSearch.handleRowsPerPageChange
            }
            onSelect={(orderId) => { router.push(`/porudzbenice/${orderId}`) }}
            page={ordersSearch.state.page}
            rowsPerPage={ordersSearch.state.rowsPerPage}
            sortDir={ordersSearch.state.sortDir as SortDir}
            sortBy={ordersSearch.state.sortBy as SortBy}
            onTabChange={ordersSearch.handleTabsChange}
            tab={ordersSearch.state.tab}
          />
        </OrderListContainer>
      </Box>
    </>
  );
};

export default Page;