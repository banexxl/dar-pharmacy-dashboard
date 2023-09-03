import React from 'react';
import { useFormik } from 'formik';
import { TextField, Button, Checkbox, FormControlLabel, Box } from '@mui/material';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import { newProductSchema } from './new-product-schema'

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

export const AddProductForm = () => {

          const handleSubmit = () => {

          }

          return (

                    <Formik initialValues={initialValues}
                              onSubmit={(values) => handleSubmit(values)}
                              validationSchema={newProductSchema()}>
                              {
                                        (formik) => (
                                                  <Form>

                                                            <TextField
                                                                      label="Name"
                                                                      name="name"
                                                                      value={formik.values.name}
                                                                      onChange={formik.handleChange}
                                                            />
                                                            <TextField
                                                                      label="Description"
                                                                      name="description"
                                                                      multiline
                                                                      rows={4}
                                                                      value={formik.values.description}
                                                                      onChange={formik.handleChange}
                                                            />

                                                            <TextField
                                                                      label="Main category"
                                                                      name="mainCategory"
                                                                      value={formik.values.mainCategory}
                                                                      onChange={formik.handleChange}
                                                            />

                                                            <TextField
                                                                      label="Mid category"
                                                                      name="midCategory"
                                                                      value={formik.values.midCategory}
                                                                      onChange={formik.handleChange}
                                                            />

                                                            <TextField
                                                                      label="Sub category"
                                                                      name="subCategory"
                                                                      value={formik.values.subCategory}
                                                                      onChange={formik.handleChange}
                                                            />

                                                            <TextField
                                                                      label="Available stock"
                                                                      name="availableStock"
                                                                      value={formik.values.availableStock}
                                                                      onChange={formik.handleChange}
                                                            />

                                                            <TextField
                                                                      label="Ingredients"
                                                                      name="ingredients"
                                                                      value={formik.values.ingredients}
                                                                      onChange={formik.handleChange}
                                                            />

                                                            <TextField
                                                                      label="Instructions"
                                                                      name="instructions"
                                                                      value={formik.values.instructions}
                                                                      onChange={formik.handleChange}
                                                            />

                                                            <TextField
                                                                      label="Quantity"
                                                                      name="quantity"
                                                                      value={formik.values.quantity}
                                                                      onChange={formik.handleChange}
                                                            />

                                                            <TextField
                                                                      label="Manufacturer"
                                                                      name="manufacturer"
                                                                      value={formik.values.manufacturer}
                                                                      onChange={formik.handleChange}
                                                            />

                                                            <TextField
                                                                      label="Warning"
                                                                      name="warning"
                                                                      value={formik.values.warning}
                                                                      onChange={formik.handleChange}
                                                            />

                                                            <TextField
                                                                      label="Image URL"
                                                                      name="imageURL"
                                                                      value={formik.values.imageURL}
                                                                      onChange={formik.handleChange}
                                                            />

                                                            <TextField
                                                                      label="Price"
                                                                      name="price"
                                                                      value={formik.values.price}
                                                                      onChange={formik.handleChange}
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

                                                            <Button type="submit"
                                                                      variant="contained"
                                                                      color="primary">
                                                                      Add Product
                                                            </Button>
                                                  </Form>
                                        )
                              }
                    </Formik>

          );
};