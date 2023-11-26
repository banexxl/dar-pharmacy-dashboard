import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ProductsTable } from 'src/sections/products/products-table';
import { ProductsSearch } from 'src/sections/products/products-search';
import { applyPagination } from 'src/utils/apply-pagination';
import { productsServices } from '../utils/product-services'
import { AddProductForm } from '../sections/products/new-product-form'

const useProducts = (data, page, rowsPerPage) => {
          return useMemo(
                    () => {
                              return applyPagination(data, page, rowsPerPage);
                    },
                    [data, page, rowsPerPage]
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
          const [open, setOpen] = useState(false)
          const [openEdit, setOpenEdit] = useState(false)
          const [rowsPerPage, setRowsPerPage] = useState(5);
          const products = useProducts(props.products, page, rowsPerPage);
          const productsIds = useProductsIds(props.products);
          const productsSelection = useSelection(productsIds);

          // useEffect(() => {
          //           try {
          //                     fetch('/api/product-api', {
          //                               method: 'GET',
          //                               headers: {
          //                                         'Content-Type': 'application/json',
          //                                         'Access-Control-Allow-Origin': '*',
          //                                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
          //                               },
          //                     }).then((response) => {

          //                               if (response.ok) {


          //                               } else {
          //                                         const errorData = response.json(); // Parse the error response
          //                                         console.error(errorData);
          //                               }
          //                     })
          //           } catch (err) {
          //                     console.error(err);
          //           }
          // }, [])


          const handleSubmitSuccess = () => {
                    setOpen(false); // Close the dialog
          };

          const handleSubmitFail = () => {
                    setOpen(false)
          }

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
                    <Box>
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
                                                                                          Proizvodi
                                                                                </Typography>
                                                                      </Stack>
                                                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', height: '40px', width: '320px' }}>
                                                                                <Button
                                                                                          startIcon={(
                                                                                                    <SvgIcon fontSize="small">
                                                                                                              <PlusIcon />
                                                                                                    </SvgIcon>
                                                                                          )}
                                                                                          variant="contained"
                                                                                          onClick={() => {
                                                                                                    setOpen(true)
                                                                                          }}
                                                                                >
                                                                                          Dodaj proizvod
                                                                                </Button>
                                                                      </Box>
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
                              <Dialog open={open}
                                        PaperProps={{
                                                  sx: {
                                                            width: '600px'
                                                  }
                                        }}
                              >
                                        <DialogTitle>Dodaj proizvod</DialogTitle>
                                        <DialogContent dividers >
                                                  <AddProductForm
                                                            onSubmitSuccess={handleSubmitSuccess}
                                                            onSubmitFail={handleSubmitFail} />
                                        </DialogContent>
                              </Dialog>
                    </Box >
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
