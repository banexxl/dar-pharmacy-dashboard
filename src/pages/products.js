import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ProductsTable } from 'src/sections/products/products-table';
import { ProductsSearch } from 'src/sections/products/products-search';
import { applyPagination } from 'src/utils/apply-pagination';
import { productsServices } from '../utils/product-services'

const useProducts = (data, page, rowsPerPage) => {
          return useMemo(
                    () => {
                              return applyPagination(data, page, rowsPerPage);
                    },
                    [page, rowsPerPage]
          );
};

const useProductsIds = (products) => {
          return useMemo(
                    () => {
                              return products.map((product) => product._id);
                    },
                    [products]
          );
};

const Page = (props) => {
          const [page, setPage] = useState(0);
          const [rowsPerPage, setRowsPerPage] = useState(5);
          const products = useProducts(props.products, page, rowsPerPage);
          const productsIds = useProductsIds(props.products);
          const productsSelection = useSelection(productsIds);

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
                                                  Products
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
                                                                                          Products
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
                                                            <ProductsSearch />
                                                            <ProductsTable
                                                                      count={props.products.length}
                                                                      items={props.products}
                                                                      onDeselectAll={productsSelection.handleDeselectAll}
                                                                      onDeselectOne={productsSelection.handleDeselectOne}
                                                                      onPageChange={handlePageChange}
                                                                      onRowsPerPageChange={handleRowsPerPageChange}
                                                                      onSelectAll={productsSelection.handleSelectAll}
                                                                      onSelectOne={productsSelection.handleSelectOne}
                                                                      page={page}
                                                                      rowsPerPage={rowsPerPage}
                                                                      selected={productsSelection.selected}
                                                            />
                                                  </Stack>
                                        </Container>
                              </Box>
                    </>
          );
};


export async function getServerSideProps() {

          const allProducts = await productsServices().getAllProducts()

          const finalList = [
                    ...allProducts
          ]

          redirect: {
                    destination: "/404"
          }

          return {
                    props: {
                              products: JSON.parse(JSON.stringify(finalList)),
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
