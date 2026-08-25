import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
     Alert, Autocomplete, Box, Button, Card, CardContent, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Input, InputAdornment, LinearProgress, ListItemText, MenuItem,
     OutlinedInput,
     Select, Stack, SvgIcon, Switch, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography, useTheme
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PropTypes from 'prop-types';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Image from 'next/image';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from '@/components/severity-pill';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

import { newProductSchema, quantityUnitOptions } from './new-product-schema';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import ClearIcon from '@mui/icons-material/Clear';
import { getComparator } from '../order/order-list-table';
import { Product } from '../../schemas/product';

export const ProductsTable = (props: any) => {

     const {
          items = [],
          manufacturers = [],
          page = 0,
          rowsPerPage = 5,
          sortDir = 'desc',
          sortBy = 'createdAt',
          onSelect = () => { },
          onProductUpdated = () => { },
          onAddProductClick = () => { },
          count = 0,
     } = props;

     const [currentProductID, setCurrentProductID] = useState(null);
     const [currentProductObject, setCurrentProductObject] = useState<Product | null>();
     const router = useRouter();
     const [fileURL, setFileURL] = useState("")
     const [loading, setLoading] = useState(false)

     // ─── Category state from DB ─────────────────────────────────────────────────
     const [mainCategoriesDB, setMainCategoriesDB] = useState<any[]>([]);
     const [midCategoriesDB, setMidCategoriesDB] = useState<any[]>([]);
     const [subCategoriesDB, setSubCategoriesDB] = useState<any[]>([]);

     const [editMainValue, setEditMainValue] = useState('');
     const [editMidValue, setEditMidValue] = useState('');

     useEffect(() => {
          const fetchCategories = async () => {
               try {
                    const res = await fetch('/api/categories');
                    if (!res.ok) return;
                    const json = await res.json();
                    setMainCategoriesDB(json.data.main ?? []);
                    setMidCategoriesDB(json.data.mid ?? []);
                    setSubCategoriesDB(json.data.sub ?? []);
               } catch {
                    // silent
               }
          };
          fetchCategories();
     }, []);

     const mainCategoryOptions = useMemo(() => {
          return [{ id: '', label: 'Obriši polje', value: '' }, ...mainCategoriesDB];
     }, [mainCategoriesDB]);

     const filteredMidOptions = useMemo(() => {
          if (!editMainValue) return [];
          const selectedMain = mainCategoriesDB.find((c: any) => c.value === editMainValue);
          if (!selectedMain) return [];
          return midCategoriesDB.filter((m: any) => m.main_category_id === selectedMain.id);
     }, [midCategoriesDB, mainCategoriesDB, editMainValue]);

     const midCategoryOptions = useMemo(() => {
          if (filteredMidOptions.length === 0) return [];
          return [{ id: '', label: 'Obriši polje', value: '' }, ...filteredMidOptions];
     }, [filteredMidOptions]);

     const filteredSubOptions = useMemo(() => {
          if (!editMidValue) return [];
          const selectedMid = midCategoriesDB.find((c: any) => c.value === editMidValue);
          if (!selectedMid) return [];
          return subCategoriesDB.filter((s: any) => s.mid_category_id === selectedMid.id);
     }, [subCategoriesDB, midCategoriesDB, editMidValue]);

     const subCategoryOptions = useMemo(() => {
          if (filteredSubOptions.length === 0) return [];
          return [{ id: '', label: 'Obriši polje', value: '' }, ...filteredSubOptions];
     }, [filteredSubOptions]);

     const isMidDisabled = !editMainValue || filteredMidOptions.length === 0;
     const isSubDisabled = !editMidValue || filteredSubOptions.length === 0;

     const normalizeKey = (value: unknown) => String(value ?? '').trim().toLowerCase();

     const manufacturerOptions = useMemo(() => {
          if (!Array.isArray(manufacturers)) {
               return [];
          }

          return manufacturers
               .map((item: any) => ({
                    id: item?.id || '',
                    label: item?.name || item?.label || '',
                    value: item?.value || '',
                    url: item?.url || ''
               }))
               .filter((option: any) => option.label);
     }, [manufacturers]);

     const getManufacturerOptionFromProduct = (product?: Product | null) => {
          if (!product || !Array.isArray(manufacturerOptions)) {
               return null;
          }

          const productRecord = product as Record<string, any>;

          const lookupKeys = [
               normalizeKey(productRecord.manufacturer_id),
               normalizeKey(productRecord.manufacturerId),
               normalizeKey(productRecord.manufacturerURL),
               normalizeKey(productRecord.manufacturer_url),
               normalizeKey(productRecord.manufacturer),
          ].filter(Boolean);

          if (lookupKeys.length === 0) {
               return null;
          }

          return manufacturerOptions.find((option: any) => {
               const optionKeys = [
                    normalizeKey(option?.id),
                    normalizeKey(option?.value),
                    normalizeKey(option?.url),
                    normalizeKey(option?.label)
               ].filter(Boolean);

               return optionKeys.some((key: string) => lookupKeys.includes(key));
          }) ?? null;
     };

     const getObjectById = (id: any, arrayToSearch: any) => {
          for (const obj of arrayToSearch) {
               if (obj.id === id) {
                    return obj;  // Found the object with the desired ID
               }
          }
          return null;  // Object with the desired ID not found
     }

     const handleProductToggle = (productId: any) => {
          setCurrentProductID((prevProductId: any) => {
               if (prevProductId === productId) {
                    setCurrentProductObject(null)
                    setEditMainValue('');
                    setEditMidValue('');
                    return null;
               }
               const selectedProduct = getObjectById(productId, items);
               const selectedManufacturer = getManufacturerOptionFromProduct(selectedProduct);

               if (selectedProduct) {
                    setEditMainValue(selectedProduct.main_category || '');
                    setEditMidValue(selectedProduct.mid_category || '');

                    setCurrentProductObject({
                         ...selectedProduct,
                         manufacturer: selectedManufacturer?.label || selectedProduct.manufacturer || selectedProduct.manufacturer_id || '',
                         manufacturerURL: selectedManufacturer?.value || selectedProduct.manufacturerURL || selectedProduct.manufacturer_id || '',
                         manufacturer_id: selectedProduct.manufacturer_id || selectedManufacturer?.id || selectedManufacturer?.value || '',
                    });
               } else {
                    setCurrentProductObject(null);
                    setEditMainValue('');
                    setEditMidValue('');
               }

               return productId;
          });
     }

     const handleFileRemove = () => {
          setCurrentProductObject((previousObject: any) => ({
               ...previousObject,
               image_url: ""
          }))
     }

     const handleProductClose = () => {
          setCurrentProductID(null);
     }

     const handleProductUpdateClick = async () => {
          const errors: string[] = [];

          // Run yup schema validation
          try {
               await newProductSchema().validate(currentProductObject, { abortEarly: false });
          } catch (validationError: any) {
               if (validationError?.inner) {
                    validationError.inner.forEach((err: any) => {
                         if (err.message) errors.push(err.message);
                    });
               }
          }

          // Category child validation
          if (filteredMidOptions.length > 0 && !currentProductObject?.mid_category) {
               errors.push('Srednja kategorija je obavezna za izabranu glavnu kategoriju.');
          }
          if (filteredSubOptions.length > 0 && !currentProductObject?.sub_category) {
               errors.push('Podkategorija je obavezna za izabranu srednju kategoriju.');
          }

          if (errors.length > 0) {
               Swal.fire({
                    icon: 'error',
                    title: 'Greške u validaciji',
                    html: `<ul style="text-align:left;margin:0;padding-left:20px;">${errors.map((e) => `<li>${e}</li>`).join('')}</ul>`,
               });
               return;
          }

          // Detect inactive → active transition
          const originalProduct = getObjectById(currentProductID, items);
          const wasInactive = originalProduct && !originalProduct.is_active;
          const isNowActive = currentProductObject?.is_active === true;

          if (wasInactive && isNowActive) {
               setActivationDialogOpen(true);
               return;
          }

          proceedWithUpdate();
     }

     const proceedWithUpdate = () => {
          Swal.fire({
               title: 'Da li ste sigurni?',
               text: "Možete izmeniti artikl u svakom momentu...",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Da, izmeni!',
               cancelButtonText: 'Odustani!'
          }).then((result) => {
               if (result.isConfirmed) {
                    handleUpdateProduct(currentProductObject)
               }
          })
     }

     const handleActivationConfirm = () => {
          setActivationDialogOpen(false);
          proceedWithUpdate();
     }

     const handleActivationCancel = () => {
          setActivationDialogOpen(false);
          setCurrentProductObject((prev: any) => ({
               ...prev,
               is_active: false,
          }));
     }

     const handleUpdateProduct = async (currentProductObject: any) => {
          try {
               //API CALL
               const response = await fetch('/api/product-api', {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': 'https://dar-pharmacy-dashboard.vercel.app/api/product-api, http://localhost:3000/api/product-api',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
                    },
                    body: JSON.stringify(currentProductObject)
               });

               if (response.ok) {
                    const result = await response.json();
                    if (result?.data) {
                         // Enrich with manufacturer name from the local list
                         const updatedProduct = result.data;
                         const matchedManufacturer = manufacturerOptions.find(
                              (m: any) => m.id === updatedProduct.manufacturer_id
                         );
                         if (matchedManufacturer) {
                              updatedProduct.manufacturer_name = matchedManufacturer.label;
                              updatedProduct.manufacturer_value = matchedManufacturer.value;
                              updatedProduct.manufacturer_url = matchedManufacturer.url;
                         }
                         onProductUpdated(updatedProduct);
                    }
                    handleProductClose()
                    setCurrentProductObject(null)
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: 'Artikl izmenjen :)',
                    })
                    //router.refresh()
               } else {
                    const errorData = await response.json(); // Parse the error response
               }

          } catch (err) {
               alert(err);
          }
     }

     const handleMainCategoryChangeEdit = (event: any) => {
          const value = event.target.value;
          setEditMainValue(value);
          setEditMidValue('');
          setCurrentProductObject((prev: any) => ({
               ...prev,
               main_category: value,
               mid_category: '',
               sub_category: '',
          }));
     };

     const handleMidCategoryChangeEdit = (event: any) => {
          const value = event.target.value;
          setEditMidValue(value);
          setCurrentProductObject((prev: any) => ({
               ...prev,
               mid_category: value,
               sub_category: '',
          }));
     };

     const handleSubCategoryChangeEdit = (event: any) => {
          const value = event.target.value;
          setCurrentProductObject((prev: any) => ({
               ...prev,
               sub_category: value,
          }));
     };

     const handleDeleteButtonClick = () => {
          Swal.fire({
               title: 'Are you sure?',
               text: "You won't be able to revert this!",
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: 'Yes, delete it!'
          }).then((result) => {
               if (result.isConfirmed) {
                    handleDeleteProduct(currentProductID)
               }
          })
     }

     const handleDeleteProduct = async (currentProductID: any) => {

          const currentProductObject = getObjectById(currentProductID, items)

          try {

               const response = await fetch('/api/product-api', {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': 'https://dar-pharmacy-dashboard.vercel.app/api/product-api, http://localhost:3000/api/product-api',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
                    },
                    body: JSON.stringify({ currentProductID: currentProductID, imageID: currentProductObject.image_url }), // Convert your data to JSON
               })

               if (response.ok) {
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: 'Artikl obrisan!',
                    })
                    router.refresh()
               } else {
                    const errorData = await response.json(); // Parse the error response
               }

          } catch (err) {
               alert(err);
          }
     }

     const [searchQuery, setSearchQuery] = useState('');
     const [booleanFilters, setBooleanFilters] = useState<string[]>([]);
     const [internalPage, setInternalPage] = useState(0);
     const [internalRowsPerPage, setInternalRowsPerPage] = useState(rowsPerPage || 10);
     const [activationDialogOpen, setActivationDialogOpen] = useState(false);

     const booleanFilterOptions = [
          { value: 'is_active', label: 'Aktivan' },
          { value: 'display_on_home', label: 'Na početnoj' },
          { value: 'discount', label: 'Popust' },
          { value: 'new_arrival', label: 'Novi proizvod' },
          { value: 'best_seller', label: 'Najprodavaniji' },
          { value: 'promoting', label: 'Promocija' }
     ];

     const handleClearSearch = () => {
          setSearchQuery('');
          setInternalPage(0);
     };

     const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          setSearchQuery(event.target.value);
          setInternalPage(0);
     };

     const handleImageChange = async (event: any) => {

          const selectedFile = event.target.files[0];

          if (!selectedFile) {
               return;
          }

          setLoading(true);

          // Extract file extension
          const fileExtension = selectedFile.name.split('.')[1]

          // Assuming you have a title for the image
          const title = selectedFile.name.split('.')[0]
          const apiUrl = '/api/aws/aws-s3-image-storage'

          try {
               const reader = new FileReader();
               reader.readAsDataURL(selectedFile);
               reader.onloadend = async () => {
                    const base64Data = reader.result;
                    const data = {
                         file: base64Data,
                         title: title,
                         extension: fileExtension,
                         fileName: selectedFile.name,
                         manufacturer_id: currentProductObject!.manufacturer_id || '',
                    };

                    const response = await fetch(apiUrl, {
                         method: 'POST',
                         headers: {
                              'Content-Type': 'application/json'
                         },
                         body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                         Swal.fire({
                              title: 'Greška',
                              text: "Neuspešan upload slike!",
                              icon: 'error',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         })
                    } else {
                         Swal.fire({
                              title: 'OK',
                              text: "Uspešan upload slike!",
                              icon: 'success',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         })
                         const result = await response.json();
                         setFileURL(result.imageUrl)
                         setLoading(false)
                         setCurrentProductObject((previousObject: any) => ({
                              ...previousObject,
                              image_url: result.imageUrl
                         }))
                    }
               }
          } catch (error) {
               console.error('Error uploading image:', error);
          } finally {
               setLoading(false);
          }
     };

     const filteredRows = useMemo(
          () =>
               [...items]
                    .filter((product: Product) => {
                         if (!searchQuery) {
                              return true;
                         }

                         const name = (product.name || '').toString().toLowerCase();
                         return name.includes(searchQuery.toLowerCase());
                    })
                    .filter((product: Product) => {
                         if (booleanFilters.length === 0) return true;
                         return booleanFilters.every((key) => Boolean((product as any)[key]) === true);
                    })
                    .sort(getComparator(sortDir, sortBy)),
          [searchQuery, items, booleanFilters],
     );

     const visibleRows = useMemo(
          () => filteredRows.slice(internalPage * internalRowsPerPage, internalPage * internalRowsPerPage + internalRowsPerPage),
          [filteredRows, internalPage, internalRowsPerPage],
     );

     return (
          <>
               <Card>
                    <Card sx={{ p: 2 }}>
                         <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" alignItems="center" justifyContent="space-between">
                              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" alignItems="center" sx={{ flexGrow: 1 }}>
                                   <OutlinedInput
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        fullWidth
                                        placeholder="Pronađi proizvod po nazivu..."
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
                                                       onClick={handleClearSearch}
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
                                   <Select
                                        multiple
                                        displayEmpty
                                        value={booleanFilters}
                                        onChange={(event) => setBooleanFilters(event.target.value as string[])}
                                        renderValue={(selected) => {
                                             if (selected.length === 0) {
                                                  return 'Svi filteri';
                                             }
                                             return booleanFilterOptions
                                                  .filter((option) => selected.includes(option.value))
                                                  .map((option) => option.label)
                                                  .join(', ');
                                        }}
                                        sx={{ minWidth: 240 }}
                                   >
                                        {booleanFilterOptions.map((option) => (
                                             <MenuItem key={option.value} value={option.value}>
                                                  <Checkbox checked={booleanFilters.includes(option.value)} />
                                                  <ListItemText primary={option.label} />
                                             </MenuItem>
                                        ))}
                                   </Select>
                              </Stack>
                              <Alert severity="info" sx={{ py: 0.5, mt: 1 }}>
                                   Pretraga pretražuje po nazivu proizvoda. Koristite filtere za dodatne opcije.
                              </Alert>
                              <Button
                                   size="small"
                                   startIcon={(
                                        <SvgIcon fontSize="small">
                                             <PlusIcon />
                                        </SvgIcon>
                                   )}
                                   variant="contained"
                                   onClick={onAddProductClick}
                              >
                                   Dodaj proizvod
                              </Button>
                         </Stack>
                    </Card>
                    <Box
                         sx={{
                              minWidth: 0,
                              overflowX: 'auto',
                              width: '100%',
                         }}
                    >
                         <Box sx={{ minWidth: 800 }}>
                              <Table>
                                   <TableHead>
                                        <TableRow>
                                             <TableCell>

                                             </TableCell>
                                             <TableCell>
                                                  Naziv
                                             </TableCell>
                                             <TableCell>
                                                  Na stanju
                                             </TableCell>
                                             <TableCell>
                                                  Cena
                                             </TableCell>
                                             <TableCell>
                                                  Šifra
                                             </TableCell>
                                             <TableCell>
                                                  Na popustu
                                             </TableCell>
                                             <TableCell>
                                                  Popust %
                                             </TableCell>
                                             <TableCell>
                                                  Na početnoj
                                             </TableCell>
                                             <TableCell>
                                                  Aktivan
                                             </TableCell>
                                        </TableRow>
                                   </TableHead>
                                   <TableBody>
                                        {
                                             visibleRows.length > 0 ?
                                                  visibleRows.map((product: Product) => {
                                                       //const isSelected = selected.includes(product.id);
                                                       const isCurrent = product.id === currentProductID;
                                                       const quantityColor = (product.quantity ?? 0) >= 10 ? 'success' : 'error';
                                                       const statusColor = product.is_active === true ? 'success' : 'info';
                                                       const homeColor = product.display_on_home ? 'success' : 'info';
                                                       // const hasManyVariants = product.variants > 1;

                                                       return (
                                                            <Fragment key={product.id}>
                                                                 <TableRow
                                                                      hover

                                                                 >
                                                                      <TableCell

                                                                           padding="checkbox"
                                                                           sx={{
                                                                                ...(isCurrent && {
                                                                                     position: 'relative',
                                                                                     '&:after': {
                                                                                          position: 'absolute',
                                                                                          content: '" "',
                                                                                          top: 0,
                                                                                          left: 0,
                                                                                          backgroundColor: 'primary.main',
                                                                                          width: 3,
                                                                                          height: 'calc(100% + 1px)',
                                                                                     },
                                                                                }),
                                                                           }}
                                                                           width="25%"
                                                                      >
                                                                           <IconButton onClick={() => handleProductToggle(product.id)}>
                                                                                <SvgIcon>{isCurrent ? <ChevronDownIcon /> : <ChevronRightIcon />}</SvgIcon >
                                                                           </IconButton>
                                                                      </TableCell>
                                                                      <TableCell width="25%">
                                                                           <Box
                                                                                sx={{
                                                                                     alignItems: 'center',
                                                                                     display: 'flex',
                                                                                }}
                                                                           >
                                                                                {product.image_url ? (
                                                                                     <Box

                                                                                          sx={{
                                                                                               alignItems: 'center',
                                                                                               backgroundColor: 'neutral.50',
                                                                                               backgroundImage: `url(${product.image_url})`,
                                                                                               backgroundPosition: 'center',
                                                                                               backgroundSize: 'cover',
                                                                                               borderRadius: 1,
                                                                                               display: 'flex',
                                                                                               height: 80,
                                                                                               justifyContent: 'center',
                                                                                               overflow: 'hidden',
                                                                                               width: 80,
                                                                                          }}
                                                                                     />
                                                                                ) : (
                                                                                     <Box

                                                                                          sx={{
                                                                                               alignItems: 'center',
                                                                                               backgroundColor: 'neutral.50',
                                                                                               borderRadius: 1,
                                                                                               display: 'flex',
                                                                                               height: 80,
                                                                                               justifyContent: 'center',
                                                                                               width: 80,
                                                                                          }}
                                                                                     >
                                                                                          <SvgIcon >

                                                                                          </SvgIcon>
                                                                                     </Box>
                                                                                )}
                                                                                <Box

                                                                                     sx={{
                                                                                          cursor: 'pointer',
                                                                                          ml: 2,
                                                                                     }}
                                                                                >
                                                                                     <Typography variant="subtitle2">{product.name}</Typography>
                                                                                     <Typography

                                                                                          color="text.secondary"
                                                                                          variant="body2"
                                                                                     >
                                                                                          in {product.main_category}
                                                                                     </Typography>
                                                                                     <Typography

                                                                                          color="text.secondary"
                                                                                          variant="body2"
                                                                                     >
                                                                                          Proizvođač: {product.manufacturer_name ?? product.manufacturer_id ?? '-'}
                                                                                     </Typography>
                                                                                </Box>
                                                                           </Box>
                                                                      </TableCell>
                                                                      <TableCell width="25%">
                                                                           <LinearProgress

                                                                                value={product.quantity ?? 0}
                                                                                variant="determinate"
                                                                                color={quantityColor}
                                                                                sx={{
                                                                                     height: 8,
                                                                                     width: 40,
                                                                                }}
                                                                           />
                                                                           <Typography

                                                                                color="text.secondary"
                                                                                variant="body2"
                                                                           >
                                                                                {product.available_stock} in stock
                                                                                {/* {hasManyVariants && ` in ${product.variants} variants`} */}
                                                                           </Typography>
                                                                      </TableCell>
                                                                      <TableCell>{product.price}</TableCell>
                                                                      <TableCell>{product.id?.slice(-8)}</TableCell>
                                                                      <TableCell>
                                                                           <SeverityPill color={statusColor}>{product.discount.toString()}</SeverityPill>
                                                                      </TableCell>
                                                                      <TableCell>
                                                                           <SeverityPill color={statusColor}>{product.discount_amount}</SeverityPill>
                                                                      </TableCell>
                                                                      <TableCell>
                                                                           <SeverityPill color={homeColor}>
                                                                                {product.display_on_home ? 'Da' : 'Ne'}
                                                                           </SeverityPill>
                                                                      </TableCell>
                                                                      <TableCell>
                                                                           <SeverityPill color={statusColor}>
                                                                                {product.is_active ? 'Da' : 'Ne'}
                                                                           </SeverityPill>
                                                                      </TableCell>
                                                                 </TableRow>
                                                                 {isCurrent && (
                                                                      <TableRow>
                                                                           <TableCell

                                                                                colSpan={9}
                                                                                sx={{
                                                                                     p: 0,
                                                                                     position: 'relative',
                                                                                     '&:after': {
                                                                                          position: 'absolute',
                                                                                          content: '" "',
                                                                                          top: 0,
                                                                                          left: 0,
                                                                                          backgroundColor: 'primary.main',
                                                                                          width: 3,
                                                                                          height: 'calc(100% + 1px)',
                                                                                     },
                                                                                }}
                                                                           >
                                                                                <CardContent sx={{ width: { xs: 'calc(100vw - 64px)', md: 'auto' }, overflowX: 'hidden', boxSizing: 'border-box' }}>
                                                                                     <Grid
                                                                                          container
                                                                                          spacing={3}
                                                                                     >
                                                                                          <Grid
                                                                                               size={{ md: 6, xs: 12 }}
                                                                                          >
                                                                                               <Typography variant="h6">Osnovni detalji</Typography>
                                                                                               <Divider sx={{ my: 2 }} />
                                                                                               <Grid
                                                                                                    container
                                                                                                    spacing={3}
                                                                                               >
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              defaultValue={currentProductObject?.name}
                                                                                                              fullWidth
                                                                                                              label="Naziv"
                                                                                                              name="name"
                                                                                                              disabled={loading}
                                                                                                              onBlur={(e: any) =>
                                                                                                                   setCurrentProductObject((previousObject: any) => ({
                                                                                                                        ...previousObject,
                                                                                                                        name: e.target.value

                                                                                                                   }))
                                                                                                              }
                                                                                                         />
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              defaultValue={currentProductObject?.id?.slice(-8)}
                                                                                                              disabled
                                                                                                              fullWidth
                                                                                                              label="Šifra proizvoda"
                                                                                                              name={product.id?.slice(-8)}
                                                                                                         />
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              value={currentProductObject?.main_category || ''}
                                                                                                              fullWidth
                                                                                                              label="Glavna Kategorija"
                                                                                                              select
                                                                                                              disabled={loading}
                                                                                                              onChange={handleMainCategoryChangeEdit}
                                                                                                         >
                                                                                                              {mainCategoryOptions.map((option: any) => (
                                                                                                                   <MenuItem
                                                                                                                        key={option.value || '__empty'}
                                                                                                                        value={option.value}
                                                                                                                   >
                                                                                                                        {option.label}
                                                                                                                   </MenuItem>
                                                                                                              ))}
                                                                                                         </TextField>
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              value={currentProductObject?.mid_category || ''}
                                                                                                              fullWidth
                                                                                                              label="Srednja Kategorija"
                                                                                                              select
                                                                                                              disabled={loading || isMidDisabled}
                                                                                                              onChange={handleMidCategoryChangeEdit}
                                                                                                         >
                                                                                                              {midCategoryOptions.length > 0 ? (
                                                                                                                   midCategoryOptions.map((option: any) => (
                                                                                                                        <MenuItem
                                                                                                                             key={option.value || '__empty'}
                                                                                                                             value={option.value}
                                                                                                                        >
                                                                                                                             {option.label}
                                                                                                                        </MenuItem>
                                                                                                                   ))
                                                                                                              ) : (
                                                                                                                   <MenuItem disabled>Nema kategorija</MenuItem>
                                                                                                              )}
                                                                                                         </TextField>
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              value={currentProductObject?.sub_category || ''}
                                                                                                              fullWidth
                                                                                                              label="Podkategorija"
                                                                                                              select
                                                                                                              disabled={loading || isSubDisabled}
                                                                                                              onChange={handleSubCategoryChangeEdit}
                                                                                                         >
                                                                                                              {subCategoryOptions.length > 0 ? (
                                                                                                                   subCategoryOptions.map((option: any) => (
                                                                                                                        <MenuItem
                                                                                                                             key={option.value || '__empty'}
                                                                                                                             value={option.value}
                                                                                                                        >
                                                                                                                             {option.label}
                                                                                                                        </MenuItem>
                                                                                                                   ))
                                                                                                              ) : (
                                                                                                                   <MenuItem disabled>Nema kategorija</MenuItem>
                                                                                                              )}
                                                                                                         </TextField>
                                                                                                    </Grid>

                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              defaultValue={currentProductObject?.description}
                                                                                                              fullWidth
                                                                                                              label="Opis"
                                                                                                              disabled={loading}
                                                                                                              name="description"
                                                                                                              onBlur={(e: any) =>
                                                                                                                   setCurrentProductObject((previousObject: any) => ({
                                                                                                                        ...previousObject,
                                                                                                                        description: e.target.value

                                                                                                                   }))
                                                                                                              }
                                                                                                         />
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              defaultValue={currentProductObject?.instructions}
                                                                                                              fullWidth
                                                                                                              label="Instrukcije"
                                                                                                              disabled={loading}
                                                                                                              name="instructions"
                                                                                                              onBlur={(e: any) =>
                                                                                                                   setCurrentProductObject((previousObject: any) => ({
                                                                                                                        ...previousObject,
                                                                                                                        instructions: e.target.value

                                                                                                                   }))
                                                                                                              }
                                                                                                         />
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              defaultValue={currentProductObject?.warning}
                                                                                                              fullWidth
                                                                                                              label="Upozorenje"
                                                                                                              disabled={loading}
                                                                                                              name="warning"
                                                                                                              onBlur={(e: any) =>
                                                                                                                   setCurrentProductObject((previousObject: any) => ({
                                                                                                                        ...previousObject,
                                                                                                                        warning: e.target.value

                                                                                                                   }))
                                                                                                              }
                                                                                                         />
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              defaultValue={currentProductObject?.ingredients}
                                                                                                              fullWidth
                                                                                                              disabled={loading}
                                                                                                              label="Sastav"
                                                                                                              name="ingredients"
                                                                                                              onBlur={(e: any) =>
                                                                                                                   setCurrentProductObject((previousObject: any) => ({
                                                                                                                        ...previousObject,
                                                                                                                        ingredients: e.target.value

                                                                                                                   }))
                                                                                                              }
                                                                                                         />
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              defaultValue={currentProductObject?.promotion_text}
                                                                                                              fullWidth
                                                                                                              disabled={!currentProductObject?.promoting}
                                                                                                              label="Promo tekst"
                                                                                                              name="promotion_text"
                                                                                                              onBlur={(e: any) =>
                                                                                                                   setCurrentProductObject((previousObject: any) => ({
                                                                                                                        ...previousObject,
                                                                                                                        promotion_text: e.target.value

                                                                                                                   }))
                                                                                                              }
                                                                                                         />
                                                                                                    </Grid>
                                                                                               </Grid>
                                                                                          </Grid>
                                                                                          <Grid

                                                                                               size={{ md: 6, xs: 12 }}
                                                                                          >
                                                                                               <Typography variant="h6">Napredni podaci</Typography>
                                                                                               <Divider sx={{ my: 2 }} />
                                                                                               <Grid
                                                                                                    container
                                                                                                    spacing={3}
                                                                                               >
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              defaultValue={currentProductObject?.price}
                                                                                                              fullWidth
                                                                                                              disabled={loading}
                                                                                                              label="Nova cena"
                                                                                                              name="price"
                                                                                                              onBlur={(e: any) =>
                                                                                                                   setCurrentProductObject((previousObject: any) => ({
                                                                                                                        ...previousObject,
                                                                                                                        price: e.target.valueAsNumber

                                                                                                                   }))
                                                                                                              }
                                                                                                              InputProps={{
                                                                                                                   startAdornment: (
                                                                                                                        <InputAdornment position="start">RSD</InputAdornment>
                                                                                                                   ),
                                                                                                              }}
                                                                                                              type="number"
                                                                                                         />
                                                                                                    </Grid>

                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <Autocomplete
                                                                                                              fullWidth
                                                                                                              options={manufacturerOptions}
                                                                                                              value={getManufacturerOptionFromProduct(currentProductObject)}
                                                                                                              getOptionLabel={(option: any) => option?.label || ''}
                                                                                                              isOptionEqualToValue={(option: any, value: any) => {
                                                                                                                   const optionKeys = [
                                                                                                                        normalizeKey(option?.id),
                                                                                                                        normalizeKey(option?.value),
                                                                                                                        normalizeKey(option?.url),
                                                                                                                        normalizeKey(option?.label)
                                                                                                                   ].filter(Boolean);

                                                                                                                   const valueKeys = [
                                                                                                                        normalizeKey(value?.id),
                                                                                                                        normalizeKey(value?.value),
                                                                                                                        normalizeKey(value?.url),
                                                                                                                        normalizeKey(value?.label)
                                                                                                                   ].filter(Boolean);

                                                                                                                   return optionKeys.some((key: string) => valueKeys.includes(key));
                                                                                                              }}
                                                                                                              onChange={(event, newValue) => {
                                                                                                                   setCurrentProductObject((previousObject: any) => {
                                                                                                                        if (!previousObject) {
                                                                                                                             return previousObject;
                                                                                                                        }

                                                                                                                        return {
                                                                                                                             ...previousObject,
                                                                                                                             manufacturer: newValue?.label || '',
                                                                                                                             manufacturerURL: newValue?.value || '',
                                                                                                                             manufacturer_id: newValue?.id || newValue?.value || ''
                                                                                                                        };
                                                                                                                   });
                                                                                                              }}
                                                                                                              disabled={loading}
                                                                                                              ListboxProps={{
                                                                                                                   style: {
                                                                                                                        maxHeight: 48 * 10 + 16,
                                                                                                                        overflow: 'auto'
                                                                                                                   }
                                                                                                              }}
                                                                                                              renderInput={(params) => (
                                                                                                                   <TextField
                                                                                                                        {...params}
                                                                                                                        label="Proizvođač"
                                                                                                                        name="manufacturer"
                                                                                                                   />
                                                                                                              )}
                                                                                                         />
                                                                                                    </Grid>

                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              defaultValue={currentProductObject?.available_stock}
                                                                                                              fullWidth
                                                                                                              disabled={loading}
                                                                                                              label="Na stanju"
                                                                                                              name="available_stock"
                                                                                                              onBlur={(e: any) =>
                                                                                                                   setCurrentProductObject((previousObject: any) => ({
                                                                                                                        ...previousObject,
                                                                                                                        available_stock: e.target.valueAsNumber

                                                                                                                   }))
                                                                                                              }
                                                                                                              type="number"
                                                                                                         />
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              value={currentProductObject?.discount_amount ?? 0}
                                                                                                              fullWidth
                                                                                                              disabled={!currentProductObject?.discount}
                                                                                                              label="Iznos popusta"
                                                                                                              name="discount_amount"
                                                                                                              onChange={(e) => {
                                                                                                                   const min = 0;
                                                                                                                   const max = 100;
                                                                                                                   let value = parseInt(e.target.value, 10);

                                                                                                                   if (isNaN(value)) value = 0;
                                                                                                                   if (value > max) value = max;
                                                                                                                   if (value < min) value = min;

                                                                                                                   setCurrentProductObject((previousObject: any) => ({
                                                                                                                        ...previousObject,
                                                                                                                        discount_amount: value
                                                                                                                   }));
                                                                                                              }}
                                                                                                              type="number"
                                                                                                         />
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField

                                                                                                              defaultValue={currentProductObject?.quantity}
                                                                                                              type="number"
                                                                                                              fullWidth
                                                                                                              label="Količina"
                                                                                                              disabled={loading}
                                                                                                              onBlur={(e: any) =>
                                                                                                                   setCurrentProductObject((previousObject: any) => ({
                                                                                                                        ...previousObject,
                                                                                                                        quantity: e.target.value

                                                                                                                   }))
                                                                                                              }
                                                                                                         />
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                    >
                                                                                                         <TextField
                                                                                                              defaultValue={currentProductObject?.quantity_unit}
                                                                                                              select
                                                                                                              fullWidth
                                                                                                              label="Jedinica mere"
                                                                                                              disabled={loading}
                                                                                                              onBlur={(e: any) =>
                                                                                                                   setCurrentProductObject((previousObject: any) => ({
                                                                                                                        ...previousObject,
                                                                                                                        quantity_unit: e.target.value

                                                                                                                   }))
                                                                                                              }
                                                                                                         >
                                                                                                              {quantityUnitOptions.map((option: any) => (
                                                                                                                   <MenuItem
                                                                                                                        key={option.value}
                                                                                                                        value={option.value}
                                                                                                                   >
                                                                                                                        {option.label}
                                                                                                                   </MenuItem>
                                                                                                              ))}
                                                                                                         </TextField>
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                         sx={{
                                                                                                              alignItems: 'center',
                                                                                                              display: 'flex',
                                                                                                         }}
                                                                                                    >
                                                                                                         <Switch disabled={loading} checked={currentProductObject!.is_active}
                                                                                                              onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   is_active: !previousObject.is_active
                                                                                                              }))}
                                                                                                         />
                                                                                                         <Typography variant="subtitle2">
                                                                                                              Aktivan
                                                                                                         </Typography>
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                         sx={{
                                                                                                              alignItems: 'center',
                                                                                                              display: 'flex',
                                                                                                         }}
                                                                                                    >
                                                                                                         <Switch disabled={loading} checked={currentProductObject!.new_arrival}
                                                                                                              onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   new_arrival: !previousObject.new_arrival
                                                                                                              }))}
                                                                                                         />
                                                                                                         <Typography variant="subtitle2">
                                                                                                              Novi proizvod
                                                                                                         </Typography>
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                         sx={{
                                                                                                              alignItems: 'center',
                                                                                                              display: 'flex',
                                                                                                         }}
                                                                                                    >
                                                                                                         <Switch disabled={loading}
                                                                                                              checked={currentProductObject!.best_seller}
                                                                                                              onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   best_seller: !previousObject.best_seller

                                                                                                              }))}
                                                                                                         />
                                                                                                         <Typography variant="subtitle2">
                                                                                                              Najprodavaniji
                                                                                                         </Typography>
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                         sx={{
                                                                                                              alignItems: 'center',
                                                                                                              display: 'flex',
                                                                                                         }}
                                                                                                    >
                                                                                                         <Switch disabled={loading} checked={currentProductObject!.discount}
                                                                                                              onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   discount: !previousObject.discount,
                                                                                                                   discount_amount: !previousObject.discount ? previousObject.discount_amount : 0
                                                                                                              }))}
                                                                                                         />
                                                                                                         <Typography variant="subtitle2">
                                                                                                              Popust
                                                                                                         </Typography>
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                         sx={{
                                                                                                              alignItems: 'center',
                                                                                                              display: 'flex',
                                                                                                         }}
                                                                                                    >
                                                                                                         <Switch disabled={loading} checked={currentProductObject!.promoting}
                                                                                                              onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   promoting: !previousObject.promoting
                                                                                                              }))}
                                                                                                         />
                                                                                                         <Typography variant="subtitle2">
                                                                                                              Promocija
                                                                                                         </Typography>
                                                                                                    </Grid>
                                                                                                    <Grid
                                                                                                         size={{ md: 6, xs: 12 }}
                                                                                                         sx={{
                                                                                                              alignItems: 'center',
                                                                                                              display: 'flex',
                                                                                                         }}
                                                                                                    >
                                                                                                         <Switch disabled={loading}
                                                                                                              checked={!!currentProductObject?.display_on_home}
                                                                                                              onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   display_on_home: !previousObject.display_on_home
                                                                                                              }))}
                                                                                                         />
                                                                                                         <Typography variant="subtitle2">
                                                                                                              Na početnoj
                                                                                                         </Typography>
                                                                                                    </Grid>
                                                                                               </Grid>
                                                                                          </Grid>
                                                                                     </Grid>
                                                                                     <Card sx={{ width: { xs: '100%', md: '50%' }, marginTop: '20px' }}>
                                                                                          <CardContent>
                                                                                               <Box
                                                                                                    sx={{
                                                                                                         display: 'flex',
                                                                                                         flexDirection: 'column',
                                                                                                         alignItems: 'center',
                                                                                                         gap: '10px'
                                                                                                    }}
                                                                                               >
                                                                                                    {/* {
                                                                                                    currentProductObject?.imageURL ?
                                                                                                         <Image src={currentProductObject.imageURL}
                                                                                                              alt='sds'
                                                                                                              width={300}
                                                                                                              height={300}
                                                                                                              style={{
                                                                                                                   borderRadius: '10px',
                                                                                                                   cursor: 'pointer'
                                                                                                              }}
                                                                                                              onClick={() => handleFileRemove()}
                                                                                                         />
                                                                                                         :
                                                                                                         <InsertPhotoIcon
                                                                                                              color='primary'
                                                                                                              sx={{ width: '300px', height: '300px' }}
                                                                                                         />
                                                                                               }

                                                                                               <Button component="label"
                                                                                                    variant="contained"
                                                                                                    startIcon={<CloudUploadIcon />}
                                                                                                    sx={{
                                                                                                         maxWidth: '150px'
                                                                                                    }}

                                                                                               >
                                                                                                    Ucitaj sliku
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
                                                                                                         onInput={(e: any) => {

                                                                                                              const file = e.target.files[0]; // Get the first selected file
                                                                                                              if (file) {
                                                                                                                   const reader = new FileReader();
                                                                                                                   reader.onload = (e: any) => {
                                                                                                                        // setSelectedImage(e.target.result);
                                                                                                                        setCurrentProductObject((previousObject: any) => ({
                                                                                                                             ...previousObject,
                                                                                                                             imageURL: e.target.result

                                                                                                                        }))
                                                                                                                   }
                                                                                                                   reader.readAsDataURL(file);
                                                                                                              }
                                                                                                         }
                                                                                                         }
                                                                                                    />
                                                                                               </Button> */}

                                                                                                    {/* <UploadButton
                                                                                                    endpoint="imageUploader"
                                                                                                    onUploadProgress={() => setLoading(true)}
                                                                                                    onClientUploadComplete={(res) => {
                                                                                                         setFileURL(res[0].url)
                                                                                                         setLoading(false)
                                                                                                         setCurrentProductObject((previousObject: any) => ({
                                                                                                              ...previousObject,
                                                                                                              imageURL: res[0].url
                                                                                                         }))
                                                                                                         Swal.fire({
                                                                                                              icon: 'success',
                                                                                                              title: 'Jeeej',
                                                                                                              text: 'Slika je uspešno sačuvana! Nastavi sa izmenama i sačuvaj proizvod...',
                                                                                                         })
                                                                                                    }}
                                                                                                    onUploadError={(error) => {
                                                                                                         Swal.fire({
                                                                                                              icon: 'error',
                                                                                                              title: 'Neeee',
                                                                                                              text: 'Nešto je pošlo po zlu! Proveri format fajla koji upload-uješ!',
                                                                                                         })
                                                                                                    }}
                                                                                                    content={{
                                                                                                         button({ ready }: any) {
                                                                                                              if (ready) return <Typography sx={{ color: theme.palette.divider }}>Pronadji sliku...</Typography>;
                                                                                                              return "Priprema za upload...";
                                                                                                         },
                                                                                                         allowedContent({ ready, fileTypes }) {
                                                                                                              if (!ready) return "Proveravam tip datoteke...";
                                                                                                              if (loading) return "Upload slike u toku!";
                                                                                                              return `Tip datoteke: ${fileTypes.join(", ")}`;
                                                                                                         },
                                                                                                    }}
                                                                                                    appearance={{
                                                                                                         button({ ready }: any) {
                                                                                                              return {
                                                                                                                   fontSize: "1.6rem",
                                                                                                                   backgroundColor: theme.palette.primary.main,
                                                                                                                   color: "black",
                                                                                                                   ...(ready && { color: theme.palette.primary.main, }),
                                                                                                                   ...(loading && { color: theme.palette.primary.main, disabled: loading }),
                                                                                                                   borderRadius: "10px",
                                                                                                                   cursor: 'pointer'
                                                                                                              };
                                                                                                         },
                                                                                                         allowedContent: {
                                                                                                              color: theme.palette.primary.main,
                                                                                                         },
                                                                                                    }}
                                                                                               /> */}
                                                                                                    <Button component="label"
                                                                                                         variant="contained"
                                                                                                         startIcon={<CloudUploadIcon />}
                                                                                                         sx={{ maxWidth: '200px' }}
                                                                                                    >
                                                                                                         Učitaj sliku
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
                                                                                                              onChange={async (e: any) => await handleImageChange(e)}
                                                                                                         />
                                                                                                    </Button>
                                                                                                    {currentProductObject?.image_url?.length ? (
                                                                                                         <Image
                                                                                                              src={currentProductObject!.image_url}
                                                                                                              alt='Uploaded Image'
                                                                                                              width={300}
                                                                                                              height={300}
                                                                                                              style={{
                                                                                                                   borderRadius: '10px',
                                                                                                                   cursor: 'pointer'
                                                                                                              }}
                                                                                                              onClick={handleFileRemove}
                                                                                                         />
                                                                                                    ) : (
                                                                                                         <InsertPhotoIcon
                                                                                                              color='primary'
                                                                                                              sx={{ width: '300px', height: '300px' }}
                                                                                                         />
                                                                                                    )}

                                                                                               </Box>
                                                                                          </CardContent>
                                                                                     </Card>
                                                                                </CardContent>
                                                                                <Divider />
                                                                                <Stack
                                                                                     alignItems="center"
                                                                                     direction="row"
                                                                                     justifyContent="space-between"
                                                                                     sx={{ p: 2 }}
                                                                                >
                                                                                     <Stack
                                                                                          alignItems="center"
                                                                                          direction="row"
                                                                                          spacing={2}
                                                                                     >
                                                                                          <Button
                                                                                               onClick={handleProductUpdateClick}
                                                                                               type="submit"
                                                                                               variant="contained"
                                                                                               disabled={loading}
                                                                                          >
                                                                                               Izmeni
                                                                                          </Button>
                                                                                          <Button
                                                                                               color="inherit"
                                                                                               onClick={handleProductClose}
                                                                                               disabled={loading}
                                                                                          >
                                                                                               Odustani
                                                                                          </Button>
                                                                                     </Stack>
                                                                                     <div>
                                                                                          <Button
                                                                                               onClick={handleDeleteButtonClick}
                                                                                               color="error"
                                                                                               disabled={loading}
                                                                                          >
                                                                                               Obrisi proizvod
                                                                                          </Button>
                                                                                     </div>
                                                                                </Stack>
                                                                           </TableCell>
                                                                      </TableRow>
                                                                 )
                                                                 }
                                                            </Fragment>
                                                       );
                                                  })
                                                  :
                                                  <TableRow>
                                                       <TableCell colSpan={9} align="center">
                                                            Nije pronađen nijedan proizvod...
                                                       </TableCell>
                                                  </TableRow>
                                        }
                                   </TableBody>
                              </Table>
                         </Box>
                    </Box>
               </Card >
               <TablePagination
                    component="div"
                    count={filteredRows.length}
                    onPageChange={(event, newPage) => setInternalPage(newPage)}
                    onRowsPerPageChange={(event) => {
                         setInternalRowsPerPage(parseInt(event.target.value, 10));
                         setInternalPage(0);
                    }}
                    page={internalPage}
                    rowsPerPage={internalRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50, 100, 200]}
                    showFirstButton
                    showLastButton
                    labelRowsPerPage={'Broj po stranici.'}
               />

               {/* Activation Confirmation Dialog */}
               <Dialog open={activationDialogOpen} onClose={handleActivationCancel}>
                    <DialogTitle>Da li želiš da objaviš proizvod?</DialogTitle>
                    <DialogContent>
                         <Typography variant="body1">
                              Ovaj proizvod će postati vidljiv kupcima u online prodavnici odmah nakon objavljivanja.
                              Proverite da li su informacije, cena, slike i stanje na lageru spremni pre nego što nastavite.
                         </Typography>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={handleActivationCancel} variant="outlined">
                              Odustani
                         </Button>
                         <Button onClick={handleActivationConfirm} variant="contained">
                              Objavi proizvod
                         </Button>
                    </DialogActions>
               </Dialog>
          </>
     );
};

ProductsTable.propTypes = {
     count: PropTypes.number,
     items: PropTypes.array,
     onDeselectAll: PropTypes.func,
     onDeselectOne: PropTypes.func,
     onAddProductClick: PropTypes.func,
     onProductUpdated: PropTypes.func,
     onPageChange: PropTypes.func,
     onRowsPerPageChange: PropTypes.func,
     onSelectAll: PropTypes.func,
     onSelectOne: PropTypes.func,
     page: PropTypes.number,
     rowsPerPage: PropTypes.number,
     selected: PropTypes.array
};
