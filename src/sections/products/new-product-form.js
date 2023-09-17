import React from 'react';
import { useFormik } from 'formik';
import { TextField, Button, Checkbox, FormControlLabel, Box, Typography } from '@mui/material';
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

                                                                      <Typography>
                                                                                {
                                                                                          formik.dirty
                                                                                }
                                                                      </Typography>

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
                                                                                label="Main category"
                                                                                name="mainCategory"
                                                                                value={formik.values.mainCategory}
                                                                                onChange={formik.handleChange}
                                                                                error={formik.touched.mainCategory && !!formik.errors.mainCategory}
                                                                                helperText={formik.touched.mainCategory && formik.errors.mainCategory}
                                                                      />

                                                                      <TextField
                                                                                label="Mid category"
                                                                                name="midCategory"
                                                                                value={formik.values.midCategory}
                                                                                onChange={formik.handleChange}
                                                                      // error={formik.touched.midCategory && !!formik.errors.midCategory}
                                                                      // helperText={formik.touched.midCategory && formik.errors.midCategory}
                                                                      />

                                                                      <TextField
                                                                                label="Sub category"
                                                                                name="subCategory"
                                                                                value={formik.values.subCategory}
                                                                                onChange={formik.handleChange}
                                                                      // error={formik.touched.subCategory && !!formik.errors.subCategory}
                                                                      // helperText={formik.touched.subCategory && formik.errors.subCategory}
                                                                      />

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
                                                                                label="Manufacturer"
                                                                                name="manufacturer"
                                                                                value={formik.values.manufacturer}
                                                                                onChange={formik.handleChange}
                                                                                error={formik.touched.manufacturer && !!formik.errors.manufacturer}
                                                                                helperText={formik.touched.manufacturer && formik.errors.manufacturer}
                                                                      />

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