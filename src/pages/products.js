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
import { useRouter } from 'next/navigation';
import { TablePagination } from '@mui/material'


const Page = (props) => {
     // const products = useMemo(() => {
     //      return applyPagination(props.products, props.page, props.limit);
     // }, [props.products, props.page, props.limit]);


     const productsIds = useMemo(() => {
          if (!Array.isArray(props.products)) {
               return [];
          }
          return props.products.map((product) => product._id);
     }, [props.products]);

     const [open, setOpen] = useState(false)
     const productsSelection = useSelection(productsIds);
     const router = useRouter();
     const [loading, setLoading] = useState(false)

     const handleSubmitSuccess = () => {
          setOpen(false); // Close the dialog
     };

     const handleSubmitFail = () => {
          setOpen(false)
     }

     const handleRowsPerPageChange = (event) => {
          router.push(`products/?page=${ props.page }&limit=${ event.target.value }`);
          return (event.target.value)
     }

     const handlePageChange = (event, newPage) => {
          router.push(`/products?page=${ newPage }&limit=${ props.limit }`);
     }

     const createDummyCommit = async () => {
          if (loading) {
               return;
          }

          setLoading(true);

          try {
               const response = await fetch('/api/create-commit', {
                    method: 'POST',
               });

               if (response.ok) {
                    console.log('Dummy commit triggered successfully');
               } else {
                    console.error('Failed to trigger dummy commit');
               }
          } catch (error) {
               console.error('Error triggering dummy commit:', error);
          } finally {
               setLoading(false);
          }
     };

     return (
          <Box>
               <Head>
                    <title>
                         Proizvodi
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

                                   <Box sx={{ display: 'flex', justifyContent: 'space-between', height: '40px', width: '40%' }}>
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
                                        <Button
                                             startIcon={(
                                                  <SvgIcon fontSize="small">
                                                       <PlusIcon />
                                                  </SvgIcon>
                                             )}
                                             variant="contained"
                                             onClick={createDummyCommit}
                                             disabled={loading}
                                        >
                                             {loading ? 'Šaljem' : 'Pošalji proizvode na sajt'}
                                        </Button>
                                   </Box>
                              </Stack>
                              <ProductsSearch />
                              <ProductsTable
                                   count={props.products.length || 0}
                                   items={props.products}
                                   page={props.page}
                                   rowsPerPage={props.limit}
                                   selected={productsSelection.selected}
                                   productsCount={props.productsCount}
                              />
                              <TablePagination
                                   component="div"
                                   count={props.productsCount}
                                   onPageChange={handlePageChange}
                                   onRowsPerPageChange={handleRowsPerPageChange}
                                   page={props.page}
                                   rowsPerPage={props.limit}
                                   rowsPerPageOptions={[5, 10, 25]}
                                   showFirstButton
                                   showLastButton
                                   labelRowsPerPage={'Broj po stranici'}
                              //labelDisplayedRows={({ from, to, count }) => { return `${ from }–${ to } od ${ count !== -1 ? count : `više od ${ to }` }`; }}
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


export async function getServerSideProps(context) {
     try {
          const page = context.query.page || 1
          const limit = context.query.limit || 5

          const products = await productsServices().getProductsByPage(page, limit);
          const productsCount = await productsServices().getProductsCount();

          return {
               props: {
                    products: JSON.parse(JSON.stringify(products)),
                    productsCount: JSON.parse(JSON.stringify(productsCount)),
                    page: parseInt(context.query.page),
                    limit: parseInt(context.query.limit)
               },
          };
     } catch (error) {
          console.error("Error fetching products:", error);
          return {
               props: {
                    products: [],
                    productsCount: 0,
                    page: 1,
                    limit: 5,
                    error: "Failed to fetch products. Please try again later.",
               },
          };
     }
}

Page.getLayout = (page) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;
