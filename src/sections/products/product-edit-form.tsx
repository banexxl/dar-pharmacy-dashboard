'use client';

import { useEffect, useMemo, useState } from 'react';
import {
     Autocomplete, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
     Divider, Grid, Input, InputAdornment, MenuItem, Stack, Switch, TextField, Typography
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Image from 'next/image';
import Swal from 'sweetalert2';

import { newProductSchema, quantityUnitOptions } from './new-product-schema';
import { Product } from '../../schemas/product';

interface ProductEditFormProps {
     product: Product;
     manufacturers?: any[];
     onUpdated?: (updatedProduct: any) => void;
     onDeleted?: () => void;
     onCancel?: () => void;
     showCancelButton?: boolean;
     cancelLabel?: string;
}

export const ProductEditForm = ({
     product,
     manufacturers = [],
     onUpdated = () => { },
     onDeleted = () => { },
     onCancel = () => { },
     showCancelButton = true,
     cancelLabel = 'Odustani',
}: ProductEditFormProps) => {

     const [currentProductObject, setCurrentProductObject] = useState<Product | null>(null);
     const [loading, setLoading] = useState(false);
     const [activationDialogOpen, setActivationDialogOpen] = useState(false);

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

     const getManufacturerOptionFromProduct = (candidate?: Product | null) => {
          if (!candidate || !Array.isArray(manufacturerOptions)) {
               return null;
          }

          const productRecord = candidate as Record<string, any>;

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

     useEffect(() => {
          const selectedManufacturer = getManufacturerOptionFromProduct(product);

          setEditMainValue(product?.main_category || '');
          setEditMidValue(product?.mid_category || '');

          setCurrentProductObject({
               ...product,
               manufacturer: selectedManufacturer?.label || (product as any)?.manufacturer_name || product?.manufacturer_id || '',
               manufacturerURL: selectedManufacturer?.value || (product as any)?.manufacturer_value || product?.manufacturer_id || '',
               manufacturer_id: product?.manufacturer_id || selectedManufacturer?.id || selectedManufacturer?.value || '',
          } as Product);
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [product, manufacturerOptions]);

     const handleFileRemove = () => {
          setCurrentProductObject((previousObject: any) => ({
               ...previousObject,
               image_url: ""
          }));
     };

     const handleProductUpdateClick = async () => {
          const errors: string[] = [];

          try {
               await newProductSchema().validate(currentProductObject, { abortEarly: false });
          } catch (validationError: any) {
               if (validationError?.inner) {
                    validationError.inner.forEach((err: any) => {
                         if (err.message) errors.push(err.message);
                    });
               }
          }

          if (errors.length > 0) {
               Swal.fire({
                    icon: 'error',
                    title: 'Greške u validaciji',
                    html: `<ul style="text-align:left;margin:0;padding-left:20px;">${errors.map((e) => `<li>${e}</li>`).join('')}</ul>`,
               });
               return;
          }

          const wasInactive = product && !product.is_active;
          const isNowActive = currentProductObject?.is_active === true;

          if (wasInactive && isNowActive) {
               setActivationDialogOpen(true);
               return;
          }

          proceedWithUpdate();
     };

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
                    handleUpdateProduct(currentProductObject);
               }
          });
     };

     const handleActivationConfirm = () => {
          setActivationDialogOpen(false);
          proceedWithUpdate();
     };

     const handleActivationCancel = () => {
          setActivationDialogOpen(false);
          setCurrentProductObject((prev: any) => ({
               ...prev,
               is_active: false,
          }));
     };

     const handleUpdateProduct = async (updatedProductObject: any) => {
          try {
               const response = await fetch('/api/product-api', {
                    method: 'PUT',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': 'https://dar-pharmacy-dashboard.vercel.app/api/product-api, http://localhost:3000/api/product-api',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
                    },
                    body: JSON.stringify(updatedProductObject)
               });

               if (response.ok) {
                    const result = await response.json();
                    if (result?.data) {
                         const updatedProduct = result.data;
                         const matchedManufacturer = manufacturerOptions.find(
                              (m: any) => m.id === updatedProduct.manufacturer_id
                         );
                         if (matchedManufacturer) {
                              updatedProduct.manufacturer_name = matchedManufacturer.label;
                              updatedProduct.manufacturer_value = matchedManufacturer.value;
                              updatedProduct.manufacturer_url = matchedManufacturer.url;
                         }
                         onUpdated(updatedProduct);
                    }
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: 'Artikl izmenjen :)',
                    });
               } else {
                    await response.json();
                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Nešto ne valja :(',
                    });
               }
          } catch (err) {
               alert(err);
          }
     };

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
                    handleDeleteProduct();
               }
          });
     };

     const handleDeleteProduct = async () => {
          try {
               const response = await fetch('/api/product-api', {
                    method: 'DELETE',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': 'https://dar-pharmacy-dashboard.vercel.app/api/product-api, http://localhost:3000/api/product-api',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
                    },
                    body: JSON.stringify({ currentProductID: product.id, imageID: product.image_url }),
               });

               if (response.ok) {
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: 'Artikl obrisan!',
                    });
                    onDeleted();
               } else {
                    await response.json();
               }
          } catch (err) {
               alert(err);
          }
     };

     const handleImageChange = async (event: any) => {
          const selectedFile = event.target.files[0];

          if (!selectedFile) {
               return;
          }

          setLoading(true);

          const fileExtension = selectedFile.name.split('.')[1];
          const title = selectedFile.name.split('.')[0];
          const apiUrl = '/api/aws/aws-s3-image-storage';

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
                         });
                    } else {
                         Swal.fire({
                              title: 'OK',
                              text: "Uspešan upload slike!",
                              icon: 'success',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'OK',
                         });
                         const result = await response.json();
                         setLoading(false);
                         setCurrentProductObject((previousObject: any) => ({
                              ...previousObject,
                              image_url: result.imageUrl
                         }));
                    }
               };
          } catch (error) {
               console.error('Error uploading image:', error);
          } finally {
               setLoading(false);
          }
     };

     if (!currentProductObject) {
          return null;
     }

     return (
          <>
               <CardContent sx={{ width: { xs: 'calc(100vw - 64px)', md: 'auto' }, overflowX: 'hidden', boxSizing: 'border-box' }}>
                    <Grid container spacing={3}>
                         <Grid size={{ md: 6, xs: 12 }}>
                              <Typography variant="h6">Osnovni detalji</Typography>
                              <Divider sx={{ my: 2 }} />
                              <Grid container spacing={3}>
                                   <Grid size={{ md: 6, xs: 12 }}>
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
                                   <Grid size={{ md: 6, xs: 12 }}>
                                        <TextField
                                             defaultValue={currentProductObject?.id?.slice(-8)}
                                             disabled
                                             fullWidth
                                             label="Šifra proizvoda"
                                             name={currentProductObject?.id?.slice(-8)}
                                        />
                                   </Grid>
                                   <Grid size={{ md: 6, xs: 12 }}>
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
                                   <Grid size={{ md: 6, xs: 12 }}>
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
                                   <Grid size={{ md: 6, xs: 12 }}>
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

                                   <Grid size={{ md: 6, xs: 12 }}>
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
                                   <Grid size={{ md: 6, xs: 12 }}>
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
                                   <Grid size={{ md: 6, xs: 12 }}>
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
                                   <Grid size={{ md: 6, xs: 12 }}>
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
                                   <Grid size={{ md: 6, xs: 12 }}>
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
                         <Grid size={{ md: 6, xs: 12 }}>
                              <Typography variant="h6">Napredni podaci</Typography>
                              <Divider sx={{ my: 2 }} />
                              <Grid container spacing={3}>
                                   <Grid size={{ md: 6, xs: 12 }}>
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

                                   <Grid size={{ md: 6, xs: 12 }}>
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

                                   <Grid size={{ md: 6, xs: 12 }}>
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
                                   <Grid size={{ md: 6, xs: 12 }}>
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
                                   <Grid size={{ md: 6, xs: 12 }}>
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
                                   <Grid size={{ md: 6, xs: 12 }}>
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
                                   <Grid size={{ md: 6, xs: 12 }} sx={{ alignItems: 'center', display: 'flex' }}>
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
                                   <Grid size={{ md: 6, xs: 12 }} sx={{ alignItems: 'center', display: 'flex' }}>
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
                                   <Grid size={{ md: 6, xs: 12 }} sx={{ alignItems: 'center', display: 'flex' }}>
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
                                   <Grid size={{ md: 6, xs: 12 }} sx={{ alignItems: 'center', display: 'flex' }}>
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
                                   <Grid size={{ md: 6, xs: 12 }} sx={{ alignItems: 'center', display: 'flex' }}>
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
                                   <Grid size={{ md: 6, xs: 12 }} sx={{ alignItems: 'center', display: 'flex' }}>
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
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
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
                    <Stack alignItems="center" direction="row" spacing={2}>
                         <Button
                              onClick={handleProductUpdateClick}
                              type="submit"
                              variant="contained"
                              disabled={loading}
                         >
                              Izmeni
                         </Button>
                         {showCancelButton && (
                              <Button
                                   color="inherit"
                                   onClick={onCancel}
                                   disabled={loading}
                              >
                                   {cancelLabel}
                              </Button>
                         )}
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

               <ActivationConfirmationDialog
                    open={activationDialogOpen}
                    onCancel={handleActivationCancel}
                    onConfirm={handleActivationConfirm}
               />
          </>
     );
};

const ActivationConfirmationDialog = ({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) => {
     return (
          <Dialog open={open} onClose={onCancel}>
               <DialogTitle>Da li želiš da objaviš proizvod?</DialogTitle>
               <DialogContent>
                    <Typography variant="body1">
                         Ovaj proizvod će postati vidljiv kupcima u online prodavnici odmah nakon objavljivanja.
                         Proverite da li su informacije, cena, slike i stanje na lageru spremni pre nego što nastavite.
                    </Typography>
               </DialogContent>
               <DialogActions>
                    <Button onClick={onCancel} variant="outlined">
                         Odustani
                    </Button>
                    <Button onClick={onConfirm} variant="contained">
                         Objavi proizvod
                    </Button>
               </DialogActions>
          </Dialog>
     );
};
