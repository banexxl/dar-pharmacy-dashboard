import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Swal from 'sweetalert2'
import { Box, Button, Card, Container, IconButton, Input, InputAdornment, OutlinedInput, Stack, SvgIcon, Tab, Tabs, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ProductsTable } from 'src/sections/products/products-table';
import { productsServices } from '../../services/product-services'
import { useRouter } from 'next/navigation';
import { TablePagination } from '@mui/material'
import { AddProductForm } from '@/sections/products/new-product-form';
import { SessionProvider, useSession } from 'next-auth/react';
import { useMounted } from '@/hooks/use-mounted';
import { generateSlug } from '@/utils/generate-slug';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import ClearIcon from '@mui/icons-material/Clear';


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
     const isScreentoMedium = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
     const [activeTab, setActiveTab] = useState<'products' | 'manufacturers'>('products');

     const productsIds = useMemo(() => {
          if (!Array.isArray(props.products)) {
               return [];
          }
          return props.allProducts.map((product: any) => product._id);
     }, [props.products]);


     const [productStore, setProductStore] = useState({
          allProducts: [],
     });

     const [logoStore, setLogoStore] = useState({
          allLogos: [],
     });

     const [logoSearch, setLogoSearch] = useState('');
     const [editingLogoId, setEditingLogoId] = useState<string | null>(null);
     const [logoDrafts, setLogoDrafts] = useState<Record<string, { name: string; value: string; url: string }>>({});
     const [newLogoName, setNewLogoName] = useState('');
     const [logoModalOpen, setLogoModalOpen] = useState(false);
     const [logoUploadId, setLogoUploadId] = useState<string | null>(null);
     const [logoPage, setLogoPage] = useState(0);
     const [logoRowsPerPage, setLogoRowsPerPage] = useState(10);

     const isMounted = useMounted();

     useEffect(() => {
          if (isMounted()) {
               setProductStore({
                    allProducts: props.allProducts,
               });
               setLogoStore({
                    allLogos: props.allLogos,
               });
          }
     }, [isMounted, props.allProducts, props.allLogos]);

     const [open, setOpen] = useState(false)
     const productsSelection = useSelection(productsIds);
     const router = useRouter();

     const handleProductUpdated = (updatedProduct: any) => {
          setProductStore((prevState: any) => ({
               ...prevState,
               allProducts: prevState.allProducts.map((product: any) =>
                    product._id === updatedProduct._id ? updatedProduct : product
               )
          }));
     };

     const handleSubmitSuccess = () => {
          setOpen(false); // Close the dialog
     };

     const handleSubmitFail = () => {
          setOpen(false)
     }


     const filteredLogos = useMemo(() => {
          if (!Array.isArray(logoStore.allLogos)) {
               return [];
          }

          const query = logoSearch.trim().toLowerCase();
          if (!query) {
               return logoStore.allLogos;
          }

          return logoStore.allLogos.filter((logo: any) => {
               return (
                    logo.name?.toLowerCase().includes(query) ||
                    logo.value?.toLowerCase().includes(query)
               );
          });
     }, [logoStore.allLogos, logoSearch]);

     const pagedLogos = useMemo(() => {
          const start = logoPage * logoRowsPerPage;
          return filteredLogos.slice(start, start + logoRowsPerPage);
     }, [filteredLogos, logoPage, logoRowsPerPage]);

     const handleLogoEditStart = (logo: any) => {
          setEditingLogoId(logo._id);
          setLogoDrafts((prev) => ({
               ...prev,
               [logo._id]: {
                    name: logo.name || '',
                    value: logo.value || '',
                    url: logo.url || ''
               }
          }));
     };

     const handleLogoEditCancel = () => {
          setEditingLogoId(null);
     };

     const handleLogoDraftChange = (logoId: string, field: 'name' | 'value' | 'url', value: string) => {
          setLogoDrafts((prev) => ({
               ...prev,
               [logoId]: {
                    ...prev[logoId],
                    [field]: value,
                    ...(field === 'name' ? { value: generateSlug(value) } : {})
               }
          }));
     };

     const handleLogoSave = async (logoId: string) => {
          const draft = logoDrafts[logoId];
          if (!draft) {
               return;
          }

          try {
               const response = await fetch('/api/logo-urls', {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ _id: logoId, ...draft })
               });

               if (response.ok) {
                    const result = await response.json();
                    if (result?.data) {
                         setLogoStore((prev: any) => ({
                              ...prev,
                              allLogos: prev.allLogos.map((logo: any) =>
                                   logo._id === result.data._id ? result.data : logo
                              )
                         }));
                    }
                    setEditingLogoId(null);
                    Swal.fire({
                         icon: 'success',
                         title: 'OK',
                         text: 'Proizvođač ažuriran.'
                    });
               } else {
                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Ažuriranje nije uspelo.'
                    });
               }
          } catch (error) {
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Ažuriranje nije uspelo.'
               });
          }
     };

     const readFileAsDataUrl = (file: File): Promise<string> =>
          new Promise((resolve, reject) => {
               const reader = new FileReader();
               reader.onloadend = () => resolve(reader.result as string);
               reader.onerror = reject;
               reader.readAsDataURL(file);
          });

     const uploadLogoImage = async (file: File, manufacturer: string) => {
          const fileExtension = file.name.split('.').pop() || '';
          const title = file.name.split('.')[0] || 'logo';

          const base64Data = await readFileAsDataUrl(file);
          const response = await fetch('/api/aws/aws-s3-image-storage', {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                    file: base64Data,
                    title,
                    extension: fileExtension,
                    fileName: file.name,
                    manufacturer
               })
          });

          if (!response.ok) {
               throw new Error('Upload failed');
          }

          const result = await response.json();
          return result.imageUrl as string;
     };

     const handleLogoDelete = async (logoId: string) => {
          const result = await Swal.fire({
               title: 'Da li ste sigurni?',
               text: 'Brisanje je trajno.',
               icon: 'warning',
               showCancelButton: true,
               confirmButtonText: 'Da, obriši',
               cancelButtonText: 'Odustani'
          });

          if (!result.isConfirmed) {
               return;
          }

          try {
               const response = await fetch('/api/logo-urls', {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ _id: logoId })
               });

               if (response.ok) {
                    setLogoStore((prev: any) => ({
                         ...prev,
                         allLogos: prev.allLogos.filter((logo: any) => logo._id !== logoId)
                    }));
                    Swal.fire({
                         icon: 'success',
                         title: 'OK',
                         text: 'Proizvođač obrisan.'
                    });
               } else {
                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Brisanje nije uspelo.'
                    });
               }
          } catch (error) {
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Brisanje nije uspelo.'
               });
          }
     };

     const handleCreateLogo = async () => {
          if (!newLogoName.trim()) {
               Swal.fire({
                    icon: 'warning',
                    title: 'Unesite naziv',
                    text: 'Naziv proizvođača je obavezan.'
               });
               return;
          }

          try {
               const response = await fetch('/api/logo-urls', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: newLogoName.trim() })
               });

               if (response.ok) {
                    const result = await response.json();
                    if (result?.data) {
                         setLogoStore((prev: any) => ({
                              ...prev,
                              allLogos: [result.data, ...prev.allLogos]
                         }));
                    }
                    setNewLogoName('');
                    setLogoModalOpen(false);
                    Swal.fire({
                         icon: 'success',
                         title: 'OK',
                         text: 'Proizvođač dodat.'
                    });
               } else {
                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Dodavanje nije uspelo.'
                    });
               }
          } catch (error) {
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Dodavanje nije uspelo.'
               });
          }
     };

     const handleLogoUploadAndSave = async (logo: any, file: File) => {
          const manufacturerKey = logo.value || logo.name;

          if (!manufacturerKey) {
               Swal.fire({
                    icon: 'warning',
                    title: 'Unesite naziv ili value',
                    text: 'Unesite naziv ili value pre upload-a logo slike.'
               });
               return;
          }

          try {
               setLogoUploadId(logo._id);
               const imageUrl = await uploadLogoImage(file, manufacturerKey);
               const response = await fetch('/api/logo-urls', {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ _id: logo._id, url: imageUrl })
               });

               if (response.ok) {
                    const result = await response.json();
                    if (result?.data) {
                         setLogoStore((prev: any) => ({
                              ...prev,
                              allLogos: prev.allLogos.map((item: any) =>
                                   item._id === result.data._id ? result.data : item
                              )
                         }));
                    }
                    Swal.fire({
                         icon: 'success',
                         title: 'OK',
                         text: 'Logo je uploadovan.'
                    });
               } else {
                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Upload nije uspeo.'
                    });
               }
          } catch (error) {
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Upload nije uspeo.'
               });
          } finally {
               setLogoUploadId(null);
          }
     };

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

                                   </Stack>
                                   <Tabs
                                        value={activeTab}
                                        onChange={(event, value) => setActiveTab(value)}
                                   >
                                        <Tab label="Proizvodi" value="products" />
                                        <Tab label="Proizvođači" value="manufacturers" />
                                   </Tabs>

                                   {activeTab === 'products' && (
                                        <>
                                             <ProductsTable
                                                  count={productStore.allProducts.length}
                                                  items={productStore.allProducts}
                                                  onProductUpdated={handleProductUpdated}
                                                  onAddProductClick={() => setOpen(true)}
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
                                        </>
                                   )}

                                   {activeTab === 'manufacturers' && (
                                        <Card sx={{ p: 2 }}>
                                             <Stack spacing={2}>
                                                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                                       <OutlinedInput
                                                            value={logoSearch}
                                                            onChange={(event) => setLogoSearch(event.target.value)}
                                                            fullWidth
                                                            placeholder="Pronađi proizvođača po nazivu..."
                                                            startAdornment={(
                                                                 <InputAdornment position="start">
                                                                      <SvgIcon
                                                                           color="action"
                                                                           fontSize="small"
                                                                      >
                                                                           <MagnifyingGlassIcon />
                                                                      </SvgIcon>
                                                                 </InputAdornment>
                                                            )}
                                                            endAdornment={(
                                                                 <InputAdornment position="end">
                                                                      <IconButton
                                                                           onClick={() => setLogoSearch('')}
                                                                      >
                                                                           <SvgIcon
                                                                                color="action"
                                                                                fontSize="small"
                                                                           >
                                                                                <ClearIcon />
                                                                           </SvgIcon>
                                                                      </IconButton>
                                                                 </InputAdornment>
                                                            )}
                                                            sx={{ maxWidth: 500 }}
                                                       />
                                                       <Button
                                                            variant="contained"
                                                            size="medium"
                                                            onClick={() => setLogoModalOpen(true)}
                                                            sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                                                       >
                                                            Dodaj proizvođača
                                                       </Button>
                                                  </Stack>
                                                  <Stack spacing={2}>
                                                       {pagedLogos.map((logo: any) => {
                                                            const isEditing = editingLogoId === logo._id;
                                                            const draft = logoDrafts[logo._id] || { name: logo.name || '', value: logo.value || '', url: logo.url || '' };

                                                            return (
                                                                 <Box
                                                                      key={logo._id}
                                                                      sx={{
                                                                           display: 'flex',
                                                                           gap: 2,
                                                                           alignItems: 'center',
                                                                           border: '1px solid',
                                                                           borderColor: 'divider',
                                                                           borderRadius: 1,
                                                                           p: 2
                                                                      }}
                                                                 >
                                                                      <Box
                                                                           sx={{
                                                                                width: 64,
                                                                                height: 64,
                                                                                borderRadius: 1,
                                                                                backgroundColor: 'neutral.50',
                                                                                backgroundImage: `url(${isEditing ? draft.url : logo.url})`,
                                                                                backgroundPosition: 'center',
                                                                                backgroundSize: 'cover',
                                                                                flexShrink: 0
                                                                           }}
                                                                      />
                                                                      <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                                           <TextField
                                                                                label="Naziv"
                                                                                value={isEditing ? draft.name : logo.name}
                                                                                onChange={(event) => handleLogoDraftChange(logo._id, 'name', event.target.value)}
                                                                                disabled={!isEditing}
                                                                                size="small"
                                                                                sx={{ minWidth: 200 }}
                                                                           />
                                                                           <TextField
                                                                                label="Value"
                                                                                value={isEditing ? draft.value : logo.value}
                                                                                onChange={(event) => handleLogoDraftChange(logo._id, 'value', event.target.value)}
                                                                                disabled
                                                                                size="small"
                                                                                sx={{ minWidth: 200 }}
                                                                           />
                                                                      </Box>
                                                                      <Stack direction="row" spacing={1} alignItems="center">
                                                                           {isEditing ? (
                                                                                <>
                                                                                     <Button variant="contained" onClick={() => handleLogoSave(logo._id)}>
                                                                                          Sačuvaj
                                                                                     </Button>
                                                                                     <Button color="inherit" onClick={handleLogoEditCancel}>
                                                                                          Odustani
                                                                                     </Button>
                                                                                </>
                                                                           ) : (
                                                                                <>
                                                                                     <Button variant="contained" onClick={() => handleLogoEditStart(logo)}>
                                                                                          Izmeni
                                                                                     </Button>
                                                                                     <Button
                                                                                          component="label"
                                                                                          variant="outlined"
                                                                                          disabled={logoUploadId === logo._id}
                                                                                     >
                                                                                          {logoUploadId === logo._id ? 'Uploadujem...' : 'Update logo'}
                                                                                          <Input
                                                                                               type="file"
                                                                                               inputProps={{ accept: 'image/*' }}
                                                                                               sx={{
                                                                                                    clip: 'rect(0 0 0 0)',
                                                                                                    clipPath: 'inset(50%)',
                                                                                                    height: 1,
                                                                                                    overflow: 'hidden',
                                                                                                    position: 'absolute',
                                                                                                    bottom: 0,
                                                                                                    left: 0,
                                                                                                    whiteSpace: 'nowrap',
                                                                                                    width: 1,
                                                                                               }}
                                                                                               onChange={(event: any) => {
                                                                                                    const file = event.target.files?.[0];
                                                                                                    if (file) {
                                                                                                         handleLogoUploadAndSave(logo, file);
                                                                                                    }
                                                                                               }}
                                                                                          />
                                                                                     </Button>
                                                                                     <Button color="error" onClick={() => handleLogoDelete(logo._id)}>
                                                                                          Obriši
                                                                                     </Button>
                                                                                </>
                                                                           )}
                                                                      </Stack>
                                                                 </Box>
                                                            );
                                                       })}
                                                  </Stack>
                                                  <TablePagination
                                                       component="div"
                                                       count={filteredLogos.length}
                                                       onPageChange={(event, page) => setLogoPage(page)}
                                                       onRowsPerPageChange={(event) => {
                                                            setLogoPage(0);
                                                            setLogoRowsPerPage(parseInt(event.target.value, 10));
                                                       }}
                                                       page={logoPage}
                                                       rowsPerPage={logoRowsPerPage}
                                                       rowsPerPageOptions={[5, 10, 25, 50]}
                                                       showFirstButton
                                                       showLastButton
                                                       labelRowsPerPage={'Broj po stranici'}
                                                  />
                                             </Stack>
                                        </Card>
                                   )}
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
                    <Dialog open={logoModalOpen} onClose={() => setLogoModalOpen(false)}>
                         <DialogTitle>Dodaj proizvođača</DialogTitle>
                         <DialogContent dividers>
                              <Stack spacing={2} sx={{ mt: 1, minWidth: 320 }}>
                                   <TextField
                                        label="Naziv"
                                        value={newLogoName}
                                        onChange={(event) => setNewLogoName(event.target.value)}
                                        fullWidth
                                   />
                                   <Stack direction="row" spacing={2} justifyContent="flex-end">
                                        <Button color="inherit" onClick={() => setLogoModalOpen(false)}>
                                             Odustani
                                        </Button>
                                        <Button variant="contained" onClick={handleCreateLogo}>
                                             Dodaj
                                        </Button>
                                   </Stack>
                              </Stack>
                         </DialogContent>
                    </Dialog>
               </Box >
          </SessionProvider>
     );
};


export async function getServerSideProps(context: any) {
     try {
          const [allProducts, allLogos] = await Promise.all([
               productsServices().getAllProducts(),
               productsServices().getAllLogos()
          ]);

          return {
               props: {
                    allProducts: JSON.parse(JSON.stringify(allProducts)),
                    allLogos: JSON.parse(JSON.stringify(allLogos)),
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