'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, TablePagination, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { CustomersSearch } from 'src/sections/customer/customers-search';
import { SessionProvider } from 'next-auth/react';
import { CustomersTable } from '@/sections/customer/customers-table';
import { useMounted } from '@/hooks/use-mounted';

const useClientSearch = () => {

     const [state, setState] = useState({
          query: '',
          page: 0,
          rowsPerPage: 5,
          sortBy: 'name',
          sortDir: 'desc',
     })

     const handleQueryChange = useCallback((filters: any) => {
          setState((prevState) => ({
               ...prevState,
               filters,
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

     return {
          handleQueryChange,
          handleSortChange,
          handlePageChange,
          handleRowsPerPageChange,
          state,
     };
};
const CustomersPage = (props: any) => {

     const customerIDs = useMemo(() => {
          if (!Array.isArray(props.customers)) {
               return [];
          }
          return props.customers.map((customer: any) => customer.id);
     }, [props.customers]);

     const clientSearch = useClientSearch();

     const customersSelection = useSelection(customerIDs);

     const [clientStore, setClientStore] = useState({
          allClients: [],
     });

     const isMounted = useMounted();

     useEffect(() => {
          if (isMounted()) {
               setClientStore({
                    allClients: props.allClients,
               });
          }
     }, [isMounted, props.allProducts]);



     return (
          <SessionProvider>
               <Box
                    component="main"
                    sx={{
                         flexGrow: 1,
                         py: 8
                    }}
               >
                    <Container maxWidth="xl">
                         <Stack spacing={3}>
                              <Stack
                                   direction="row"
                                   justifyContent="space-between"
                                   spacing={4}
                              >
                                   <Stack spacing={1}>
                                        <Typography variant="h4">
                                             Customers
                                        </Typography>
                                        <Stack
                                             alignItems="center"
                                             direction="row"
                                             spacing={1}
                                        >
                                             <Button
                                                  color="inherit"
                                                  startIcon={(
                                                       <SvgIcon fontSize="small">
                                                            <ArrowUpOnSquareIcon />
                                                       </SvgIcon>
                                                  )}
                                             >
                                                  Import
                                             </Button>
                                             <Button
                                                  color="inherit"
                                                  startIcon={(
                                                       <SvgIcon fontSize="small">
                                                            <ArrowDownOnSquareIcon />
                                                       </SvgIcon>
                                                  )}
                                             >
                                                  Export
                                             </Button>
                                        </Stack>
                                   </Stack>
                                   <div>
                                        <Button
                                             startIcon={(
                                                  <SvgIcon fontSize="small">
                                                       <PlusIcon />
                                                  </SvgIcon>
                                             )}
                                             variant="contained"
                                        >
                                             Add
                                        </Button>
                                   </div>
                              </Stack>
                              <CustomersSearch />
                              < TablePagination
                                   component="div"
                                   count={clientStore.allClients.length || 0}
                                   onPageChange={clientSearch.handlePageChange}
                                   onRowsPerPageChange={clientSearch.handleRowsPerPageChange}
                                   page={clientSearch.state.page}
                                   rowsPerPage={clientSearch.state.rowsPerPage}
                                   rowsPerPageOptions={[5, 10, 25, 50, 100]}
                                   showFirstButton
                                   showLastButton
                                   labelRowsPerPage={'Broj po stranici'}
                              />
                              <CustomersTable
                                   count={clientStore.allClients.length}
                                   items={clientStore.allClients}
                                   page={clientSearch.state.page}
                                   rowsPerPage={clientSearch.state.rowsPerPage}
                                   selected={customersSelection.selected}
                              />
                              < TablePagination
                                   component="div"
                                   count={clientStore.allClients.length || 0}
                                   onPageChange={clientSearch.handlePageChange}
                                   onRowsPerPageChange={clientSearch.handleRowsPerPageChange}
                                   page={clientSearch.state.page}
                                   rowsPerPage={clientSearch.state.rowsPerPage}
                                   rowsPerPageOptions={[5, 10, 25, 50, 100]}
                                   showFirstButton
                                   showLastButton
                                   labelRowsPerPage={'Broj po stranici'}
                              />
                         </Stack>
                    </Container>
               </Box>
          </SessionProvider>
     );
};

export default CustomersPage;
