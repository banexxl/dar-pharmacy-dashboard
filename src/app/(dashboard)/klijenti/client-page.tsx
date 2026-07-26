'use client';

import {
     useCallback,
     useEffect,
     useMemo,
     useState,
} from 'react';
import {
     Box,
     Container,
     Stack,
     TablePagination,
     Typography,
} from '@mui/material';
import type { ChangeEvent } from 'react';

import { useSelection } from 'src/hooks/use-selection';
import { CustomersSearch } from 'src/sections/customer/customers-search';
import { CustomersTable } from '@/sections/customer/customers-table';
import { useMounted } from '@/hooks/use-mounted';
import { AuthProvider } from '@/context/auth-context';

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
};

type CustomersPageProps = {
     allClients: Customer[];
};

const useClientSearch = () => {
     const [state, setState] = useState({
          query: '',
          page: 0,
          rowsPerPage: 5,
          sortBy: 'full_name',
          sortDir: 'desc',
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
                    rowsPerPage: Number.parseInt(
                         event.target.value,
                         10
                    ),
               }));
          },
          []
     );

     const handleSortChange = useCallback(
          (sortDir: 'asc' | 'desc') => {
               setState((previousState) => ({
                    ...previousState,
                    page: 0,
                    sortDir,
               }));
          },
          []
     );

     return {
          handleQueryChange,
          handleSortChange,
          handlePageChange,
          handleRowsPerPageChange,
          state,
     };
};

const CustomersPage = ({
     allClients,
}: CustomersPageProps) => {
     const clientSearch = useClientSearch();
     const isMounted = useMounted();

     const [clientStore, setClientStore] = useState<{
          allClients: Customer[];
     }>({
          allClients: [],
     });

     useEffect(() => {
          if (isMounted()) {
               setClientStore({
                    allClients: allClients ?? [],
               });
          }
     }, [isMounted, allClients]);

     const filteredClients = useMemo(() => {
          const query = clientSearch.state.query
               .trim()
               .toLocaleLowerCase();

          if (!query) {
               return clientStore.allClients;
          }

          return clientStore.allClients.filter((customer) => {
               const searchableValues = [
                    customer.full_name,
                    customer.email,
                    customer.phone_number,
                    customer.street_address,
                    customer.city,
                    customer.province_state,
                    customer.country,
                    customer.zip_postal_code,
               ];

               return searchableValues.some((value) =>
                    String(value ?? '')
                         .toLocaleLowerCase()
                         .includes(query)
               );
          });
     }, [
          clientStore.allClients,
          clientSearch.state.query,
     ]);

     const customerIDs = useMemo(
          () => filteredClients.map((customer) => customer.id),
          [filteredClients]
     );

     const customersSelection = useSelection<string>(customerIDs);

     return (
          <AuthProvider>
               <Box
                    component="main"
                    sx={{
                         flexGrow: 1,
                         py: 8,
                    }}
               >
                    <Container maxWidth="xl">
                         <Stack spacing={3}>
                              <Stack
                                   direction="row"
                                   justifyContent="space-between"
                                   spacing={4}
                              >
                                   <Typography variant="h4">
                                        Klijenti
                                   </Typography>
                              </Stack>

                              <CustomersSearch
                                   query={clientSearch.state.query}
                                   onQueryChange={
                                        clientSearch.handleQueryChange
                                   }
                              />

                              <TablePagination
                                   component="div"
                                   count={filteredClients.length}
                                   page={clientSearch.state.page}
                                   rowsPerPage={
                                        clientSearch.state.rowsPerPage
                                   }
                                   onPageChange={
                                        clientSearch.handlePageChange
                                   }
                                   onRowsPerPageChange={
                                        clientSearch.handleRowsPerPageChange
                                   }
                                   rowsPerPageOptions={[
                                        5,
                                        10,
                                        25,
                                        50,
                                        100,
                                   ]}
                                   showFirstButton
                                   showLastButton
                                   labelRowsPerPage="Broj po stranici"
                              />

                              <CustomersTable
                                   count={filteredClients.length}
                                   items={filteredClients}
                                   page={clientSearch.state.page}
                                   rowsPerPage={
                                        clientSearch.state.rowsPerPage
                                   }
                                   selected={
                                        customersSelection.selected
                                   }
                              />

                              <TablePagination
                                   component="div"
                                   count={filteredClients.length}
                                   page={clientSearch.state.page}
                                   rowsPerPage={
                                        clientSearch.state.rowsPerPage
                                   }
                                   onPageChange={
                                        clientSearch.handlePageChange
                                   }
                                   onRowsPerPageChange={
                                        clientSearch.handleRowsPerPageChange
                                   }
                                   rowsPerPageOptions={[
                                        5,
                                        10,
                                        25,
                                        50,
                                        100,
                                   ]}
                                   showFirstButton
                                   showLastButton
                                   labelRowsPerPage="Broj po stranici"
                              />
                         </Stack>
                    </Container>
               </Box>
          </AuthProvider>
     );
};

export default CustomersPage;