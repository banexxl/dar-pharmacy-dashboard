import React, { useState } from 'react';
import { useFormik } from 'formik';
import { TextField, Typography, Button, Checkbox, FormControlLabel, Box, Input, Card, CardContent, Grid, MenuItem, Stack, Container, IconButton, CardActionArea } from '@mui/material';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { newProductSchema } from './new-product-schema'
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Image from 'next/image';

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
          discountAmount: 0,
};

export const mainCategoryOptions = [
          {
                    label: 'Obrisi polje',
                    value: '',
          },
          {
                    label: 'Apoteka',
                    value: 'apoteka',
          },
          {
                    label: 'Prirodna kozmetika',
                    value: 'prirodna-kozmetika',
          },
          {
                    label: 'Kolagen',
                    value: 'kolagen',
          },
          {
                    label: 'Bebi prirodna kozmetika',
                    value: 'bebi-prirodna-kozmetika',
          },
          {
                    label: 'Suplementi',
                    value: 'suplementi',
          },
          {
                    label: 'Ledene Kocke za imunitet',
                    value: 'ledene-kocke-za-imunitet',
          },
          {
                    label: 'Prirodni imunitet',
                    value: 'prirodni-imunitet',
          },
];

export const midCategoryOptions = [
          {
                    label: 'Obrisi polje',
                    value: '',
          },
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

export const subCategoryOptions = [
          {
                    label: 'Obrisi polje',
                    value: '',
          },
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

// const handleFileUpload = async (file) => {
//           return new Promise(async (resolve, reject) => {
//                     try {
//                               const formData = new FormData();
//                               formData.append('file', file);

//                               const response = await fetch('/api/image-api', {
//                                         method: 'POST',
//                                         body: formData,
//                               });

//                               if (!response.ok) {
//                                         throw new Error('Failed to upload file');
//                               }

//                               const data = await response.json();
//                               resolve(data);
//                     } catch (error) {
//                               reject(error);
//                     }
//           });
// };

export const AddProductForm = ({ onSubmitSuccess, onSubmitFail }) => {

          const router = useRouter();
          const [selectedFile, setSelectedFile] = useState(null);
          const [selectedImage, setSelectedImage] = useState(null);
          const [uploadState, setUploadState] = useState("initial");



          const handleResetClick = (event) => {
                    setSelectedImage(null);
                    setUploadState("initial");
          };

          const handleSubmit = async (values) => {

                    try {

                              // if (selectedFile) {
                              //           handleFileUpload(selectedFile)
                              //                     .then((data) => {
                              //                               console.log('File uploaded successfully:', data);
                              //                     })
                              //                     .catch((error) => {
                              //                               console.error('Error uploading file:', error);
                              //                     });
                              // }

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
                              })
                    }
          }

          const handleImageChange = (event) => {

          };

          const handleFileRemove = () => {
                    setSelectedImage(null);
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
                                                                      {/* <Typography>
                                                                                {`${ JSON.stringify(formik.errors) }`}
                                                                      </Typography> */}
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

                                                                      {/* <Container maxWidth="md"
                                                                                sx={{ mt: 1, borderRadius: '5px', height: '300px', border: '1px solid red' }}>
                                                                                <Stack >
                                                                                          <IconButton
                                                                                                    onClick={handleResetClick}
                                                                                                    color="primary"
                                                                                                    aria-label="upload picture"
                                                                                                    component="label"
                                                                                                    display="flex"

                                                                                          >
                                                                                                    <input hidden={true}
                                                                                                              accept="image/*"
                                                                                                              type="file"
                                                                                                              onChange={({ target }) => {
                                                                                                                        const file = target.files[0]
                                                                                                                        setSelectedImage(URL.createObjectURL(file))
                                                                                                                        setSelectedFile(file)
                                                                                                              }}
                                                                                                    />
                                                                                                    {
                                                                                                              selectedImage ?
                                                                                                                        <CardActionArea
                                                                                                                                  sx={{ border: '1px solid green', width: 'auto' }}>
                                                                                                                                  <Image
                                                                                                                                            src={selectedImage}
                                                                                                                                            width={150}
                                                                                                                                            height={200}
                                                                                                                                            alt="LOGO" />
                                                                                                                        </CardActionArea>
                                                                                                                        :
                                                                                                                        <PhotoCamera />
                                                                                                    }

                                                                                          </IconButton>

                                                                                </Stack>

                                                                      </Container> */}
                                                                      <Card>
                                                                                <CardContent>

                                                                                          <Box
                                                                                                    sx={{
                                                                                                              display: 'flex',
                                                                                                              flexDirection: 'column',
                                                                                                              alignItems: 'center',
                                                                                                              gap: '10px'
                                                                                                    }}
                                                                                          >

                                                                                                    {
                                                                                                              selectedImage ?
                                                                                                                        <Image src={selectedImage}
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
                                                                                                              Upload file
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
                                                                                                                        onInput={(e) => {
                                                                                                                                  const file = e.target.files[0]; // Get the first selected file
                                                                                                                                  if (file) {
                                                                                                                                            const reader = new FileReader();
                                                                                                                                            reader.onload = (e) => {
                                                                                                                                                      setSelectedImage(e.target.result);
                                                                                                                                                      formik.setFieldValue('imageURL', e.target.result)
                                                                                                                                            };

                                                                                                                                            reader.readAsDataURL(file);
                                                                                                                                  }
                                                                                                                        }
                                                                                                                        }
                                                                                                              />
                                                                                                    </Button>

                                                                                          </Box>
                                                                                </CardContent>
                                                                      </Card>
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
                                                                                          disabled={Object.keys(formik.errors).length != 0}
                                                                                >
                                                                                          Add Product
                                                                                </Button>
                                                                      </Box>
                                                            </Form>
                                                  )
                                        }
                              </Formik >
                    </Box >
          );
};