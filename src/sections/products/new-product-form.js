import React from 'react';
import { useFormik } from 'formik';
import { TextField, Button, Checkbox, FormControlLabel, Box, Typography, Card, CardContent, Grid, MenuItem, Stack } from '@mui/material';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import { newProductSchema } from './new-product-schema'
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'

const initialValues = {
          name: '',
          description: '',
          mainCategory: '',
          midCategory: '',
          subCategory: '',
          availableStock: '',
          ingredients: '',
          instructions: '',
          quantity: '',
          manufacturer: '',
          warning: '',
          imageURL: '',
          price: '',
          newArrival: false,
          bestSeller: false,
          discount: false,
          discountAmount: '',
};


const mainCategoryOptions = [
          {
                    label: 'Apoteka',
                    value: 'apoteka',
          },
          {
                    label: 'Prirodna kozmetika',
                    value: 'prirodna-kozmetika',
          },
];


const midCategoryOptions = [
          {
                    label: 'Alergije',
                    value: 'alergije',
          },
          {
                    label: 'Anemija',
                    value: 'anemija',
          },
          {
                    label: 'Antioksidansi i detoksikacija',
                    value: 'antioksidansi-i-detoksikacija',
          },
          {
                    label: 'Bol',
                    value: 'bol',
          },
          {
                    label: 'Bubrezi i mokraćni putevi',
                    value: 'bubrezi-i-mokracni-putevi',
          },
          {
                    label: 'Energija i umor',
                    value: 'energija-i-umor',
          },
          {
                    label: 'Hemoroidi',
                    value: 'hemoroidi',
          },
          {
                    label: 'Kosa, koža i nokti',
                    value: 'kosa-koza-i-nokti',
          },
          {
                    label: 'Sokovi',
                    value: 'sokovi',
          },
];


const subCategoryOptions = [
          {
                    label: 'Biljni preparati',
                    value: 'biljni-preparati',
          },
          {
                    label: 'Bolovi u zglobovima i mišićima',
                    value: 'bolovi-u-zglobovima-i-misicima',
          },
          {
                    label: 'Irigacioni set',
                    value: 'irigacioni-set',
          },
          {
                    label: 'Kapsule i tablete',
                    value: 'kapsule-i-tablete',
          },
];

const manufacturerOptions = [
          {
                    label: 'ALPENKRAUTER',
                    value: 'alpenkrauter',
          },
          {
                    label: 'Abela Pharm',
                    value: 'abela-pharm',
          },
          {
                    label: 'Alpen Pharma doo',
                    value: 'alpen-pharma-doo',
          },
          {
                    label: 'Amer',
                    value: 'amer',
          },
          {
                    label: 'Bach Flower Remedies',
                    value: 'bach-flower-remedies',
          },
          {
                    label: 'Bajkal',
                    value: 'bajkal',
          },
          {
                    label: 'Beopanax d.o.o.',
                    value: 'beopanax-doo',
          },
          {
                    label: 'Bio Solutions',
                    value: 'bio-solutions',
          },
          {
                    label: 'Catalysis S.L.',
                    value: 'catalysis-sl',
          },
          {
                    label: 'Colloid',
                    value: 'colloid',
          },
          {
                    label: 'Cortex Labs',
                    value: 'cortex-labs',
          },
          {
                    label: 'DMG',
                    value: 'dmg',
          },
          {
                    label: 'Dimas',
                    value: 'dimas',
          },
          {
                    label: 'Dr. Werner Pharma',
                    value: 'dr-werner-pharma',
          },
          {
                    label: 'Fantastik fungi',
                    value: 'fantastik-fungi',
          },
          {
                    label: 'Farma Derma',
                    value: 'farma-derma',
          },
          {
                    label: 'Farmas MN',
                    value: 'farmas-mn',
          },
          {
                    label: 'GRANUM',
                    value: 'granum',
          },
          {
                    label: 'Galenika',
                    value: 'galenika',
          },
          {
                    label: 'Gana kozmetika',
                    value: 'gana-kozmetika',
          },
          {
                    label: 'Gavez',
                    value: 'gavez',
          },
          {
                    label: 'Herbalab',
                    value: 'herbalab',
          },
          {
                    label: 'Himalaya',
                    value: 'himalaya',
          },
          {
                    label: 'Innventa pharm',
                    value: 'innventa-pharm',
          },
          {
                    label: 'LAMA',
                    value: 'lama',
          },
          {
                    label: 'LV-Pharm',
                    value: 'lv-pharm',
          },
          {
                    label: 'Laboratorie ACM, France',
                    value: 'laboratorie-acm-france',
          },
          {
                    label: 'Laboratories NATIVE, France',
                    value: 'laboratories-native-france',
          },
          {
                    label: 'Lander',
                    value: 'lander',
          },
          {
                    label: 'Magni Food',
                    value: 'magni-food',
          },
          {
                    label: 'Majana',
                    value: 'majana',
          },
          {
                    label: 'MaxMedica',
                    value: 'maxmedica',
          },
          {
                    label: 'Medical Plants',
                    value: 'medical-plants',
          },
          {
                    label: 'Moj caj',
                    value: 'moj-caj',
          },
          {
                    label: 'NEMET PALIC',
                    value: 'nemet-palic',
          },
          {
                    label: 'NTC Pharma',
                    value: 'ntc-pharma',
          },
          {
                    label: 'Natural Way',
                    value: 'natural-way',
          },
          {
                    label: 'NaturalWealth',
                    value: 'naturalwealth',
          },
          {
                    label: 'Now Foods',
                    value: 'now-foods',
          },
          {
                    label: 'OKP',
                    value: 'okp',
          },
          {
                    label: 'OlimpSport',
                    value: 'olimpsport',
          },
          {
                    label: 'Pharma Medica',
                    value: 'pharma-medica',
          },
          {
                    label: 'PharmaDevelopment',
                    value: 'pharmadevelopment',
          },
          {
                    label: 'Plantacare',
                    value: 'plantacare',
          },
          {
                    label: 'Priroda na dar',
                    value: 'priroda-na-dar',
          },
          {
                    label: 'RHINOSAN',
                    value: 'rhinosan',
          },
          {
                    label: 'RabenHorst',
                    value: 'rabenhorst',
          },
          {
                    label: 'Rulek',
                    value: 'rulek',
          },
          {
                    label: 'Ruska Biljna Apoteka Organic',
                    value: 'ruska-biljna-apoteka-organic',
          },
          {
                    label: 'Shulke',
                    value: 'shulke',
          },
          {
                    label: 'Sofija',
                    value: 'sofija',
          },
          {
                    label: 'VitalGrana',
                    value: 'vitalgrana',
          },
          {
                    label: 'Weleda',
                    value: 'weleda',
          },
          {
                    label: 'Zodeks caj',
                    value: 'zodeks-caj',
          },
];


export const AddProductForm = ({ onSubmitSuccess, onSubmitFail }) => {

          const router = useRouter();

          const handleSubmit = async (values, helpers) => {

                    try {
                              //API CALL

                              const response = await fetch('/api/product-api', {
                                        method: 'POST',
                                        headers: {
                                                  'Content-Type': 'application/json',
                                                  'Access-Control-Allow-Origin': '*',
                                                  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
                                        },
                                        body: JSON.stringify(values), // Convert your data to JSON
                              });

                              if (response.ok) {
                                        onSubmitSuccess();
                                        Swal.fire({
                                                  icon: 'success',
                                                  title: 'Success',
                                                  text: 'Product added!',
                                        })
                                        router.push('/products')
                              } else {
                                        onSubmitFail()
                                        const errorData = await response.json(); // Parse the error response
                                        console.error(errorData);
                                        Swal.fire({
                                                  icon: 'error',
                                                  title: 'Oops...',
                                                  text: 'Something went wrong!',
                                        })
                              }

                    } catch (err) {
                              console.error(err);
                              Swal.fire({
                                        icon: 'error',
                                        title: 'Oops...',
                                        text: 'Something went wrong!',
                                        footer: '<a href="">Why do I have this issue?</a>'
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
                                                            <Form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                                      <TextField
                                                                                label="Name"
                                                                                name="name"
                                                                                value={formik.values.name}
                                                                                onChange={formik.handleChange}
                                                                                error={formik.touched.name && !!formik.errors.name}
                                                                                helperText={formik.touched.name && formik.errors.name}
                                                                      />
                                                                      <TextField
                                                                                label="Description"
                                                                                name="description"
                                                                                multiline
                                                                                rows={4}
                                                                                value={formik.values.description}
                                                                                onChange={formik.handleChange}
                                                                                error={formik.touched.description && !!formik.errors.description}
                                                                                helperText={formik.touched.description && formik.errors.description}
                                                                      />

                                                                      <TextField
                                                                                fullWidth
                                                                                label="Main category"
                                                                                name="mainCategory"
                                                                                onBlur={formik.handleBlur}
                                                                                onChange={formik.handleChange}
                                                                                select
                                                                                error={formik.touched.mainCategory && !!formik.errors.mainCategory}
                                                                                helperText={formik.touched.mainCategory && formik.errors.mainCategory}
                                                                                value={formik.values.mainCategory}
                                                                      >
                                                                                {mainCategoryOptions.map((option) => (
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
                                                                                label="Mid category"
                                                                                name="midCategory"
                                                                                onBlur={formik.handleBlur}
                                                                                onChange={formik.handleChange}
                                                                                select
                                                                                error={formik.touched.midCategory && !!formik.errors.midCategory}
                                                                                helperText={formik.touched.midCategory && formik.errors.midCategory}
                                                                                value={formik.values.midCategory}
                                                                      >
                                                                                {midCategoryOptions.map((option) => (
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
                                                                                label="Sub category"
                                                                                name="subCategory"
                                                                                onBlur={formik.handleBlur}
                                                                                onChange={formik.handleChange}
                                                                                select
                                                                                error={formik.touched.subCategory && !!formik.errors.subCategory}
                                                                                helperText={formik.touched.subCategory && formik.errors.subCategory}
                                                                                value={formik.values.subCategory}
                                                                      >
                                                                                {subCategoryOptions.map((option) => (
                                                                                          <MenuItem
                                                                                                    key={option.value}
                                                                                                    value={option.value}
                                                                                          >
                                                                                                    {option.label}
                                                                                          </MenuItem>
                                                                                ))}
                                                                      </TextField>

                                                                      <TextField
                                                                                label="Available stock"
                                                                                name="availableStock"
                                                                                value={formik.values.availableStock}
                                                                                onChange={formik.handleChange}
                                                                                error={formik.touched.availableStock && !!formik.errors.availableStock}
                                                                                helperText={formik.touched.availableStock && formik.errors.availableStock}
                                                                      />

                                                                      <TextField
                                                                                label="Ingredients"
                                                                                name="ingredients"
                                                                                value={formik.values.ingredients}
                                                                                onChange={formik.handleChange}
                                                                                error={formik.touched.ingredients && !!formik.errors.ingredients}
                                                                                helperText={formik.touched.ingredients && formik.errors.ingredients}
                                                                      />

                                                                      <TextField
                                                                                label="Instructions"
                                                                                name="instructions"
                                                                                value={formik.values.instructions}
                                                                                onChange={formik.handleChange}
                                                                                error={formik.touched.instructions && !!formik.errors.instructions}
                                                                                helperText={formik.touched.instructions && formik.errors.instructions}
                                                                      />

                                                                      <TextField
                                                                                label="Quantity"
                                                                                name="quantity"
                                                                                value={formik.values.quantity}
                                                                                onChange={formik.handleChange}
                                                                                error={formik.touched.quantity && !!formik.errors.quantity}
                                                                                helperText={formik.touched.quantity && formik.errors.quantity}
                                                                      />

                                                                      <TextField
                                                                                fullWidth
                                                                                label="Manufacturer"
                                                                                name="manufacturer"
                                                                                onBlur={formik.handleBlur}
                                                                                onChange={formik.handleChange}
                                                                                select
                                                                                error={formik.touched.manufacturer && !!formik.errors.manufacturer}
                                                                                helperText={formik.touched.manufacturer && formik.errors.manufacturer}
                                                                                value={formik.values.manufacturer}
                                                                      >
                                                                                {manufacturerOptions.map((option) => (
                                                                                          <MenuItem
                                                                                                    key={option.value}
                                                                                                    value={option.value}
                                                                                          >
                                                                                                    {option.label}
                                                                                          </MenuItem>
                                                                                ))}
                                                                      </TextField>

                                                                      <TextField
                                                                                label="Warning"
                                                                                name="warning"
                                                                                value={formik.values.warning}
                                                                                onChange={formik.handleChange}
                                                                                error={formik.touched.warning && !!formik.errors.warning}
                                                                                helperText={formik.touched.warning && formik.errors.warning}
                                                                      />

                                                                      <TextField
                                                                                label="Image URL"
                                                                                name="imageURL"
                                                                                value={formik.values.imageURL}
                                                                                onChange={formik.handleChange}
                                                                                error={formik.touched.imageURL && !!formik.errors.imageURL}
                                                                                helperText={formik.touched.imageURL && formik.errors.imageURL}
                                                                      />

                                                                      <TextField
                                                                                label="Price"
                                                                                name="price"
                                                                                value={formik.values.price}
                                                                                onChange={formik.handleChange}
                                                                                error={formik.touched.price && !!formik.errors.price}
                                                                                helperText={formik.touched.price && formik.errors.price}
                                                                      />

                                                                      <FormControlLabel
                                                                                control={
                                                                                          <Checkbox
                                                                                                    name="newArrival"
                                                                                                    checked={formik.values.newArrival}
                                                                                                    onChange={formik.handleChange}
                                                                                          />
                                                                                }
                                                                                label="New Arrival"
                                                                      />

                                                                      <FormControlLabel
                                                                                control={
                                                                                          <Checkbox
                                                                                                    name="bestSeller"
                                                                                                    checked={formik.values.bestSeller}
                                                                                                    onChange={formik.handleChange}
                                                                                          />
                                                                                }
                                                                                label="Best Seller"
                                                                      />

                                                                      <FormControlLabel
                                                                                control={
                                                                                          <Checkbox
                                                                                                    name="discount"
                                                                                                    checked={formik.values.discount}
                                                                                                    onChange={formik.handleChange}
                                                                                          />
                                                                                }
                                                                                label="Discount"
                                                                      />

                                                                      <TextField
                                                                                label="Discount Amount"
                                                                                name="discountAmount"
                                                                                value={formik.values.discountAmount}
                                                                                onChange={formik.handleChange}
                                                                      />
                                                                      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                                                                <Button
                                                                                          variant="contained"
                                                                                          color="primary"
                                                                                          onClick={() => onSubmitFail()}
                                                                                >
                                                                                          Cancel
                                                                                </Button>
                                                                                <Button type="submit"
                                                                                          variant="contained"
                                                                                          color="primary"
                                                                                >
                                                                                          Add Product
                                                                                </Button>
                                                                      </Box>
                                                            </Form>
                                                  )
                                        }
                              </Formik >
                    </Box>
          );
};