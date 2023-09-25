import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import {
          Avatar, Box, Button, Card, CardContent, Checkbox,
          Divider,
          Grid,
          IconButton,
          InputAdornment,
          LinearProgress,
          MenuItem,
          Stack, SvgIcon, Switch, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography
} from '@mui/material';
import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import { toast } from 'react-hot-toast';
import numeral from 'numeral';
import { Fragment, useCallback, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from '@/components/severity-pill';
import { mainCategoryOptions, midCategoryOptions } from './new-product-form';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export const ProductsTable = (props: any) => {
          const {
                    count = 0,
                    items = [],
                    onDeselectAll,
                    onDeselectOne,
                    onPageChange = () => { },
                    onRowsPerPageChange,
                    onSelectAll,
                    onSelectOne,
                    page = 0,
                    rowsPerPage = 0,
                    selected = []
          } = props;

          const selectedSome = (selected.length > 0) && (selected.length < items.length);
          const selectedAll = (items.length > 0) && (selected.length === items.length);
          const [currentProductID, setCurrentProductID] = useState(null);
          const [currentProductObject, setCurrentProductObject] = useState(null);
          const router = useRouter();

          const getObjectById = (_id: any, arrayToSearch: any) => {
                    for (const obj of arrayToSearch) {
                              if (obj._id === _id) {
                                        return obj;  // Found the object with the desired ID
                              }
                    }
                    return null;  // Object with the desired ID not found
          }

          const handleProductToggle = useCallback((productId: any) => {
                    setCurrentProductID((prevProductId: any) => {
                              if (prevProductId === productId) {
                                        setCurrentProductObject(null)
                                        return null;
                              }
                              setCurrentProductObject(getObjectById(productId, items))
                              return productId;
                    });
          }, []);

          const handleProductClose = useCallback(() => {
                    setCurrentProductID(null);
          }, []);

          const handleProductUpdate = useCallback(() => {
                    setCurrentProductID(null);
                    toast.success('Product updated');
          }, []);

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

                    try {
                              //API CALL
                              const response = await fetch('/api/product-api', {
                                        method: 'DELETE',
                                        headers: {
                                                  'Content-Type': 'application/json',
                                                  'Access-Control-Allow-Origin': 'https://dar-pharmacy-dashboard.vercel.app/api/product-api, http://localhost:3000/api/product-api',
                                                  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
                                        },
                                        body: JSON.stringify(currentProductID), // Convert your data to JSON
                              });

                              if (response.ok) {
                                        Swal.fire({
                                                  icon: 'success',
                                                  title: 'Success',
                                                  text: 'Product deleted!',
                                        })
                                        router.push('/products')
                              } else {
                                        const errorData = await response.json(); // Parse the error response
                                        console.error('errorData', errorData);
                              }

                    } catch (err) {
                              console.error(err);
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
                                                                                          Sifra
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
                                                                      {items.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage).map((product: any) => {
                                                                                //const isSelected = selected.includes(product._id);
                                                                                const isCurrent = product._id === currentProductID;

                                                                                const price = numeral(product.price).format(`${product.currency}0,0.00`);
                                                                                const quantityColor = product.quantity >= 10 ? 'success' : 'error';
                                                                                const statusColor = product.status === 'published' ? 'success' : 'info';
                                                                                const hasManyVariants = product.variants > 1;

                                                                                return (
                                                                                          <Fragment key={product.id}>
                                                                                                    <TableRow
                                                                                                              hover
                                                                                                              key={product._id}
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
                                                                                                                        <IconButton onClick={() => handleProductToggle(product._id)}>
                                                                                                                                  <SvgIcon>{isCurrent ? <ChevronDownIcon /> : <ChevronRightIcon />}</SvgIcon>
                                                                                                                        </IconButton>
                                                                                                              </TableCell>
                                                                                                              <TableCell width="25%">
                                                                                                                        <Box
                                                                                                                                  sx={{
                                                                                                                                            alignItems: 'center',
                                                                                                                                            display: 'flex',
                                                                                                                                  }}
                                                                                                                        >
                                                                                                                                  {product.imageURL ? (
                                                                                                                                            <Box
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
                                                                                                                                                      <SvgIcon>

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
                                                                                                                                                      in {product.mainCategory}
                                                                                                                                            </Typography>
                                                                                                                                  </Box>
                                                                                                                        </Box>
                                                                                                              </TableCell>
                                                                                                              <TableCell width="25%">
                                                                                                                        <LinearProgress
                                                                                                                                  value={product.availableStock}
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
                                                                                                                                  {product.availableStock} in stock
                                                                                                                                  {hasManyVariants && ` in ${product.variants} variants`}
                                                                                                                        </Typography>
                                                                                                              </TableCell>
                                                                                                              <TableCell>{product.price}</TableCell>
                                                                                                              <TableCell>{product._id.slice(-8)}</TableCell>
                                                                                                              <TableCell>
                                                                                                                        <SeverityPill color={statusColor}>{product.discount.toString()}</SeverityPill>
                                                                                                              </TableCell>
                                                                                                              <TableCell>
                                                                                                                        <SeverityPill color={statusColor}>{product.discountAmount}</SeverityPill>
                                                                                                              </TableCell>
                                                                                                    </TableRow>
                                                                                                    {isCurrent && (
                                                                                                              <TableRow>
                                                                                                                        <TableCell
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
                                                                                                                                  <CardContent>
                                                                                                                                            <Grid
                                                                                                                                                      container
                                                                                                                                                      spacing={3}
                                                                                                                                            >
                                                                                                                                                      <Grid
                                                                                                                                                                item
                                                                                                                                                                md={6}
                                                                                                                                                                xs={12}
                                                                                                                                                      >
                                                                                                                                                                <Typography variant="h6">Basic details</Typography>
                                                                                                                                                                <Divider sx={{ my: 2 }} />
                                                                                                                                                                <Grid
                                                                                                                                                                          container
                                                                                                                                                                          spacing={3}
                                                                                                                                                                >
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                          >
                                                                                                                                                                                    <TextField
                                                                                                                                                                                              defaultValue={product.name}
                                                                                                                                                                                              fullWidth
                                                                                                                                                                                              label="Product name"
                                                                                                                                                                                              name="name"
                                                                                                                                                                                    />
                                                                                                                                                                          </Grid>
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                          >
                                                                                                                                                                                    <TextField
                                                                                                                                                                                              defaultValue={product._id.slice(-8)}
                                                                                                                                                                                              disabled
                                                                                                                                                                                              fullWidth
                                                                                                                                                                                              label="SKU"
                                                                                                                                                                                              name={product._id.slice(-8)}
                                                                                                                                                                                    />
                                                                                                                                                                          </Grid>
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                          >
                                                                                                                                                                                    <TextField
                                                                                                                                                                                              defaultValue={product.mainCategory}
                                                                                                                                                                                              fullWidth
                                                                                                                                                                                              label="Main Category"
                                                                                                                                                                                              select
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
                                                                                                                                                                          </Grid>
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                          >
                                                                                                                                                                                    <TextField
                                                                                                                                                                                              defaultValue={product.midCategory}
                                                                                                                                                                                              fullWidth
                                                                                                                                                                                              label="Mid Category"
                                                                                                                                                                                              select
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
                                                                                                                                                                          </Grid>
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                          >
                                                                                                                                                                                    <TextField
                                                                                                                                                                                              defaultValue={product.quantity}
                                                                                                                                                                                              fullWidth
                                                                                                                                                                                              label="Quantity"
                                                                                                                                                                                              name={product.quantity}
                                                                                                                                                                                    />
                                                                                                                                                                          </Grid>
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                          >
                                                                                                                                                                                    <TextField
                                                                                                                                                                                              defaultValue={product.description}
                                                                                                                                                                                              fullWidth
                                                                                                                                                                                              label="Description"
                                                                                                                                                                                              name={product.description}
                                                                                                                                                                                    />
                                                                                                                                                                          </Grid>
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                          >
                                                                                                                                                                                    <TextField
                                                                                                                                                                                              defaultValue={product.instructions}
                                                                                                                                                                                              fullWidth
                                                                                                                                                                                              label="Instructions"
                                                                                                                                                                                              name={product.instructions}
                                                                                                                                                                                    />
                                                                                                                                                                          </Grid>
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                          >
                                                                                                                                                                                    <TextField
                                                                                                                                                                                              defaultValue={product.warning}
                                                                                                                                                                                              fullWidth
                                                                                                                                                                                              label="Warning"
                                                                                                                                                                                              name={product.warning}
                                                                                                                                                                                    />
                                                                                                                                                                          </Grid>
                                                                                                                                                                </Grid>
                                                                                                                                                      </Grid>
                                                                                                                                                      <Grid
                                                                                                                                                                item
                                                                                                                                                                md={6}
                                                                                                                                                                xs={12}
                                                                                                                                                      >
                                                                                                                                                                <Typography variant="h6">Pricing and stocks</Typography>
                                                                                                                                                                <Divider sx={{ my: 2 }} />
                                                                                                                                                                <Grid
                                                                                                                                                                          container
                                                                                                                                                                          spacing={3}
                                                                                                                                                                >
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                          >
                                                                                                                                                                                    <TextField
                                                                                                                                                                                              defaultValue={product.price}
                                                                                                                                                                                              fullWidth
                                                                                                                                                                                              label="Old price"
                                                                                                                                                                                              name="old-price"
                                                                                                                                                                                              InputProps={{
                                                                                                                                                                                                        startAdornment: (
                                                                                                                                                                                                                  <InputAdornment position="start">
                                                                                                                                                                                                                            {product.currency}
                                                                                                                                                                                                                  </InputAdornment>
                                                                                                                                                                                                        ),
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
                                                                                                                                                                                              defaultValue={product.price}
                                                                                                                                                                                              fullWidth
                                                                                                                                                                                              label="New price"
                                                                                                                                                                                              name="new-price"
                                                                                                                                                                                              InputProps={{
                                                                                                                                                                                                        startAdornment: (
                                                                                                                                                                                                                  <InputAdornment position="start">$</InputAdornment>
                                                                                                                                                                                                        ),
                                                                                                                                                                                              }}
                                                                                                                                                                                              type="number"
                                                                                                                                                                                    />
                                                                                                                                                                          </Grid>
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                                    sx={{
                                                                                                                                                                                              alignItems: 'center',
                                                                                                                                                                                              display: 'flex',
                                                                                                                                                                                    }}
                                                                                                                                                                          >
                                                                                                                                                                                    <Switch value={product.discount} checked={product.discount} />
                                                                                                                                                                                    <Typography variant="subtitle2">
                                                                                                                                                                                              Discount
                                                                                                                                                                                    </Typography>
                                                                                                                                                                          </Grid>
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                                    sx={{
                                                                                                                                                                                              alignItems: 'center',
                                                                                                                                                                                              display: 'flex',
                                                                                                                                                                                    }}
                                                                                                                                                                          >
                                                                                                                                                                                    <Switch value={product.newArrival} checked={product.newArrival} />
                                                                                                                                                                                    <Typography variant="subtitle2">
                                                                                                                                                                                              New arrival
                                                                                                                                                                                    </Typography>
                                                                                                                                                                          </Grid>
                                                                                                                                                                          <Grid
                                                                                                                                                                                    item
                                                                                                                                                                                    md={6}
                                                                                                                                                                                    xs={12}
                                                                                                                                                                                    sx={{
                                                                                                                                                                                              alignItems: 'center',
                                                                                                                                                                                              display: 'flex',
                                                                                                                                                                                    }}
                                                                                                                                                                          >
                                                                                                                                                                                    <Switch value={product.bestSeller} checked={product.bestSeller} />
                                                                                                                                                                                    <Typography variant="subtitle2">
                                                                                                                                                                                              Best seller
                                                                                                                                                                                    </Typography>
                                                                                                                                                                          </Grid>
                                                                                                                                                                </Grid>
                                                                                                                                                      </Grid>
                                                                                                                                            </Grid>
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
                                                                                                                                                                onClick={handleProductUpdate}
                                                                                                                                                                type="submit"
                                                                                                                                                                variant="contained"
                                                                                                                                                      >
                                                                                                                                                                Update
                                                                                                                                                      </Button>
                                                                                                                                                      <Button
                                                                                                                                                                color="inherit"
                                                                                                                                                                onClick={handleProductClose}
                                                                                                                                                      >
                                                                                                                                                                Cancel
                                                                                                                                                      </Button>
                                                                                                                                            </Stack>
                                                                                                                                            <div>
                                                                                                                                                      <Button
                                                                                                                                                                onClick={handleDeleteButtonClick}
                                                                                                                                                                color="error"
                                                                                                                                                      >
                                                                                                                                                                Delete product
                                                                                                                                                      </Button>
                                                                                                                                            </div>
                                                                                                                                  </Stack>
                                                                                                                        </TableCell>
                                                                                                              </TableRow>
                                                                                                    )}
                                                                                          </Fragment>
                                                                                );
                                                                      })}
                                                            </TableBody>
                                                  </Table>
                                        </Box>
                              </Scrollbar>
                              <TablePagination
                                        component="div"
                                        count={count}
                                        onPageChange={onPageChange}
                                        onRowsPerPageChange={onRowsPerPageChange}
                                        page={page}
                                        rowsPerPage={rowsPerPage}
                                        rowsPerPageOptions={[5, 10, 25]}
                              />
                    </Card>
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

