import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Swal from 'sweetalert2'
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

     const handleRebuild = async () => {

          try {
               const response = await fetch('https://api.vercel.com/v1/integrations/deploy/prj_8oTQMbXR6nd6jPsw1OWW2Ku6vXIi/bag2X5T5DK', {
                    method: 'POST'
               })

               if (response.ok) {

                    Swal.fire({
                         icon: 'success',
                         title: 'Success',
                         text: 'Proizvodi uspešno poslati! Sačekajte par minuta i osvežite stranicu!',
                    })
                    router.push('/products/?page=0&limit=10')
               } else {
                    const errorData = await response.json(); // Parse the error response

                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Something went wrong! Error: ' + errorData,
                    })
               }
          } catch (error) {
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! Error: ' + error,
               })
          }
     }

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
                                             onClick={handleRebuild}
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


export async function getStaticProps(context) {
     try {
          const productsCount = await productsServices().getProductsCount();
          const numberOfTenPages = Math.floor(productsCount / 10)
          const remainder = productsCount % 10
          let totalNumberOfTenPages
          remainder > 0 ?
               totalNumberOfTenPages = numberOfTenPages + 1 : numberOfTenPages

          let products = []

          for (let page = 0; page < totalNumberOfTenPages; page++) {
               products.concat(await productsServices().getProductsByPage(page, 10))
          }

          return {
               props: {
                    products: JSON.parse(JSON.stringify(products)),
                    productsCount: JSON.parse(JSON.stringify(productsCount)),
                    // page: parseInt(context.query.page),
                    // limit: parseInt(context.query.limit)qa
               },
               revalidate: 1
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
