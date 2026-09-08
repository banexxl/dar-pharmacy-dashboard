import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
     Alert, Box, Button, Card, Checkbox, IconButton, InputAdornment, LinearProgress, ListItemText, MenuItem,
     OutlinedInput,
     Select, Stack, SvgIcon, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { Fragment, useMemo, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from '@/components/severity-pill';
import { useRouter } from 'next/navigation';

import { ProductEditForm } from './product-edit-form';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import { getComparator } from '../order/order-list-table';
import { Product } from '../../schemas/product';

export const ProductsTable = (props: any) => {

     const {
          items = [],
          manufacturers = [],
          page = 0,
          rowsPerPage = 5,
          sortDir = 'desc',
          sortBy = 'createdAt',
          onSelect = () => { },
          onProductUpdated = () => { },
          onAddProductClick = () => { },
          count = 0,
     } = props;

     const [currentProductID, setCurrentProductID] = useState(null);
     const router = useRouter();

     const handleProductToggle = (productId: any) => {
          setCurrentProductID((prevProductId: any) => (prevProductId === productId ? null : productId));
     }

     const handleProductClose = () => {
          setCurrentProductID(null);
     }

     const handleInlineProductUpdated = (updatedProduct: any) => {
          onProductUpdated(updatedProduct);
          handleProductClose();
     };

     const handleInlineProductDeleted = () => {
          handleProductClose();
          router.refresh();
     };

     const [searchQuery, setSearchQuery] = useState('');
     const [booleanFilters, setBooleanFilters] = useState<string[]>([]);
     const [internalPage, setInternalPage] = useState(0);
     const [internalRowsPerPage, setInternalRowsPerPage] = useState(rowsPerPage || 10);

     const booleanFilterOptions = [
          { value: 'is_active', label: 'Aktivan' },
          { value: 'display_on_home', label: 'Na početnoj' },
          { value: 'discount', label: 'Popust' },
          { value: 'new_arrival', label: 'Novi proizvod' },
          { value: 'best_seller', label: 'Najprodavaniji' },
          { value: 'promoting', label: 'Promocija' }
     ];

     const handleClearSearch = () => {
          setSearchQuery('');
          setInternalPage(0);
     };

     const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          setSearchQuery(event.target.value);
          setInternalPage(0);
     };

     const filteredRows = useMemo(
          () =>
               [...items]
                    .filter((product: Product) => {
                         if (!searchQuery) {
                              return true;
                         }

                         const name = (product.name || '').toString().toLowerCase();
                         return name.includes(searchQuery.toLowerCase());
                    })
                    .filter((product: Product) => {
                         if (booleanFilters.length === 0) return true;
                         return booleanFilters.every((key) => Boolean((product as any)[key]) === true);
                    })
                    .sort(getComparator(sortDir, sortBy)),
          [searchQuery, items, booleanFilters],
     );

     const visibleRows = useMemo(
          () => filteredRows.slice(internalPage * internalRowsPerPage, internalPage * internalRowsPerPage + internalRowsPerPage),
          [filteredRows, internalPage, internalRowsPerPage],
     );

     return (
          <>
               <Card>
                    <Card sx={{ p: 2 }}>
                         <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" alignItems="center" justifyContent="space-between">
                              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" alignItems="center" sx={{ flexGrow: 1 }}>
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
                                   <Select
                                        multiple
                                        displayEmpty
                                        value={booleanFilters}
                                        onChange={(event) => setBooleanFilters(event.target.value as string[])}
                                        renderValue={(selected) => {
                                             if (selected.length === 0) {
                                                  return 'Svi filteri';
                                             }
                                             return booleanFilterOptions
                                                  .filter((option) => selected.includes(option.value))
                                                  .map((option) => option.label)
                                                  .join(', ');
                                        }}
                                        sx={{ minWidth: 240 }}
                                   >
                                        {booleanFilterOptions.map((option) => (
                                             <MenuItem key={option.value} value={option.value}>
                                                  <Checkbox checked={booleanFilters.includes(option.value)} />
                                                  <ListItemText primary={option.label} />
                                             </MenuItem>
                                        ))}
                                   </Select>
                              </Stack>
                              <Alert severity="info" sx={{ py: 0.5, mt: 1 }}>
                                   Pretraga pretražuje po nazivu proizvoda. Koristite filtere za dodatne opcije.
                              </Alert>
                              <Button
                                   size="small"
                                   startIcon={(
                                        <SvgIcon fontSize="small">
                                             <PlusIcon />
                                        </SvgIcon>
                                   )}
                                   variant="contained"
                                   onClick={onAddProductClick}
                              >
                                   Dodaj proizvod
                              </Button>
                         </Stack>
                    </Card>
                    <Box
                         sx={{
                              minWidth: 0,
                              overflowX: 'auto',
                              width: '100%',
                         }}
                    >
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
                                             <TableCell>
                                                  Na početnoj
                                             </TableCell>
                                             <TableCell>
                                                  Aktivan
                                             </TableCell>
                                             <TableCell align="right">
                                                  Akcije
                                             </TableCell>
                                        </TableRow>
                                   </TableHead>
                                   <TableBody>
                                        {
                                             visibleRows.length > 0 ?
                                                  visibleRows.map((product: Product) => {
                                                       //const isSelected = selected.includes(product.id);
                                                       const isCurrent = product.id === currentProductID;
                                                       const quantityColor = (product.quantity ?? 0) >= 10 ? 'success' : 'error';
                                                       const statusColor = product.is_active === true ? 'success' : 'info';
                                                       const homeColor = product.display_on_home ? 'success' : 'info';
                                                       // const hasManyVariants = product.variants > 1;

                                                       return (
                                                            <Fragment key={product.id}>
                                                                 <TableRow
                                                                      hover

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
                                                                           <IconButton onClick={() => handleProductToggle(product.id)}>
                                                                                <SvgIcon>{isCurrent ? <ChevronDownIcon /> : <ChevronRightIcon />}</SvgIcon >
                                                                           </IconButton>
                                                                      </TableCell>
                                                                      <TableCell width="25%">
                                                                           <Box
                                                                                sx={{
                                                                                     alignItems: 'center',
                                                                                     display: 'flex',
                                                                                }}
                                                                           >
                                                                                {product.image_url ? (
                                                                                     <Box

                                                                                          sx={{
                                                                                               alignItems: 'center',
                                                                                               backgroundColor: 'neutral.50',
                                                                                               backgroundImage: `url(${product.image_url})`,
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
                                                                                          <SvgIcon >

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
                                                                                          in {product.main_category}
                                                                                     </Typography>
                                                                                     <Typography

                                                                                          color="text.secondary"
                                                                                          variant="body2"
                                                                                     >
                                                                                          Proizvođač: {product.manufacturer_name ?? product.manufacturer_id ?? '-'}
                                                                                     </Typography>
                                                                                </Box>
                                                                           </Box>
                                                                      </TableCell>
                                                                      <TableCell width="25%">
                                                                           <LinearProgress
                                                                                value={product.quantity ?? 0}
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
                                                                                {product.available_stock} in stock
                                                                                {/* {hasManyVariants && ` in ${product.variants} variants`} */}
                                                                           </Typography>
                                                                      </TableCell>
                                                                      <TableCell>{product.price}</TableCell>
                                                                      <TableCell>{product.id?.slice(-8)}</TableCell>
                                                                      <TableCell>
                                                                           <SeverityPill color={statusColor}>{product.discount.toString()}</SeverityPill>
                                                                      </TableCell>
                                                                      <TableCell>
                                                                           <SeverityPill color={statusColor}>{product.discount_amount}</SeverityPill>
                                                                      </TableCell>
                                                                      <TableCell>
                                                                           <SeverityPill color={homeColor}>
                                                                                {product.display_on_home ? 'Da' : 'Ne'}
                                                                           </SeverityPill>
                                                                      </TableCell>
                                                                      <TableCell>
                                                                           <SeverityPill color={statusColor}>
                                                                                {product.is_active ? 'Da' : 'Ne'}
                                                                           </SeverityPill>
                                                                      </TableCell>
                                                                      <TableCell align="right">
                                                                           <IconButton
                                                                                size="small"
                                                                                onClick={() => router.push(`/artikli/${product.id}`)}
                                                                                title="Izmeni"
                                                                           >
                                                                                <EditIcon fontSize="small" />
                                                                           </IconButton>
                                                                      </TableCell>
                                                                 </TableRow>
                                                                 {isCurrent && (
                                                                      <TableRow>
                                                                           <TableCell

                                                                                colSpan={10}
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
                                                                                <ProductEditForm
                                                                                     product={product}
                                                                                     manufacturers={manufacturers}
                                                                                     onUpdated={handleInlineProductUpdated}
                                                                                     onDeleted={handleInlineProductDeleted}
                                                                                     onCancel={handleProductClose}
                                                                                />
                                                                           </TableCell>
                                                                      </TableRow>
                                                                 )
                                                                 }
                                                            </Fragment>
                                                       );
                                                  })
                                                  :
                                                  <TableRow>
                                                       <TableCell colSpan={10} align="center">
                                                            Nije pronađen nijedan proizvod...
                                                       </TableCell>
                                                  </TableRow>
                                        }
                                   </TableBody>
                              </Table>
                         </Box>
                    </Box>
               </Card >
               <TablePagination
                    component="div"
                    count={filteredRows.length}
                    onPageChange={(event, newPage) => setInternalPage(newPage)}
                    onRowsPerPageChange={(event) => {
                         setInternalRowsPerPage(parseInt(event.target.value, 10));
                         setInternalPage(0);
                    }}
                    page={internalPage}
                    rowsPerPage={internalRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50, 100, 200]}
                    showFirstButton
                    showLastButton
                    labelRowsPerPage={'Broj po stranici.'}
               />
          </>
     );
};

ProductsTable.propTypes = {
     count: PropTypes.number,
     items: PropTypes.array,
     onDeselectAll: PropTypes.func,
     onDeselectOne: PropTypes.func,
     onAddProductClick: PropTypes.func,
     onProductUpdated: PropTypes.func,
     onPageChange: PropTypes.func,
     onRowsPerPageChange: PropTypes.func,
     onSelectAll: PropTypes.func,
     onSelectOne: PropTypes.func,
     page: PropTypes.number,
     rowsPerPage: PropTypes.number,
     selected: PropTypes.array
};
