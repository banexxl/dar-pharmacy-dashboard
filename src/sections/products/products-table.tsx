import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import {
     Box, Button, Card, CardContent, Checkbox, Divider, Grid, IconButton, Input, InputAdornment, LinearProgress, MenuItem,
     OutlinedInput,
     Stack, SvgIcon, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useTheme
} from '@mui/material';
import PropTypes from 'prop-types';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Image from 'next/image';
import { Fragment, useMemo, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from '@/components/severity-pill';
import { fetchSubCategoryOptions } from './new-product-form';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import "@uploadthing/react/styles.css";
import { UploadButton } from "../../utils/image-upload-components";
import { mainCategoryOptions, manufacturerOptions, midCategoryOptions, quantityUnitOptions } from './new-product-schema';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import ClearIcon from '@mui/icons-material/Clear';
import { getComparator } from '../order/order-list-table';

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

export const ProductsTable = (props: any) => {

     const {
          items = [],
          page = 0,
          rowsPerPage = 5,
          sortDir = 'desc',
          sortBy = 'createdAt',
          onSelect = () => { },
          count = 0,
     } = props;


     const [currentProductID, setCurrentProductID] = useState(null);
     const [currentProductObject, setCurrentProductObject] = useState<IProduct | null>();
     const router = useRouter();
     const theme = useTheme()
     const [fileURL, setFileURL] = useState("")
     const [loading, setLoading] = useState(false)
     const [subCategoryOptions, setSubCategoryOptions] = useState<any>([]);
     const [isSubCategoryEnabled, setIsSubCategoryEnabled] = useState(false);
     const [selectedMidCategory, setSelectedMidCategory] = useState('');

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

     const [searchQuery, setSearchQuery] = useState('');

     const handleClearSearch = () => {
          setSearchQuery('');
     };
     const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          setSearchQuery(event.target.value);
     };

     // const filteredItems = items.filter((product: IProduct) =>
     //      product.name.toLowerCase().includes(searchQuery.toLowerCase())
     // );

     const visibleRows = useMemo(
          () =>
               [...items]
                    .filter((product: IProduct) =>
                         !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .sort(getComparator(sortDir, sortBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
          [searchQuery, items, page, rowsPerPage],
     );


     return (
          <Card>
               <Card sx={{ p: 2 }}>
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
               </Card>
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
                                        visibleRows.length > 0 ?
                                             visibleRows.map((product: IProduct) => {
                                                  //const isSelected = selected.includes(product._id);
                                                  const isCurrent = product._id === currentProductID;
                                                  // const price = numeral(product.price).format(`${product.currency}0,0.00`);
                                                  const quantityColor = product.quantity >= 10 ? 'success' : 'error';
                                                  const statusColor = product.isActive === true ? 'success' : 'info';
                                                  // const hasManyVariants = product.variants > 1;

                                                  return (
                                                       <Fragment key={Math.random()}>
                                                            <TableRow
                                                                 hover
                                                                 key={Math.random()}
                                                            >
                                                                 <TableCell
                                                                      key={Math.random()}
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
                                                                      <IconButton key={Math.random()} onClick={() => handleProductToggle(product._id)}>
                                                                           <SvgIcon key={Math.random()}>{isCurrent ? <ChevronDownIcon key={Math.random()} /> : <ChevronRightIcon key={Math.random()} />}</SvgIcon >
                                                                      </IconButton>
                                                                 </TableCell>
                                                                 <TableCell width="25%" key={Math.random()}>
                                                                      <Box key={Math.random()}
                                                                           sx={{
                                                                                alignItems: 'center',
                                                                                display: 'flex',
                                                                           }}
                                                                      >
                                                                           {product.imageURL ? (
                                                                                <Box
                                                                                     key={Math.random()}
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
                                                                                     key={Math.random()}
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
                                                                                     <SvgIcon key={Math.random()} >

                                                                                     </SvgIcon>
                                                                                </Box>
                                                                           )}
                                                                           <Box
                                                                                key={Math.random()}
                                                                                sx={{
                                                                                     cursor: 'pointer',
                                                                                     ml: 2,
                                                                                }}
                                                                           >
                                                                                <Typography key={Math.random()} variant="subtitle2">{product.name}</Typography>
                                                                                <Typography
                                                                                     key={Math.random()}
                                                                                     color="text.secondary"
                                                                                     variant="body2"
                                                                                >
                                                                                     in {product.mainCategory}
                                                                                </Typography>
                                                                           </Box>
                                                                      </Box>
                                                                 </TableCell>
                                                                 <TableCell width="25%" key={Math.random()}>
                                                                      <LinearProgress
                                                                           key={Math.random()}
                                                                           value={product.quantity}
                                                                           variant="determinate"
                                                                           color={quantityColor}
                                                                           sx={{
                                                                                height: 8,
                                                                                width: 40,
                                                                           }}
                                                                      />
                                                                      <Typography
                                                                           key={Math.random()}
                                                                           color="text.secondary"
                                                                           variant="body2"
                                                                      >
                                                                           {product.availableStock} in stock
                                                                           {/* {hasManyVariants && ` in ${product.variants} variants`} */}
                                                                      </Typography>
                                                                 </TableCell>
                                                                 <TableCell key={Math.random()}>{product.price}</TableCell>
                                                                 <TableCell key={Math.random()}>{product._id!.slice(-8)}</TableCell>
                                                                 <TableCell key={Math.random()}>
                                                                      <SeverityPill key={Math.random()} color={statusColor}>{product.discount.toString()}</SeverityPill>
                                                                 </TableCell>
                                                                 <TableCell key={Math.random()}>
                                                                      <SeverityPill key={Math.random()} color={statusColor}>{product.discountAmount}</SeverityPill>
                                                                 </TableCell>
                                                            </TableRow>
                                                            {isCurrent && (
                                                                 <TableRow key={Math.random()}>
                                                                      <TableCell
                                                                           key={Math.random()}
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
                                                                           <CardContent key={Math.random()}>
                                                                                <Grid key={Math.random()}
                                                                                     container
                                                                                     spacing={3}
                                                                                >
                                                                                     <Grid key={Math.random()}
                                                                                          item
                                                                                          md={6}
                                                                                          xs={12}
                                                                                     >
                                                                                          <Typography key={Math.random()} variant="h6">Osnovni detalji</Typography>
                                                                                          <Divider key={Math.random()} sx={{ my: 2 }} />
                                                                                          <Grid key={Math.random()}
                                                                                               container
                                                                                               spacing={3}
                                                                                          >
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
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
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
                                                                                                         defaultValue={currentProductObject?._id!.slice(-8)}
                                                                                                         disabled
                                                                                                         fullWidth
                                                                                                         label="Šifra proizvoda"
                                                                                                         name={product._id!.slice(-8)}
                                                                                                    />
                                                                                               </Grid>
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
                                                                                                         defaultValue={currentProductObject?.mainCategory}
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
                                                                                                                   key={Math.random()}
                                                                                                                   value={option.value}
                                                                                                              >
                                                                                                                   {option.label}
                                                                                                              </MenuItem>
                                                                                                         ))}
                                                                                                    </TextField>
                                                                                               </Grid>
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
                                                                                                         defaultValue={currentProductObject?.midCategory}
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
                                                                                                                   key={Math.random()}
                                                                                                                   value={option.value}
                                                                                                              >
                                                                                                                   {option.label}
                                                                                                              </MenuItem>
                                                                                                         ))}
                                                                                                    </TextField>
                                                                                               </Grid>
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
                                                                                                         defaultValue={currentProductObject?.subCategory}
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
                                                                                                                   key={Math.random()}
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
                                                                                                    <TextField key={Math.random()}
                                                                                                         defaultValue={currentProductObject?.description}
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
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
                                                                                                         defaultValue={currentProductObject?.instructions}
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
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
                                                                                                         defaultValue={currentProductObject?.warning}
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
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
                                                                                                         defaultValue={currentProductObject?.ingredients}
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
                                                                                     <Grid key={Math.random()}
                                                                                          item
                                                                                          md={6}
                                                                                          xs={12}
                                                                                     >
                                                                                          <Typography key={Math.random()} variant="h6">Napredni podaci</Typography>
                                                                                          <Divider key={Math.random()} sx={{ my: 2 }} />
                                                                                          <Grid key={Math.random()}
                                                                                               container
                                                                                               spacing={3}
                                                                                          >
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
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
                                                                                                                   <InputAdornment key={Math.random()} position="start">RSD</InputAdornment>
                                                                                                              ),
                                                                                                         }}
                                                                                                         type="number"
                                                                                                    />
                                                                                               </Grid>

                                                                                               <Grid key={Math.random()}
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
                                                                                                         defaultValue={currentProductObject?.manufacturer}
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

                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
                                                                                                         defaultValue={currentProductObject?.availableStock}
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
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
                                                                                                         defaultValue={currentProductObject?.discountAmount}
                                                                                                         fullWidth
                                                                                                         disabled={loading}
                                                                                                         label="Iznos popusta"
                                                                                                         name="discountAmount"
                                                                                                         onBlur={(e) => {
                                                                                                              const min = 0;
                                                                                                              const max = 100;
                                                                                                              var value = parseInt(e.target.value, 10);

                                                                                                              if (value > max) value = max;
                                                                                                              if (value < min) value = min;

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
                                                                                                    <TextField
                                                                                                         key={Math.random()}
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
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                               >
                                                                                                    <TextField key={Math.random()}
                                                                                                         defaultValue={currentProductObject?.quantityUnit}
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
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                                    sx={{
                                                                                                         alignItems: 'center',
                                                                                                         display: 'flex',
                                                                                                    }}
                                                                                               >
                                                                                                    <Switch key={Math.random()} disabled={loading} checked={currentProductObject!.isActive}
                                                                                                         onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                              ...previousObject,
                                                                                                              isActive: !previousObject.isActive
                                                                                                         }))}
                                                                                                    />
                                                                                                    <Typography key={Math.random()} variant="subtitle2">
                                                                                                         Aktivan
                                                                                                    </Typography>
                                                                                               </Grid>
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                                    sx={{
                                                                                                         alignItems: 'center',
                                                                                                         display: 'flex',
                                                                                                    }}
                                                                                               >
                                                                                                    <Switch key={Math.random()} disabled={loading} checked={currentProductObject!.newArrival}
                                                                                                         onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                              ...previousObject,
                                                                                                              newArrival: !previousObject.newArrival
                                                                                                         }))}
                                                                                                    />
                                                                                                    <Typography key={Math.random()} variant="subtitle2">
                                                                                                         Novi proizvod
                                                                                                    </Typography>
                                                                                               </Grid>
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                                    sx={{
                                                                                                         alignItems: 'center',
                                                                                                         display: 'flex',
                                                                                                    }}
                                                                                               >
                                                                                                    <Switch key={Math.random()} disabled={loading}
                                                                                                         checked={currentProductObject!.bestSeller}
                                                                                                         onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                              ...previousObject,
                                                                                                              bestSeller: !previousObject.bestSeller

                                                                                                         }))}
                                                                                                    />
                                                                                                    <Typography key={Math.random()} variant="subtitle2">
                                                                                                         Najprodavaniji
                                                                                                    </Typography>
                                                                                               </Grid>
                                                                                               <Grid key={Math.random()}
                                                                                                    item
                                                                                                    md={6}
                                                                                                    xs={12}
                                                                                                    sx={{
                                                                                                         alignItems: 'center',
                                                                                                         display: 'flex',
                                                                                                    }}
                                                                                               >
                                                                                                    <Switch key={Math.random()} disabled={loading} checked={currentProductObject!.discount}
                                                                                                         onChange={() => setCurrentProductObject((previousObject: any) => ({
                                                                                                              ...previousObject,
                                                                                                              discount: !previousObject.discount
                                                                                                         }))}
                                                                                                    />
                                                                                                    <Typography key={Math.random()} variant="subtitle2">
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
                                                                           <Stack key={Math.random()}
                                                                                alignItems="center"
                                                                                direction="row"
                                                                                justifyContent="space-between"
                                                                                sx={{ p: 2 }}
                                                                           >
                                                                                <Stack key={Math.random()}
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
                                                                                     <Button key={Math.random()}
                                                                                          color="inherit"
                                                                                          onClick={handleProductClose}
                                                                                          disabled={loading}
                                                                                     >
                                                                                          Odustani
                                                                                     </Button>
                                                                                </Stack>
                                                                                <div>
                                                                                     <Button key={Math.random()}
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
                                                  <TableCell colSpan={7} align="center">
                                                       Nije pronađen nijedan proizvod...
                                                  </TableCell>
                                             </TableRow>
                                   }
                              </TableBody>
                         </Table>
                    </Box>
               </Scrollbar>
          </Card >
     );
};

ProductsTable.propTypes = {
     count: PropTypes.number,
     items: PropTypes.array,
     onDeselectAll: PropTypes.func,
     onDeselectOne: PropTypes.func,
     onPageChange: PropTypes.func,
     onRowsPerPageChange: PropTypes.func,
     onSelectAll: PropTypes.func,
     onSelectOne: PropTypes.func,
     page: PropTypes.number,
     rowsPerPage: PropTypes.number,
     selected: PropTypes.array
};
