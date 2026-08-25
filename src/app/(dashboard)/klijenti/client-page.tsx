'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';

import { AuthProvider } from '@/context/auth-context';
import { useMounted } from '@/hooks/use-mounted';
import { CustomersSearch } from '@/sections/customer/customers-search';
import { CustomersTable } from '@/sections/customer/customers-table';
import { useSelection } from 'src/hooks/use-selection';

type Customer = {
     id: string;
     full_name: string;
     email: string;
     phone_number?: string | null;
     street_address?: string | null;
     city?: string | null;
     province_state?: string | null;
     country?: string | null;
     zip_postal_code?: string | null;
     created_at?: string | null;
};

type CustomersPageProps = {
     allClients: Customer[];
};

const useClientSearch = () => {
     const [state, setState] = useState({
          query: '',
          page: 0,
          rowsPerPage: 5,
     });

     const handleQueryChange = useCallback(
          (event: ChangeEvent<HTMLInputElement>) => {
               setState((previousState) => ({
                    ...previousState,
                    query: event.target.value,
                    page: 0,
               }));
          },
          []
     );

     const handleClearSearch = useCallback(() => {
          setState((previousState) => ({
               ...previousState,
               query: '',
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

     return {
          handleQueryChange,
          handleClearSearch,
          handlePageChange,
          handleRowsPerPageChange,
          state,
     };
};

const CustomersPage = ({ allClients }: CustomersPageProps) => {
     const clientSearch = useClientSearch();
     const isMounted = useMounted();
     const [clients, setClients] = useState<Customer[]>([]);

     useEffect(() => {
          if (isMounted()) {
               setClients(allClients ?? []);
          }
     }, [isMounted, allClients]);

     const filteredClients = useMemo(() => {
          const query = clientSearch.state.query.trim().toLocaleLowerCase();

          if (!query) {
               return clients;
          }

          return clients.filter((customer) => {
               const createdDate = customer.created_at
                    ? new Date(customer.created_at)
                    : null;
               const formattedDate = createdDate && !isNaN(createdDate.getTime())
                    ? `${createdDate.getDate().toString().padStart(2, '0')}.${(createdDate.getMonth() + 1).toString().padStart(2, '0')}.${createdDate.getFullYear()}.`
                    : '';

               return [
                    customer.full_name,
                    customer.email,
                    customer.phone_number,
                    customer.street_address,
                    customer.city,
                    customer.province_state,
                    customer.country,
                    customer.zip_postal_code,
                    formattedDate,
               ].some((value) =>
                    String(value ?? '').toLocaleLowerCase().includes(query)
               );
          });
     }, [clients, clientSearch.state.query]);

     const customerIDs = useMemo(
          () => filteredClients.map((customer) => customer.id),
          [filteredClients]
     );

     const customersSelection = useSelection<string>(customerIDs);

     return (
          <AuthProvider>
               <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
                    <Container maxWidth="xl">
                         <Stack spacing={3}>
                              <Typography variant="h4">Klijenti</Typography>

                              <CustomersSearch
                                   query={clientSearch.state.query}
                                   onQueryChange={clientSearch.handleQueryChange}
                                   onClear={clientSearch.handleClearSearch}
                              />

                              <CustomersTable
                                   count={filteredClients.length}
                                   items={filteredClients}
                                   page={clientSearch.state.page}
                                   rowsPerPage={clientSearch.state.rowsPerPage}
                                   selected={customersSelection.selected}
                                   onSelectAll={customersSelection.selectAll}
                                   onDeselectAll={customersSelection.deselectAll}
                                   onSelectOne={customersSelection.selectOne}
                                   onDeselectOne={customersSelection.deselectOne}
                                   onPageChange={clientSearch.handlePageChange}
                                   onRowsPerPageChange={
                                        clientSearch.handleRowsPerPageChange
                                   }
                                   sortBy={clientSearch.state.sortBy}
                                   sortDir={clientSearch.state.sortDir}
                              />
                         </Stack>
                    </Container>
               </Box>
          </AuthProvider>
     );
};

export default CustomersPage;