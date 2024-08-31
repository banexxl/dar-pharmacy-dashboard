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
import { productsServices } from '../../services/product-services'
import { useRouter } from 'next/navigation';
import { TablePagination } from '@mui/material'
import { AddProductForm } from '@/sections/products/new-product-form';
import { SessionProvider, useSession } from 'next-auth/react';
import { useMounted } from '@/hooks/use-mounted';


const useProductSearch = () => {

     const [state, setState] = useState({
          query: '',
          page: 0,
          rowsPerPage: 5,
          sortBy: 'createdAt',
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


const Page = (props: any) => {

     const productSearch = useProductSearch();

     const productsIds = useMemo(() => {
          if (!Array.isArray(props.products)) {
               return [];
          }
          return props.allProducts.map((product: any) => product._id);
     }, [props.products]);


     const [productStore, setProductStore] = useState({
          allProducts: [],
     });

     const isMounted = useMounted();

     useEffect(() => {
          if (isMounted()) {
               setProductStore({
                    allProducts: props.allProducts,
               });
          }
     }, [isMounted, props.allProducts]);

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
          <SessionProvider>
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
                                                  {loading ? 'Šaljem' : 'Pošalji izmene na sajt'}
                                             </Button>
                                        </Box>
                                   </Stack>
                                   <TablePagination
                                        component="div"
                                        count={productStore.allProducts.length}
                                        onPageChange={productSearch.handlePageChange}
                                        onRowsPerPageChange={productSearch.handleRowsPerPageChange}
                                        page={productSearch.state.page}
                                        rowsPerPage={productSearch.state.rowsPerPage}
                                        rowsPerPageOptions={[5, 10, 25, 50, 100, 200]}
                                        showFirstButton
                                        showLastButton
                                        labelRowsPerPage={'Broj po stranici'}
                                   //labelDisplayedRows={({ from, to, count }) => { return `${ from }–${ to } od ${ count !== -1 ? count : `više od ${ to }` }`; }}
                                   />
                                   <ProductsTable
                                        count={productStore.allProducts.length}
                                        items={productStore.allProducts}
                                        page={productSearch.state.page}
                                        rowsPerPage={productSearch.state.rowsPerPage}
                                        selected={productsSelection.selected}
                                   />
                                   <TablePagination
                                        component="div"
                                        count={productStore.allProducts.length}
                                        onPageChange={productSearch.handlePageChange}
                                        onRowsPerPageChange={productSearch.handleRowsPerPageChange}
                                        page={productSearch.state.page}
                                        rowsPerPage={productSearch.state.rowsPerPage}
                                        rowsPerPageOptions={[5, 10, 25, 50, 100, 200]}
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
          </SessionProvider>
     );
};


export async function getServerSideProps(context: any) {
     try {
          const allProducts = await productsServices().getAllProducts();

          return {
               props: {
                    allProducts: JSON.parse(JSON.stringify(allProducts)),
               },
          };
     } catch (error) {
          console.error("Error fetching products:", error);
          return {
               props: {
                    allProducts: [],
               },
          };
     }
}

Page.getLayout = (page: any) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;