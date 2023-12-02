import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { CustomersTable } from 'src/sections/customer/customers-table';
import { CustomersSearch } from 'src/sections/customer/customers-search';
import { applyPagination } from 'src/utils/apply-pagination';
import { userServices } from '../utils/user-services'

const useCustomers = (data, page, rowsPerPage) => {
     return useMemo(
          () => {
               return applyPagination(data, page, rowsPerPage);
          },
          [page, rowsPerPage]
     );
};

const useCustomerIds = (customers) => {
     return useMemo(
          () => {
               return customers.map((customer) => customer.id);
          },
          [customers]
     );
};

const Page = (props) => {

     const [page, setPage] = useState(0);
     const [rowsPerPage, setRowsPerPage] = useState(5);
     const customers = useCustomers(props.users, page, rowsPerPage);
     const customersIds = useCustomerIds(customers);
     const customersSelection = useSelection(customersIds);

     const handlePageChange = useCallback(
          (event, value) => {
               setPage(value);
          },
          []
     );

     const handleRowsPerPageChange = useCallback(
          (event) => {
               setRowsPerPage(event.target.value);
          },
          []
     );

     return (
          <>
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
                              <CustomersTable
                                   count={props.users.length}
                                   items={customers}
                                   onDeselectAll={customersSelection.handleDeselectAll}
                                   onDeselectOne={customersSelection.handleDeselectOne}
                                   onPageChange={handlePageChange}
                                   onRowsPerPageChange={handleRowsPerPageChange}
                                   onSelectAll={customersSelection.handleSelectAll}
                                   onSelectOne={customersSelection.handleSelectOne}
                                   page={page}
                                   rowsPerPage={rowsPerPage}
                                   selected={customersSelection.selected}
                              />
                         </Stack>
                    </Container>
               </Box>
          </>
     );
};


export async function getServerSideProps() {

     const allUsers = await userServices().getAllUsers()

     redirect: {
          destination: "/404"
     }

     return {
          props: {
               users: JSON.parse(JSON.stringify(allUsers)),
               // ...(await serverSideTranslations('sr-RS'))
               // ...(await serverSideTranslations('sr-RS' ?? context.locale, ['common'], null, ['en-US', 'sr-RS'])),
          },
     }
}


// export const getStaticPaths = async (context) => {

//           const allProducts = await productsServices().getAllProducts()

//           const finalList = [
//                     ...allProducts
//           ]

//           const paths = finalList.flatMap((product) =>
//                     context.locales.map((locale) => ({
//                               params: {
//                                         proizvodjac: product.manufacturer.toString()
//                               },
//                               locale,
//                     }))
//           );

//           return {
//                     paths,
//                     fallback: false, // false or "blocking"
//           };
// }

Page.getLayout = (page) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;
