import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import {
     Avatar, Box, Button, Card, CardContent, Checkbox, Divider, Grid, IconButton, Input, InputAdornment, LinearProgress, MenuItem,
     Stack, SvgIcon, Switch, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography, useTheme
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Image from 'next/image';
import numeral from 'numeral';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from '@/components/severity-pill';
import { fetchSubCategoryOptions } from './new-product-form';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import "@uploadthing/react/styles.css";
import { UploadButton } from "../../utils/image-upload-components";
import { mainCategoryOptions, manufacturerOptions, midCategoryOptions, quantityUnitOptions } from './new-product-schema';

export interface IProduct {
     bestSeller: boolean;
     description: string;
     discount: boolean;
     discountAmount: number;
     availableStock: number;
     imageURL: string;
     ingredients: string;
     instructions: string;
     mainCategory: string;
     manufacturer: string;
     manufacturerURL: string;
     midCategory: string;
     name: string;
     newArrival: boolean;
     isActive: boolean;
     price: string;
     quantity: number;
     quantityUnit: string;
     subCategory: string;
     warning: string;
     _id?: string;
}

export const ProductsTable = ({ items, page, rowsPerPage, }: any) => {

     const [currentProductID, setCurrentProductID] = useState(null);
     const [currentProductObject, setCurrentProductObject] = useState<IProduct | null>();
     const router = useRouter();
     const theme = useTheme()
     const [fileURL, setFileURL] = useState("")
     const [loading, setLoading] = useState(false)
     const [subCategoryOptions, setSubCategoryOptions] = useState<any>([]);
     const [isSubCategoryEnabled, setIsSubCategoryEnabled] = useState(false);
     const [selectedMidCategory, setSelectedMidCategory] = useState('');
     const [selectedImage, setSelectedImage] = useState(null);
     const [discountValue, setDiscountValue] = useState<number>(0);

     const getObjectById = (_id: any, arrayToSearch: any) => {
          for (const obj of arrayToSearch) {
               if (obj._id === _id) {
                    return obj;  // Found the object with the desired ID
               }
          }
          return null;  // Object with the desired ID not found
     }

     const handleProductToggle = (productId: any) => {
          setCurrentProductID((prevProductId: any) => {
               if (prevProductId === productId) {
                    setCurrentProductObject(null)
                    return null;
               } ``
               setCurrentProductObject(getObjectById(productId, items))
               return productId;
          });
     }

     const handleFileRemove = () => {
          setCurrentProductObject((previousObject: any) => ({
               ...previousObject,
               imageURL: ""
          }))
     }

     const handleProductClose = () => {
          setCurrentProductID(null);
     }

     const handleProductUpdateClick = () => {

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
                    handleProductClose()
                    setCurrentProductObject(null)
                    Swal.fire({
                         icon: 'success',
                         title: 'Sve OK!',
                         text: 'Artikl izmenjen :)',
                    })
                    router.refresh()
               } else {
                    const errorData = await response.json(); // Parse the error response
               }

          } catch (err) {
               alert(err);
          }
     }

     const handleMidCategoryChange = async (event: any) => {
          const selectedMidCategory = event.target.value;
          setSelectedMidCategory(selectedMidCategory);

          // Fetch subcategory options based on the selected midCategory
          const subCategories = await fetchSubCategoryOptions(selectedMidCategory);
          setSubCategoryOptions(subCategories);

          // Enable/disable subCategory field based on midCategory selection
          setIsSubCategoryEnabled(!!selectedMidCategory);


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
                    body: JSON.stringify({ currentProductID: currentProductID, imageID: currentProductObject.imageURL }), // Convert your data to JSON
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

     return (
          <Card>
               <Scrollbar>
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
                                   </TableRow>
                              </TableHead>
                              <TableBody>
                                   {
                                        items.length > 0 ?
                                             items.map((product: IProduct) => {
                                                  //const isSelected = selected.includes(product._id);
                                                  const isCurrent = product._id === currentProductID;
                                                  // const price = numeral(product.price).format(`${product.currency}0,0.00`);
                                                  const quantityColor = product.quantity >= 10 ? 'success' : 'error';
                                                  const statusColor = product.isActive === true ? 'success' : 'info';
                                                  // const hasManyVariants = product.variants > 1;

                                                  return (
                                                       <Fragment key={product._id}>
                                                            <TableRow
                                                                 hover
                                                                 key={product._id}
                                                            >
                                                                 <TableCell
                                                                      key={product._id}
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
                                                                      <IconButton key={product._id} onClick={() => handleProductToggle(product._id)}>
                                                                           <SvgIcon key={product._id}>{isCurrent ? <ChevronDownIcon key={product._id} /> : <ChevronRightIcon key={product._id} />}</SvgIcon >
                                                                      </IconButton>
                                                                 </TableCell>
                                                                 <TableCell width="25%" key={product._id}>
                                                                      <Box key={product._id}
                                                                           sx={{
                                                                                alignItems: 'center',
                                                                                display: 'flex',
                                                                           }}
                                                                      >
                                                                           {product.imageURL ? (
                                                                                <Box
                                                                                     key={product._id}
                                                                                     sx={{
                                                                                          alignItems: 'center',
                                                                                          backgroundColor: 'neutral.50',
                                                                                          backgroundImage: `url(${product.imageURL})`,
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
                                                                                     key={product._id}
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
                                                                                     <SvgIcon key={product._id} >

                                                                                     </SvgIcon>
                                                                                </Box>
                                                                           )}
                                                                           <Box
                                                                                key={product._id}
                                                                                sx={{
                                                                                     cursor: 'pointer',
                                                                                     ml: 2,
                                                                                }}
                                                                           >
                                                                                <Typography key={product._id} variant="subtitle2">{product.name}</Typography>
                                                                                <Typography
                                                                                     key={product._id}
                                                                                     color="text.secondary"
                                                                                     variant="body2"
                                                                                >
                                                                                     in {product.mainCategory}
                                                                                </Typography>
                                                                           </Box>
                                                                      </Box>
                                                                 </TableCell>
                                                                 <TableCell width="25%" key={product._id}>
                                                                      <LinearProgress
                                                                           key={product._id}
                                                                           value={product.quantity}
                                                                           variant="determinate"
                                                                           color={quantityColor}
                                                                           sx={{
                                                                                height: 8,
                                                                                width: 40,
                                                                           }}
                                                                      />
                                                                      <Typography
                                                                           key={product._id}
                                                                           color="text.secondary"
                                                                           variant="body2"
                                                                      >
                                                                           {product.availableStock} in stock
                                                                           {/* {hasManyVariants && ` in ${product.variants} variants`} */}
                                                                      </Typography>
                                                                 </TableCell>
                                                                 <TableCell key={product._id}>{product.price}</TableCell>
                                                                 <TableCell key={product._id}>{product._id!.slice(-8)}</TableCell>
                                                                 <TableCell key={product._id}>
                                                                      <SeverityPill key={product._id} color={statusColor}>{product.discount.toString()}</SeverityPill>
                                                                 </TableCell>
                                                                 <TableCell key={product._id}>
                                                                      <SeverityPill key={product._id} color={statusColor}>{product.discountAmount}</SeverityPill>
                                                                 </TableCell>
                                                            </TableRow>
                                                            {isCurrent && (
                                                                 <TableRow key={product._id}>
                                                                      <TableCell
                                                                           key={product._id}
                                                                           colSpan={7}
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
                                                                           <CardContent key={product._id}>
                                                                                <Grid key={product._id}
                                                                                     container
                                                                                     spacing={3}
                                                                                >
                                                                                     <Grid key={product._id}
                                                                                          item
                                                                                          md={6}
                                                                                          xs={12}
                                                                                     >
                                                                                          <Typography key={product._id} variant="h6">Osnovni detalji</Typography>
                                                                                          <Divider key={product._id} sx={{ my: 2 }} />
                                                                                          <Grid key={product._id}
                                                                                               container
                                                                                               spacing={3}
                                                                                          >
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.name}
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
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product._id!.slice(-8)}
                                                                                                         disabled
                                                                                                         fullWidth
                                                                                                         label="Šifra proizvoda"
                                                                                                         name={product._id!.slice(-8)}
                                                                                                    />
                                                                                               </Grid>
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.mainCategory}
                                                                                                         fullWidth
                                                                                                         label="Glavna Kategorija"
                                                                                                         select
                                                                                                         disabled={loading}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   mainCategory: e.target.value
                                                                                                              }))
                                                                                                         }
                                                                                                    >
                                                                                                         {mainCategoryOptions.map((option: any) => (
                                                                                                              <MenuItem
                                                                                                                   key={product._id}
                                                                                                                   value={option.value}
                                                                                                              >
                                                                                                                   {option.label}
                                                                                                              </MenuItem>
                                                                                                         ))}
                                                                                                    </TextField>
                                                                                               </Grid>
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.midCategory}
                                                                                                         fullWidth
                                                                                                         label="Mid Kategorija"
                                                                                                         select
                                                                                                         disabled={loading}
                                                                                                         onChange={(e) => handleMidCategoryChange(e)}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   midCategory: e.target.value

                                                                                                              }))
                                                                                                         }
                                                                                                    >
                                                                                                         {midCategoryOptions.map((option: any) => (
                                                                                                              <MenuItem
                                                                                                                   key={product._id}
                                                                                                                   value={option.value}
                                                                                                              >
                                                                                                                   {option.label}
                                                                                                              </MenuItem>
                                                                                                         ))}
                                                                                                    </TextField>
                                                                                               </Grid>
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.subCategory}
                                                                                                         fullWidth
                                                                                                         label="Sub Kategorija"
                                                                                                         select
                                                                                                         disabled={!isSubCategoryEnabled || loading}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   subCategory: e.target.value

                                                                                                              }))
                                                                                                         }
                                                                                                    >
                                                                                                         {subCategoryOptions.map((option: any) => (
                                                                                                              <MenuItem
                                                                                                                   key={product._id}
                                                                                                                   value={option.value}
                                                                                                              >
                                                                                                                   {option.label}
                                                                                                              </MenuItem>
                                                                                                         ))}
                                                                                                    </TextField>
                                                                                               </Grid>

                                                                                               <Grid
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.description}
                                                                                                         fullWidth
                                                                                                         label="Opis"
                                                                                                         disabled={loading}
                                                                                                         name={product.description}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   description: e.target.value

                                                                                                              }))
                                                                                                         }
                                                                                                    />
                                                                                               </Grid>
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.instructions}
                                                                                                         fullWidth
                                                                                                         label="Instrukcije"
                                                                                                         disabled={loading}
                                                                                                         name={product.instructions}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   instructions: e.target.value

                                                                                                              }))
                                                                                                         }
                                                                                                    />
                                                                                               </Grid>
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.warning}
                                                                                                         fullWidth
                                                                                                         label="Upozorenje"
                                                                                                         disabled={loading}
                                                                                                         name={product.warning}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   warning: e.target.value

                                                                                                              }))
                                                                                                         }
                                                                                                    />
                                                                                               </Grid>
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.ingredients}
                                                                                                         fullWidth
                                                                                                         disabled={loading}
                                                                                                         label="Sastav"
                                                                                                         name={product.ingredients}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   ingredients: e.target.value

                                                                                                              }))
                                                                                                         }
                                                                                                    />
                                                                                               </Grid>
                                                                                          </Grid>
                                                                                     </Grid>
                                                                                     <Grid key={product._id}
                                                                                          item
                                                                                          md={6}
                                                                                          xs={12}
                                                                                     >
                                                                                          <Typography key={product._id} variant="h6">Napredni podaci</Typography>
                                                                                          <Divider key={product._id} sx={{ my: 2 }} />
                                                                                          <Grid key={product._id}
                                                                                               container
                                                                                               spacing={3}
                                                                                          >
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.price}
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
                                                                                                                   <InputAdornment key={product._id} position="start">RSD</InputAdornment>
                                                                                                              ),
                                                                                                         }}
                                                                                                         type="number"
                                                                                                    />
                                                                                               </Grid>

                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField
                                                                                                         fullWidth
                                                                                                         label="Proizvođač"
                                                                                                         name="manufacturer"
                                                                                                         disabled={loading}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   manufacturer: e.target.value,
                                                                                                                   manufacturerURL: manufacturerOptions.find((option) => option.label === e.target.value)?.value
                                                                                                              }))
                                                                                                         }
                                                                                                         select
                                                                                                         defaultValue={product.manufacturer}
                                                                                                    >
                                                                                                         {manufacturerOptions.map((option: any) => (
                                                                                                              <MenuItem
                                                                                                                   key={option.value}
                                                                                                                   value={option.label}
                                                                                                              >
                                                                                                                   {option.label}
                                                                                                              </MenuItem>
                                                                                                         ))}
                                                                                                    </TextField>
                                                                                               </Grid>

                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.availableStock}
                                                                                                         fullWidth
                                                                                                         disabled={loading}
                                                                                                         label="Na stanju"
                                                                                                         name="availableStock"
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   availableStock: e.target.valueAsNumber

                                                                                                              }))
                                                                                                         }
                                                                                                         type="number"
                                                                                                    />
                                                                                               </Grid>
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.discountAmount}
                                                                                                         fullWidth
                                                                                                         disabled={loading}
                                                                                                         label="Iznos popusta"
                                                                                                         name="discountAmount"
                                                                                                         onChange={(e) => {
                                                                                                              const min = 0;
                                                                                                              const max = 100;
                                                                                                              var value = parseInt(e.target.value, 10);

                                                                                                              if (value > max) value = max;
                                                                                                              if (value < min) value = min;

                                                                                                              setDiscountValue(value);

                                                                                                              setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   discountAmount: value
                                                                                                              }))

                                                                                                         }}
                                                                                                         type="number"
                                                                                                    />
                                                                                               </Grid>
                                                                                               <Grid
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.quantity}
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
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={product._id}
                                                                                                         defaultValue={product.quantityUnit}
                                                                                                         select
                                                                                                         fullWidth
                                                                                                         label="Jedinica mere"
                                                                                                         disabled={loading}
                                                                                                         onBlur={(e: any) =>
                                                                                                              setCurrentProductObject((previousObject: any) => ({
                                                                                                                   ...previousObject,
                                                                                                                   quantityUnit: e.target.value

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
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                                    sx={{
                                                                                                         alignItems: 'center',
                                                                                                         display: 'flex',
                                                                                                    }}
                                                                                               >
                                                                                                    <Switch key={product._id} disabled={loading} checked={currentProductObject!.isActive}
                                                                                                         onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                              ...previousObject,
                                                                                                              isActive: !previousObject.isActive
                                                                                                         }))}
                                                                                                    />
                                                                                                    <Typography key={product._id} variant="subtitle2">
                                                                                                         Aktivan
                                                                                                    </Typography>
                                                                                               </Grid>
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                                    sx={{
                                                                                                         alignItems: 'center',
                                                                                                         display: 'flex',
                                                                                                    }}
                                                                                               >
                                                                                                    <Switch key={product._id} disabled={loading} checked={currentProductObject!.newArrival}
                                                                                                         onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                              ...previousObject,
                                                                                                              newArrival: !previousObject.newArrival
                                                                                                         }))}
                                                                                                    />
                                                                                                    <Typography key={product._id} variant="subtitle2">
                                                                                                         Novi proizvod
                                                                                                    </Typography>
                                                                                               </Grid>
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                                    sx={{
                                                                                                         alignItems: 'center',
                                                                                                         display: 'flex',
                                                                                                    }}
                                                                                               >
                                                                                                    <Switch key={product._id} disabled={loading}
                                                                                                         checked={currentProductObject!.bestSeller}
                                                                                                         onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                              ...previousObject,
                                                                                                              bestSeller: !previousObject.bestSeller

                                                                                                         }))}
                                                                                                    />
                                                                                                    <Typography key={product._id} variant="subtitle2">
                                                                                                         Najprodavaniji
                                                                                                    </Typography>
                                                                                               </Grid>
                                                                                               <Grid key={product._id}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                                    sx={{
                                                                                                         alignItems: 'center',
                                                                                                         display: 'flex',
                                                                                                    }}
                                                                                               >
                                                                                                    <Switch key={product._id} disabled={loading} checked={currentProductObject!.discount}
                                                                                                         onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                              ...previousObject,
                                                                                                              discount: !previousObject.discount
                                                                                                         }))}
                                                                                                    />
                                                                                                    <Typography key={product._id} variant="subtitle2">
                                                                                                         Popust
                                                                                                    </Typography>
                                                                                               </Grid>
                                                                                          </Grid>
                                                                                     </Grid>
                                                                                </Grid>
                                                                                <Card sx={{ width: '50%', marginTop: '20px' }}>
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

                                                                                               <UploadButton
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
                                                                                                              icon: 'success',
                                                                                                              title: 'Noooo',
                                                                                                              text: 'Nešto je pošlo po zlu! Proveri format fajla koji upload-uješ!',
                                                                                                         })
                                                                                                         console.log(error);
                                                                                                    }}
                                                                                                    content={{
                                                                                                         button({ ready }: any) {
                                                                                                              if (ready) return <Typography sx={{ color: theme.palette.divider }}>Pronadji sliku...</Typography>;
                                                                                                              return "Getting ready...";
                                                                                                         },
                                                                                                         allowedContent({ ready, fileTypes }) {
                                                                                                              if (!ready) return "Checking what you allow";
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
                                                                                                                   ...(loading && { color: theme.palette.primary.main, }),
                                                                                                                   borderRadius: "10px",
                                                                                                                   cursor: 'pointer'
                                                                                                              };
                                                                                                         },
                                                                                                         allowedContent: {
                                                                                                              color: theme.palette.primary.main,
                                                                                                         },
                                                                                                    }}
                                                                                               />
                                                                                               {currentProductObject?.imageURL.length ? (
                                                                                                    <Image

                                                                                                         src={currentProductObject!.imageURL}
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
                                                                           <Stack key={product._id}
                                                                                alignItems="center"
                                                                                direction="row"
                                                                                justifyContent="space-between"
                                                                                sx={{ p: 2 }}
                                                                           >
                                                                                <Stack key={product._id}
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
                                                                                     <Button key={product._id}
                                                                                          color="inherit"
                                                                                          onClick={handleProductClose}
                                                                                          disabled={loading}
                                                                                     >
                                                                                          Odustani
                                                                                     </Button>
                                                                                </Stack>
                                                                                <div>
                                                                                     <Button key={product._id}
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
                                             null
                                   }
                              </TableBody>
                         </Table>
                    </Box>
               </Scrollbar>
          </Card >
     );
};



// ProductsTable.propTypes = {
//           count: PropTypes.number,
//           items: PropTypes.array,
//           onDeselectAll: PropTypes.func,
//           onDeselectOne: PropTypes.func,
//           onPageChange: PropTypes.func,
//           onRowsPerPageChange: PropTypes.func,
//           onSelectAll: PropTypes.func,
//           onSelectOne: PropTypes.func,
//           page: PropTypes.number,
//           rowsPerPage: PropTypes.number,
//           selected: PropTypes.array
// };
