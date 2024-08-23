import { useMemo, useState } from 'react';
import Head from 'next/head';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, TablePagination, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { CustomersSearch } from 'src/sections/customer/customers-search';
import { userServices } from '../utils/user-services'
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import { CustomersTable } from '@/sections/customer/customers-table';


const CustomersPage = (props: any) => {
     console.log('pageprops', props);

     const customerIDs = useMemo(() => {
          if (!Array.isArray(props.customers)) {
               return [];
          }
          return props.customers.map((customer: any) => customer._id);
     }, [props.customers]);

     const customersSelection = useSelection(customerIDs);
     const router = useRouter();

     const handleRowsPerPageChange = (event: any) => {
          router.push(`customers/?page=0&limit=${event.target.value}`);
          return (event.target.value)
     }

     const handlePageChange = (event: any, newPage: any) => {
          router.push(`/customers?page=${newPage}&limit=${props.limit}`);
     }

     return (
          <SessionProvider>
               <Head>
                    <title>
                         Customers
                    </title>
               </Head>
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
                                   count={props.customersCount}
                                   onPageChange={handlePageChange}
                                   onRowsPerPageChange={handleRowsPerPageChange}
                                   page={props.page}
                                   rowsPerPage={props.limit}
                                   rowsPerPageOptions={[5, 10, 25, 50, 100, 200]}
                                   showFirstButton
                                   showLastButton
                                   labelRowsPerPage={'Broj po stranici'}
                              //labelDisplayedRows={({ from, to, count }) => { return `${ from }–${ to } od ${ count !== -1 ? count : `više od ${ to }` }`; }}
                              />
                              <CustomersTable
                                   count={props.customers.length || 0}
                                   items={props.customers}
                                   page={props.page}
                                   rowsPerPage={props.limit}
                                   selected={customersSelection.selected}
                              />
                              < TablePagination
                                   count={props.customersCount}
                                   onPageChange={handlePageChange}
                                   onRowsPerPageChange={handleRowsPerPageChange}
                                   page={props.page}
                                   rowsPerPage={props.limit}
                                   rowsPerPageOptions={[5, 10, 25, 50, 100, 200]}
                                   showFirstButton
                                   showLastButton
                                   labelRowsPerPage={'Broj po stranici'}
                              //labelDisplayedRows={({ from, to, count }) => { return `${ from }–${ to } od ${ count !== -1 ? count : `više od ${ to }` }`; }}
                              />
                         </Stack>
                    </Container>
               </Box>
          </SessionProvider>
     );
};

export async function getServerSideProps(context: any) {
     try {
          const page = context.query.page || 1
          const limit = context.query.limit || 5

          const customers = await userServices().getUsersByPage(page, limit);
          const customersCount = await userServices().getUsersCount();

          return {
               props: {
                    customers: JSON.parse(JSON.stringify(customers)),
                    customersCount: JSON.parse(JSON.stringify(customersCount)),
                    page: parseInt(context.query.page),
                    limit: parseInt(context.query.limit)
               },
          };
     } catch (error) {
          console.error("Error fetching customers:", error);
          return {
               props: {
                    customers: [],
                    customersCount: 0,
                    page: 1,
                    limit: 5,
                    error: "Failed to fetch customers. Please try again later.",
               },
          };
     }
}

CustomersPage.getLayout = (page: any) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default CustomersPage;
