"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Autocomplete, TextField, Button, Checkbox, FormControlLabel, Box, MenuItem, Typography, useMediaQuery } from '@mui/material';
import { Form, Formik } from 'formik';
import { initialValues, newProductSchema, quantityUnitOptions } from './new-product-schema'
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'

import { Theme } from '@mui/material/styles';
import { ProductDraft } from '../../schemas/product';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface CategoryOption {
     id: string;
     label: string;
     value: string;
     main_category_id?: string;
     mid_category_id?: string;
}

export const AddProductForm = ({ onSubmitSuccess, onSubmitFail, manufacturers = [] }: any) => {

     const router = useRouter();
     const [fileURL, setFileURL] = useState("")
     const [loading, setLoading] = useState(false)
     const isScreentoMedium = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

     // ─── Category state from DB ─────────────────────────────────────────────────
     const [mainCategories, setMainCategories] = useState<CategoryOption[]>([]);
     const [midCategories, setMidCategories] = useState<CategoryOption[]>([]);
     const [subCategories, setSubCategories] = useState<CategoryOption[]>([]);
     const [categoriesLoading, setCategoriesLoading] = useState(true);

     const [selectedMainValue, setSelectedMainValue] = useState('');
     const [selectedMidValue, setSelectedMidValue] = useState('');

     // Fetch categories from DB on mount
     useEffect(() => {
          const fetchCategories = async () => {
               try {
                    setCategoriesLoading(true);
                    const res = await fetch('/api/categories');
                    if (!res.ok) return;
                    const json = await res.json();
                    setMainCategories(json.data.main ?? []);
                    setMidCategories(json.data.mid ?? []);
                    setSubCategories(json.data.sub ?? []);
               } catch {
                    // silent fail — dropdowns will be empty
               } finally {
                    setCategoriesLoading(false);
               }
          };
          fetchCategories();
     }, []);

     // ─── Filtered options based on parent selection ─────────────────────────────
     const mainOptions = useMemo(() => {
          return [{ id: '', label: 'Obriši polje', value: '' }, ...mainCategories];
     }, [mainCategories]);

     const filteredMidCategories = useMemo(() => {
          if (!selectedMainValue) return [];
          const selectedMain = mainCategories.find((c) => c.value === selectedMainValue);
          if (!selectedMain) return [];
          return midCategories.filter((m) => m.main_category_id === selectedMain.id);
     }, [midCategories, mainCategories, selectedMainValue]);

     const midOptions = useMemo(() => {
          if (filteredMidCategories.length === 0) return [];
          return [{ id: '', label: 'Obriši polje', value: '' }, ...filteredMidCategories];
     }, [filteredMidCategories]);

     const filteredSubCategories = useMemo(() => {
          if (!selectedMidValue) return [];
          const selectedMid = midCategories.find((c) => c.value === selectedMidValue);
          if (!selectedMid) return [];
          return subCategories.filter((s) => s.mid_category_id === selectedMid.id);
     }, [subCategories, midCategories, selectedMidValue]);

     const subOptions = useMemo(() => {
          if (filteredSubCategories.length === 0) return [];
          return [{ id: '', label: 'Obriši polje', value: '' }, ...filteredSubCategories];
     }, [filteredSubCategories]);

     // ─── Derived disabled states ────────────────────────────────────────────────
     const isMidDisabled = !selectedMainValue || filteredMidCategories.length === 0;
     const isSubDisabled = !selectedMidValue || filteredSubCategories.length === 0;

     // ─── Manufacturer options ───────────────────────────────────────────────────
     const manufacturerOptions = useMemo(() => {
          if (!Array.isArray(manufacturers)) {
               return [];
          }

          return manufacturers
               .map((manufacturer: any) => ({
                    id: manufacturer.id,
                    label: manufacturer.name || '',
               }))
               .filter((manufacturer: any) => manufacturer.id && manufacturer.label);
     }, [manufacturers]);

     // ─── Submit ─────────────────────────────────────────────────────────────────
     const handleSubmit = async (values: ProductDraft) => {
          setLoading(true);
          try {
               const responseValues = await fetch('/api/product-api', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': '*',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
                    },
                    body: JSON.stringify(values),
               });
               if (responseValues.ok) {

                    onSubmitSuccess();

                    Swal.fire({
                         icon: 'success',
                         title: 'Jeeej',
                         text: 'Artikl ubačen uspešno',
                    })
                    router.refresh()
               } else {
                    onSubmitFail()
                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Nešto ne valja :(',
                    })
               }

          } catch (err) {
               console.error(err);
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Nešto ne valja :(',
               })
          } finally {
               setLoading(false);
          }
     }

     return (
          <Box>
               <Formik
                    initialValues={initialValues}
                    onSubmit={(values) => {
                         handleSubmit(values)
                    }}
                    validationSchema={newProductSchema()}>
                    {
                         (formik) => (
                              <Form style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: loading ? .5 : 1, }}>
                                   <TextField
                                        label="Naziv"
                                        name="name"
                                        value={formik.values.name}
                                        disabled={loading}
                                        onChange={formik.handleChange}
                                        error={formik.touched.name && !!formik.errors.name}
                                        helperText={formik.touched.name && formik.errors.name}
                                   />
                                   <TextField
                                        label="Opis"
                                        name="description"
                                        multiline
                                        disabled={loading}
                                        rows={4}
                                        value={formik.values.description}
                                        onChange={formik.handleChange}
                                        error={formik.touched.description && !!formik.errors.description}
                                        helperText={formik.touched.description && formik.errors.description}
                                   />

                                   {/* ─── Main Category (from DB) ─────────────────────── */}
                                   <TextField
                                        fullWidth
                                        label="Glavna kategorija"
                                        name="main_category"
                                        onBlur={formik.handleBlur}
                                        disabled={loading || categoriesLoading}
                                        onChange={(event) => {
                                             const value = event.target.value;
                                             formik.handleChange(event);
                                             setSelectedMainValue(value);
                                             // Reset mid & sub when main changes
                                             setSelectedMidValue('');
                                             formik.setFieldValue('mid_category', '');
                                             formik.setFieldValue('sub_category', '');
                                        }}
                                        select
                                        error={formik.touched.main_category && !!formik.errors.main_category}
                                        helperText={formik.touched.main_category && formik.errors.main_category}
                                        value={formik.values.main_category}
                                   >
                                        {mainOptions.map((option) => (
                                             <MenuItem key={option.value || '__empty'} value={option.value}>
                                                  {option.label}
                                             </MenuItem>
                                        ))}
                                   </TextField>

                                   {/* ─── Mid Category (from DB, filtered by main) ────── */}
                                   <TextField
                                        fullWidth
                                        label="Srednja kategorija"
                                        name="mid_category"
                                        onBlur={formik.handleBlur}
                                        disabled={loading || isMidDisabled}
                                        onChange={(event) => {
                                             const value = event.target.value;
                                             formik.handleChange(event);
                                             setSelectedMidValue(value);
                                             // Reset sub when mid changes
                                             formik.setFieldValue('sub_category', '');
                                        }}
                                        select
                                        error={formik.touched.mid_category && !!formik.errors.mid_category}
                                        helperText={
                                             isMidDisabled && selectedMainValue
                                                  ? 'Nema srednjih kategorija za izabranu glavnu.'
                                                  : formik.touched.mid_category && formik.errors.mid_category
                                        }
                                        value={formik.values.mid_category}
                                   >
                                        {midOptions.length > 0 ? (
                                             midOptions.map((option) => (
                                                  <MenuItem key={option.value || '__empty'} value={option.value}>
                                                       {option.label}
                                                  </MenuItem>
                                             ))
                                        ) : (
                                             <MenuItem disabled>Nema kategorija</MenuItem>
                                        )}
                                   </TextField>

                                   {/* ─── Sub Category (from DB, filtered by mid) ─────── */}
                                   <TextField
                                        fullWidth
                                        label="Podkategorija"
                                        name="sub_category"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.sub_category && !!formik.errors.sub_category}
                                        helperText={
                                             isSubDisabled && selectedMidValue
                                                  ? 'Nema podkategorija za izabranu srednju.'
                                                  : formik.touched.sub_category && formik.errors.sub_category
                                        }
                                        value={formik.values.sub_category}
                                        disabled={loading || isSubDisabled}
                                   >
                                        {subOptions.length > 0 ? (
                                             subOptions.map((option) => (
                                                  <MenuItem key={option.value || '__empty'} value={option.value}>
                                                       {option.label}
                                                  </MenuItem>
                                             ))
                                        ) : (
                                             <MenuItem disabled>Nema kategorija</MenuItem>
                                        )}
                                   </TextField>

                                   <TextField
                                        label="Na stanju komada"
                                        name="available_stock"
                                        value={formik.values.available_stock}
                                        disabled={loading}
                                        onChange={formik.handleChange}
                                        error={formik.touched.available_stock && !!formik.errors.available_stock}
                                        helperText={formik.touched.available_stock && formik.errors.available_stock}
                                        type='number'
                                   />

                                   <TextField
                                        label="Sastojci"
                                        name="ingredients"
                                        value={formik.values.ingredients}
                                        onChange={formik.handleChange}
                                        disabled={loading}
                                        error={formik.touched.ingredients && !!formik.errors.ingredients}
                                        helperText={formik.touched.ingredients && formik.errors.ingredients}
                                   />

                                   <TextField
                                        label="Instrukcije"
                                        name="instructions"
                                        disabled={loading}
                                        value={formik.values.instructions}
                                        onChange={formik.handleChange}
                                        error={formik.touched.instructions && !!formik.errors.instructions}
                                        helperText={formik.touched.instructions && formik.errors.instructions}
                                   />

                                   <TextField
                                        label="Količina"
                                        name="quantity"
                                        disabled={loading}
                                        value={formik.values.quantity}
                                        onChange={formik.handleChange}
                                        error={formik.touched.quantity && !!formik.errors.quantity}
                                        helperText={formik.touched.quantity && formik.errors.quantity}
                                        type='number'
                                        inputProps={{ min: 1 }}
                                        onBlur={(e) => {
                                             const min = 1;
                                             const value = Number(e.target.value);
                                             if (value < min) {
                                                  formik.setFieldValue('quantity', min);
                                             } else {
                                                  formik.handleBlur(e);
                                             }
                                        }}
                                   />

                                   <TextField
                                        fullWidth
                                        label="Jedinica mere"
                                        name="quantity_unit"
                                        onBlur={formik.handleBlur}
                                        disabled={loading}
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.quantity_unit && !!formik.errors.quantity_unit}
                                        helperText={formik.touched.quantity_unit && formik.errors.quantity_unit}
                                        value={formik.values.quantity_unit}
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

                                   <Autocomplete
                                        fullWidth
                                        options={manufacturerOptions}
                                        value={
                                             manufacturerOptions.find(
                                                  (option: any) => option.id === formik.values.manufacturer_id
                                             ) || null
                                        }
                                        getOptionLabel={(option: any) => option.label}
                                        isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                                        onChange={(_, newValue: any) => {
                                             formik.setFieldValue(
                                                  'manufacturer_name',
                                                  newValue?.label || ''
                                             );

                                             formik.setFieldValue(
                                                  'manufacturer_id',
                                                  newValue?.id || null
                                             );
                                        }}
                                        onBlur={() => {
                                             formik.setFieldTouched('manufacturer_name', true);
                                        }}
                                        disabled={loading}
                                        ListboxProps={{
                                             style: {
                                                  maxHeight: 48 * 10 + 16,
                                                  overflow: 'auto',
                                             },
                                        }}
                                        renderInput={(params) => (
                                             <TextField
                                                  {...params}
                                                  label="Proizvođač"
                                                  name="manufacturer_name"
                                                  error={
                                                       formik.touched.manufacturer_name &&
                                                       Boolean(formik.errors.manufacturer_name)
                                                  }
                                                  helperText={
                                                       formik.touched.manufacturer_name &&
                                                       formik.errors.manufacturer_name
                                                  }
                                             />
                                        )}
                                   />

                                   <TextField
                                        label="Upozorenje"
                                        name="warning"
                                        disabled={loading}
                                        value={formik.values.warning}
                                        onChange={formik.handleChange}
                                        error={formik.touched.warning && !!formik.errors.warning}
                                        helperText={formik.touched.warning && formik.errors.warning}
                                   />

                                   <TextField
                                        label="Cena"
                                        name="price"
                                        type='number'
                                        value={formik.values.price}
                                        onChange={formik.handleChange}
                                        error={formik.touched.price && !!formik.errors.price}
                                        helperText={formik.touched.price && formik.errors.price}
                                        slotProps={{
                                             htmlInput: {
                                                  min: 1
                                             }
                                        }}
                                        onBlur={(e) => {
                                             const min = 1;
                                             const value = Number(e.target.value);
                                             if (value < min) {
                                                  formik.setFieldValue('price', min);
                                             } else {
                                                  formik.handleBlur(e);
                                             }
                                        }}
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="is_active"
                                                  checked={formik.values.is_active}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        disabled={loading}
                                        label="Aktivan"
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="display_on_home"
                                                  checked={formik.values.display_on_home}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        disabled={loading}
                                        label="Na početnoj"
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="new_arrival"
                                                  checked={formik.values.new_arrival}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        disabled={loading}
                                        label="Novi proizvod"
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="best_seller"
                                                  checked={formik.values.best_seller}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        disabled={loading}
                                        label="Najprodavaniji"
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="discount"
                                                  checked={formik.values.discount}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        disabled={loading}
                                        label="Popust"
                                   />

                                   <TextField
                                        label="Iznos popusta"
                                        type='number'
                                        name="discount_amount"
                                        value={formik.values.discount_amount}
                                        onChange={(e) => {
                                             const min = 0;
                                             const max = 100;
                                             var value = parseInt(e.target.value, 10);

                                             if (value > max) value = max;
                                             if (value < min) value = min;

                                             formik.setFieldValue('discount_amount', value);
                                        }}
                                        disabled={loading}
                                        InputProps={{ inputProps: { min: 0, max: 100 } }}
                                   />

                                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <Box sx={{ display: 'flex', gap: '10px', maxWidth: '300px', flexDirection: isScreentoMedium ? 'column' : 'row' }}>
                                             <Button
                                                  variant="contained"
                                                  color="primary"
                                                  onClick={() => onSubmitFail()}
                                                  disabled={loading}
                                             >
                                                  Odustani
                                             </Button>
                                             <Button
                                                  type="submit"
                                                  variant="contained"
                                                  color="primary"
                                                  disabled={Object.keys(formik.errors).length != 0 || loading}
                                                  onClick={() => {
                                                       formik.validateForm()
                                                  }}
                                             >
                                                  Dodaj proizvod
                                             </Button>
                                        </Box>
                                        {Object.keys(formik.errors).length > 0 && (
                                             <Box sx={{ mt: 1 }}>
                                                  {Object.values(formik.errors).map((error, index) => (
                                                       <Typography
                                                            key={index}
                                                            variant="caption"
                                                            color="error"
                                                            display="block"
                                                       >
                                                            {error as string}
                                                       </Typography>
                                                  ))}
                                             </Box>
                                        )}
                                   </Box>
                              </Form>
                         )
                    }
               </Formik >
          </Box >
     );
};
