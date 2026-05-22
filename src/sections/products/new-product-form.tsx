"use client"
import React, { useMemo, useState } from 'react';
import { Autocomplete, TextField, Button, Checkbox, FormControlLabel, Box, Grid, MenuItem, Stack, Container, IconButton, CardActionArea, colors, useMediaQuery } from '@mui/material';
import { Form, Formik } from 'formik';
import { initialValues, mainCategoryOptions, midCategoryOptions, newProductSchema, quantityUnitOptions } from './new-product-schema'
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'

import { Theme } from '@mui/material/styles';
import { IProduct } from './products-table';

export const fetchSubCategoryOptions = async (selectedMidCategory: any) => {

     switch (selectedMidCategory) {
          case 'alergije':
               return [
                    { option: 'kapsule-i-tablete', label: 'Kapsule i tablete' },
                    { option: 'sprejevi-za-nos', label: 'Sprejevi za nos' },
                    { option: 'irigacioni-set', label: 'Irigacioni set' },
                    { option: 'masti-gelovi', label: 'Masti i gelovi' }
               ];
          case 'anemija':
               return [
                    { value: 'folna-kiselina-i-vitamini', label: 'Folna kiselina i vitamini' },
                    { value: 'biljni-preparati', label: 'Biljni preparati' },
                    { value: 'preparati-gvozdja', label: 'Preparati gvožđa' }
               ];
          case 'bol':
               return [
                    { value: 'bol-u-grlu', label: 'Bol u grlu' },
                    { value: 'menstrualni-bolovi', label: 'Menstrualni bolovi' },
                    { value: 'bolovi-u-zglobovima-i-misicima', label: 'Bolovi u zglobovima i mišićima' }
               ];
          case 'hemoroidi':
               return [
                    { value: 'oralni-preparati', label: 'Oralni preparati' },
                    { value: 'lokalna-primena', label: 'Lokalna primena' },
                    { value: 'platforma', label: 'Platforma' }
               ];
          case 'holesterol-i-trigliceridi':
               return [
                    { value: 'omega-masne-kiseline', label: 'Omega masne kiseline' },
                    { value: 'ostalo', label: 'Ostalo' }
               ];
          case 'imunitet-prehlada':
               return [
                    { value: 'deca', label: 'Deca' },
                    { value: 'vitemini-i-minerali', label: 'Vitamini i minerali' },
                    { value: 'sprejevi-za-nos', label: 'Sprejevi za nos' },
                    { value: 'sprejevi-za-grlo', label: 'Sprejevi za grlo' },
                    { value: 'irigacioni-set', label: 'Irigacioni set' },
                    { value: 'masti-gelovi', label: 'Masti i gelovi' },
                    { value: 'biljne-kapi', label: 'Biljne kapi' },
                    { value: 'med-maticni-mlec-i-propolis', label: 'Med, matični mleč i propolis' },
                    { value: 'pastile-za-grlo', label: 'Pastile za grlo' },
                    { value: 'aloja-ehinacea-noni-aronija', label: 'Aloja, ehinacea, noni, aronija' },
                    { value: 'probiotici', label: 'Probiotici' },
                    { value: 'omega-masne-kiseline', label: 'Omega masne kiseline' },
                    { value: 'ostalo', label: 'Ostalo' }
               ];
          case 'kosa-koza-i-nokti':
               return [
                    { value: 'oralni-preparati', label: 'Oralni preparati' },
                    { value: 'lokalna-primena', label: 'Lokalna primena' }
               ];
          case 'kosti-i-zglobovi':
               return [
                    { value: 'oralni-preparati', label: 'Oralni preparati' },
                    { value: 'primena-na-kozi', label: 'Primena na koži' }
               ];
          case 'mrsavljenje-celulit':
               return [
                    { value: 'oralni-preparati', label: 'Oralni preparati' },
                    { value: 'primena-na-kozi', label: 'Primena na koži' }
               ];
          case 'posebna-ishrana':
               return [
                    { value: 'kase', label: 'Kase' },
                    { value: 'sejkovi', label: 'Sejkovi' },
                    { value: 'sportisti', label: 'Sportisti' },
                    { value: 'zasladjivaci', label: 'Zaslađivači' },
                    { value: 'bombone', label: 'Bombone' }
               ];
          case 'putna-apoteka':
               return [
                    { value: 'dehidratacija', label: 'Dehidratacija' },
                    { value: 'dijareja', label: 'Dijareja' },
                    { value: 'mucnina', label: 'Mučnina' },
                    { value: 'auto-apoteka', label: 'Auto-apoteka' }
               ];
          case 'stomacne-tegobe':
               return [
                    { value: 'nadutost-i-gasovi', label: 'Nadutost i gasovi' },
                    { value: 'zatvor', label: 'Zatvor' },
                    { value: 'dijareja', label: 'Dijareja' },
                    { value: 'iritabilni-kolon', label: 'Iritabilni kolon' },
                    { value: 'otezano-varenje-i-gorusica', label: 'Otežano varenje i gorušica' }
               ];
          case 'zdravo-srce-i-cirkulacija':
               return [
                    { value: 'oralni-preparati', label: 'Oralni preparati' },
                    { value: 'primena-na-kozi', label: 'Primena na koži' }
               ];
          case 'vitamini-i-minerali':
               return [
                    { value: 'vitamin-a', label: 'Vitamin A' },
                    { value: 'vitamin-b', label: 'Vitamin B' },
                    { value: 'vitamin-c', label: 'Vitamin C' },
                    { value: 'vitamin-d', label: 'Vitamin D' },
                    { value: 'vitamin-k', label: 'Vitamin K' },
                    { value: 'cink', label: 'Cink' },
                    { value: 'kalijum', label: 'Kalijum' },
                    { value: 'kalcijum', label: 'Kalcijum' },
                    { value: 'hrom', label: 'Hrom' },
                    { value: 'magnezijum', label: 'Magnezijum' },
                    { value: 'selen', label: 'Selen' },
                    { value: 'gvozdje', label: 'Gvožđe' },
                    { value: 'bakar', label: 'Bakar' },
                    { value: 'bor', label: 'Bor' },
                    { value: 'fluor', label: 'Fluor' },
                    { value: 'fosfor', label: 'Fosfor' },
                    { value: 'kompleksi-vitamina-i-minerala', label: 'Kompleksi vitamina i minerala' },
                    { value: 'riblja-ulja', label: 'Riblja ulja' },
                    { value: 'deca', label: 'Deca' },
                    { value: 'sportisiti', label: 'Sportisti' },
                    { value: 'trudnice', label: 'Trudnice' },
                    { value: 'stariji', label: 'Stariji' }
               ];
          case 'preparati-za-primenu-na-kozi':
               return [
                    { value: 'iritacije', label: 'Iritacije' },
                    { value: 'oziljci-i-strije', label: 'Ožiljci i strije' },
                    { value: 'hemoroidi', label: 'Hemoroidi' },
                    { value: 'problemi-sa-cirkulacijom', label: 'Problemi sa cirkulacijom' },
                    { value: 'intimna-nega', label: 'Intimna nega' },
                    { value: 'opekotine', label: 'Opekotine' },
                    { value: 'sportske-povrede', label: 'Sportske povrede' },
                    { value: 'reuma', label: 'Reuma' },
                    { value: 'antiseptici', label: 'Antiseptici' },
                    { value: 'gljivice', label: 'Gljivice' },
                    { value: 'rozacea', label: 'Rozacea' },
                    { value: 'vitiligo', label: 'Vitiligo' },
                    { value: 'boginje', label: 'Boginje' },
                    { value: 'herpes', label: 'Herpes' },
                    { value: 'seboreicni-dermatitis', label: 'Seboreični dermatitis' },
                    { value: 'zuljevi-kurje-oci-bradavice', label: 'Žuljevi, kurje oči, bradavice' },
                    { value: 'ekcem-psorijaza', label: 'Ekcem, psorijaza' },
                    { value: 'suva-atopijska-koza', label: 'Suva, atopijska koža' },
                    { value: 'lokalni-anestetici', label: 'Lokalni anestetici' },
                    { value: 'povrsinske-rane', label: 'Površinske rane' }
               ];
          case 'oci-i-usi':
               return [
                    { value: 'tablete-kapsule-rastvori', label: 'Tablete, kapsule, rastvori' },
                    { value: 'higijena-nega', label: 'Higijena i nega' },
                    { value: 'kapi', label: 'Kapi' },
                    { value: 'masti', label: 'Masti' },
                    { value: 'naocare', label: 'Naočare' },
                    { value: 'tecnosti-i-kutije-za-sociva', label: 'Tečnosti i kutije za sočiva' },
                    { value: 'cepovi-za-usi', label: 'Čepovi za uši' },
                    { value: 'sprejevi', label: 'Sprejevi' }
               ];
          case 'prva-pomoc':
               return [
               ];
          default:
               return [];
     }
};

export const AddProductForm = ({ onSubmitSuccess, onSubmitFail, manufacturers = [] }: any) => {

     const router = useRouter();
     //const [selectedFile, setSelectedFile] = useState(null);
     const [fileURL, setFileURL] = useState("")
     const [loading, setLoading] = useState(false)
     const [subCategoryOptions, setSubCategoryOptions] = useState<any>([]);
     const [isSubCategoryEnabled, setIsSubCategoryEnabled] = useState(false);
     const isScreentoMedium = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

     const handleMidCategoryChange = async (event: any) => {
          const selectedMidCategory = event.target.value;

          // Fetch subcategory options based on the selected midCategory
          const subCategories = await fetchSubCategoryOptions(selectedMidCategory);

          setSubCategoryOptions(subCategories);

          // Enable/disable subCategory field based on midCategory selection
          setIsSubCategoryEnabled(!!selectedMidCategory);

     };

     const manufacturerOptions = useMemo(() => {
          if (!Array.isArray(manufacturers)) {
               return [];
          }

          return manufacturers
               .map((item: any) => ({
                    label: item?.name || item?.label || '',
                    value: item?.value || ''
               }))
               .filter((option: any) => option.label);
     }, [manufacturers]);

     const handleSubmit = async (values: IProduct) => {
          try {
               const responseValues = await fetch('/api/product-api', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': '*',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
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
                    // const errorData = await response.json(); // Parse the error response
                    // console.error(errorData);
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

                                   <TextField
                                        fullWidth
                                        label="Glavna kategorija"
                                        name="mainCategory"
                                        onBlur={formik.handleBlur}
                                        disabled={loading}
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.mainCategory && !!formik.errors.mainCategory}
                                        helperText={formik.touched.mainCategory && formik.errors.mainCategory}
                                        value={formik.values.mainCategory}
                                   >
                                        {mainCategoryOptions.map((option: any) => (
                                             <MenuItem
                                                  key={option.value}
                                                  value={option.value}
                                             >
                                                  {option.label}
                                             </MenuItem>
                                        ))}
                                   </TextField>

                                   <TextField
                                        fullWidth
                                        label="Mid kategorija"
                                        name="midCategory"
                                        onBlur={formik.handleBlur}
                                        disabled={loading}
                                        onChange={(event) => {
                                             formik.handleChange(event); // Update formik values
                                             handleMidCategoryChange(event); // Call custom function to handle midCategory change
                                        }}
                                        select
                                        error={formik.touched.midCategory && !!formik.errors.midCategory}
                                        helperText={formik.touched.midCategory && formik.errors.midCategory}
                                        value={formik.values.midCategory}
                                   >
                                        {midCategoryOptions.map((option) => (
                                             <MenuItem key={option.value} value={option.value}>
                                                  {option.label}
                                             </MenuItem>
                                        ))}
                                   </TextField>

                                   <TextField
                                        fullWidth
                                        label="Sub kategorija"
                                        name="subCategory"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.subCategory && !!formik.errors.subCategory}
                                        helperText={formik.touched.subCategory && formik.errors.subCategory}
                                        value={formik.values.subCategory}
                                        disabled={!isSubCategoryEnabled || loading}
                                   >
                                        {subCategoryOptions ?
                                             subCategoryOptions.map((option: any) =>
                                             (
                                                  <MenuItem key={option.value} value={option.value}>
                                                       {option.label}
                                                  </MenuItem>
                                             ))
                                             :
                                             <MenuItem key={'no-category'}>
                                                  Nema sub kategorije
                                             </MenuItem>
                                        }
                                   </TextField>

                                   <TextField
                                        label="Na stanju komada"
                                        name="availableStock"
                                        value={formik.values.availableStock}
                                        disabled={loading}
                                        onChange={formik.handleChange}
                                        error={formik.touched.availableStock && !!formik.errors.availableStock}
                                        helperText={formik.touched.availableStock && formik.errors.availableStock}
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
                                        name="quantityUnit"
                                        onBlur={formik.handleBlur}
                                        disabled={loading}
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.quantityUnit && !!formik.errors.quantityUnit}
                                        helperText={formik.touched.quantityUnit && formik.errors.quantityUnit}
                                        value={formik.values.quantityUnit}
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
                                                  (option: any) => option.label === formik.values.manufacturer
                                             ) || null
                                        }
                                        getOptionLabel={(option: any) => option?.label || ''}
                                        isOptionEqualToValue={(option: any, value: any) => option?.value === value?.value}
                                        onChange={(event, newValue) => {
                                             formik.setFieldValue('manufacturer', newValue?.label || '');
                                             formik.setFieldValue('manufacturerURL', newValue?.value || '');
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
                                                  label="Proizvodjac"
                                                  name="manufacturer"
                                                  error={formik.touched.manufacturer && !!formik.errors.manufacturer}
                                                  helperText={formik.touched.manufacturer && formik.errors.manufacturer}
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
                                        inputProps={{ min: 1 }}
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
                                                  name="isActive"
                                                  checked={formik.values.isActive}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        disabled={loading}
                                        label="Aktivan"
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="displayOnHome"
                                                  checked={formik.values.displayOnHome}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        disabled={loading}
                                        label="Na početnoj"
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="newArrival"
                                                  checked={formik.values.newArrival}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        disabled={loading}
                                        label="Novi proizvod"
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="bestSeller"
                                                  checked={formik.values.bestSeller}
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
                                        name="discountAmount"
                                        value={formik.values.discountAmount}
                                        onChange={(e) => {
                                             const min = 0;
                                             const max = 100;
                                             var value = parseInt(e.target.value, 10);

                                             if (value > max) value = max;
                                             if (value < min) value = min;

                                             formik.setFieldValue('discountAmount', value);
                                        }}
                                        disabled={loading}
                                        InputProps={{ inputProps: { min: 0, max: 100 } }}
                                   />

                                   <Box sx={{ gap: '10px', display: 'flex', maxWidth: '300px', justifyContent: 'space-between', flexDirection: isScreentoMedium ? 'column' : 'row' }}>
                                        <Button
                                             variant="contained"
                                             color="primary"
                                             onClick={() => onSubmitFail()}
                                             disabled={loading}
                                        >
                                             Odustani
                                        </Button>
                                        <Button type="submit"
                                             variant="contained"
                                             color="primary"
                                             disabled={Object.keys(formik.errors).length != 0 && loading}
                                        >
                                             Dodaj proizvod
                                        </Button>
                                   </Box>
                              </Form>
                         )
                    }
               </Formik >
          </Box >
     );
};