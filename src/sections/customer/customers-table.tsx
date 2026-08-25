'use client';

import PropTypes from 'prop-types';
import { format } from 'date-fns';
import {
     Avatar,
     Box,
     Button,
     ButtonGroup,
     Card,
     Checkbox,
     Chip,
     CircularProgress,
     Stack,
     Table,
     TableBody,
     TableCell,
     TableHead,
     TablePagination,
     TableRow,
     TableSortLabel,
     Typography,
} from '@mui/material';
import { useMemo, useState, useTransition } from 'react';
import { Customer } from '@/schemas/customer';
import { getComparator } from '../order/order-list-table';
import { getInitials } from '@/utils/get-initials';
import { banCustomer, deleteCustomer, sendCustomerPasswordReset, unbanCustomer } from '@/app/(dashboard)/klijenti/actions';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

type SortableColumn = 'full_name' | 'email' | 'phone_number' | 'address' | 'orders' | 'created_at';

export const CustomersTable = (props: any) => {
     const {
          count = 0,
          items = [],
          onDeselectAll,
          onDeselectOne,
          onSelectAll,
          onSelectOne,
          onPageChange,
          onRowsPerPageChange,
          page = 0,
          rowsPerPage = 5,
          selected = [],
     } = props;

     const router = useRouter();
     const [isPending, startTransition] = useTransition();
     const [activeCustomerId, setActiveCustomerId] =
          useState<string | null>(null);
     const [sortBy, setSortBy] = useState<SortableColumn>('full_name');
     const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

     const handleSortChange = (column: SortableColumn) => {
          if (sortBy === column) {
               setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
          } else {
               setSortBy(column);
               setSortDir('asc');
          }
     };

     const selectedSome =
          selected.length > 0 &&
          selected.length < items.length;

     const selectedAll =
          items.length > 0 &&
          selected.length === items.length;

     const visibleRows = useMemo(() => {
          return [...items]
               .sort((a: Customer, b: Customer) => {
                    let aVal: any;
                    let bVal: any;

                    if (sortBy === 'orders') {
                         aVal = a.orders?.[0]?.count ?? 0;
                         bVal = b.orders?.[0]?.count ?? 0;
                    } else if (sortBy === 'address') {
                         aVal = [a.street_address, a.city].filter(Boolean).join(', ');
                         bVal = [b.street_address, b.city].filter(Boolean).join(', ');
                    } else {
                         aVal = (a as any)[sortBy] ?? '';
                         bVal = (b as any)[sortBy] ?? '';
                    }

                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                         return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
                    }

                    const aStr = String(aVal).toLowerCase();
                    const bStr = String(bVal).toLowerCase();

                    if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
                    if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
                    return 0;
               })
               .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
     }, [items, page, rowsPerPage, sortBy, sortDir]);

     const executeAction = (
          customerId: string,
          action: () => Promise<{
               success: boolean;
               error?: string;
          }>,
          successMessage: string
     ) => {
          setActiveCustomerId(customerId);

          startTransition(async () => {
               try {
                    const result = await action();

                    if (!result.success) {
                         await Swal.fire({
                              icon: 'error',
                              title: 'Greška',
                              text:
                                   result.error ??
                                   'Akcija nije uspešno izvršena.',
                         });

                         return;
                    }

                    await Swal.fire({
                         icon: 'success',
                         title: 'Uspešno',
                         text: successMessage,
                         timer: 1800,
                         showConfirmButton: false,
                    });

                    router.refresh();
               } finally {
                    setActiveCustomerId(null);
               }
          });
     };

     const handleDelete = async (customer: Customer) => {
          const confirmation = await Swal.fire({
               icon: 'warning',
               title: 'Obrisati klijenta?',
               text: `Nalog ${customer.full_name || customer.email} biće trajno obrisan.`,
               showCancelButton: true,
               confirmButtonText: 'Obriši',
               cancelButtonText: 'Odustani',
               confirmButtonColor: '#d32f2f',
          });

          if (!confirmation.isConfirmed) {
               return;
          }

          executeAction(
               customer.id,
               () => deleteCustomer(customer.id),
               'Klijent je uspešno obrisan.'
          );
     };

     const handleBan = async (customer: Customer) => {
          const customerName =
               customer.full_name ||
               customer.email ||
               'Ovaj klijent';

          const confirmation = await Swal.fire({
               icon: 'warning',
               title: 'Blokirati klijenta?',
               text: `${customerName} neće moći da se prijavi.`,
               showCancelButton: true,
               confirmButtonText: 'Blokiraj',
               cancelButtonText: 'Odustani',
               confirmButtonColor: '#ed6c02',
               reverseButtons: true,
               focusCancel: true,
          });

          if (!confirmation.isConfirmed) {
               return;
          }

          executeAction(
               customer.id,
               () => banCustomer(customer.id),
               'Klijent je uspešno blokiran.'
          );
     };

     const handleUnban = async (customer: Customer) => {
          const customerName =
               customer.full_name ||
               customer.email ||
               'Ovaj klijent';

          const confirmation = await Swal.fire({
               icon: 'question',
               title: 'Odblokirati klijenta?',
               text: `${customerName} će ponovo moći da se prijavi.`,
               showCancelButton: true,
               confirmButtonText: 'Odblokiraj',
               cancelButtonText: 'Odustani',
               confirmButtonColor: '#2e7d32',
               reverseButtons: true,
               focusCancel: true,
          });

          if (!confirmation.isConfirmed) {
               return;
          }

          executeAction(
               customer.id,
               () => unbanCustomer(customer.id),
               'Klijent je uspešno odblokiran.'
          );
     };

     const handlePasswordReset = async (
          customer: Customer
     ) => {
          const confirmation = await Swal.fire({
               icon: 'question',
               title: 'Poslati email za promenu lozinke?',
               text: `Email će biti poslat na ${customer.email}.`,
               showCancelButton: true,
               confirmButtonText: 'Pošalji',
               cancelButtonText: 'Odustani',
          });

          if (!confirmation.isConfirmed) {
               return;
          }

          executeAction(
               customer.id,
               () => sendCustomerPasswordReset(customer.id),
               'Email za promenu lozinke je poslat.'
          );
     };

     return (
          <Card sx={{ overflow: 'hidden' }}>
               <Box sx={{ overflowX: 'auto', width: '100%' }}>
                    <Box sx={{ minWidth: 1200 }}>
                         <Table>
                              <TableHead>
                                   <TableRow>
                                        <TableCell padding="checkbox">
                                             <Checkbox
                                                  checked={selectedAll}
                                                  indeterminate={selectedSome}
                                                  onChange={(event) => {
                                                       if (event.target.checked) {
                                                            onSelectAll?.();
                                                       } else {
                                                            onDeselectAll?.();
                                                       }
                                                  }}
                                             />
                                        </TableCell>

                                        <TableCell sortDirection={sortBy === 'full_name' ? sortDir : false}>
                                             <TableSortLabel
                                                  active={sortBy === 'full_name'}
                                                  direction={sortBy === 'full_name' ? sortDir : 'asc'}
                                                  onClick={() => handleSortChange('full_name')}
                                             >
                                                  Klijent
                                             </TableSortLabel>
                                        </TableCell>

                                        <TableCell sortDirection={sortBy === 'email' ? sortDir : false}>
                                             <TableSortLabel
                                                  active={sortBy === 'email'}
                                                  direction={sortBy === 'email' ? sortDir : 'asc'}
                                                  onClick={() => handleSortChange('email')}
                                             >
                                                  Email
                                             </TableSortLabel>
                                        </TableCell>

                                        <TableCell sortDirection={sortBy === 'phone_number' ? sortDir : false}>
                                             <TableSortLabel
                                                  active={sortBy === 'phone_number'}
                                                  direction={sortBy === 'phone_number' ? sortDir : 'asc'}
                                                  onClick={() => handleSortChange('phone_number')}
                                             >
                                                  Telefon
                                             </TableSortLabel>
                                        </TableCell>

                                        <TableCell sortDirection={sortBy === 'address' ? sortDir : false}>
                                             <TableSortLabel
                                                  active={sortBy === 'address'}
                                                  direction={sortBy === 'address' ? sortDir : 'asc'}
                                                  onClick={() => handleSortChange('address')}
                                             >
                                                  Adresa
                                             </TableSortLabel>
                                        </TableCell>

                                        <TableCell align="center" sortDirection={sortBy === 'orders' ? sortDir : false}>
                                             <TableSortLabel
                                                  active={sortBy === 'orders'}
                                                  direction={sortBy === 'orders' ? sortDir : 'asc'}
                                                  onClick={() => handleSortChange('orders')}
                                             >
                                                  Broj porudžbina
                                             </TableSortLabel>
                                        </TableCell>

                                        <TableCell sortDirection={sortBy === 'created_at' ? sortDir : false}>
                                             <TableSortLabel
                                                  active={sortBy === 'created_at'}
                                                  direction={sortBy === 'created_at' ? sortDir : 'asc'}
                                                  onClick={() => handleSortChange('created_at')}
                                             >
                                                  Datum registracije
                                             </TableSortLabel>
                                        </TableCell>

                                        <TableCell align="center">
                                             Upravljanje nalogom
                                        </TableCell>

                                        <TableCell align="right">
                                             Brisanje
                                        </TableCell>
                                   </TableRow>
                              </TableHead>

                              <TableBody>
                                   {visibleRows.map(
                                        (customer: Customer) => {
                                             const isSelected =
                                                  selected.includes(customer.id);

                                             const avatar =
                                                  customer.avatar ??
                                                  undefined;

                                             const fullAddress =
                                                  [
                                                       customer.street_address,
                                                       customer.city,
                                                  ]
                                                       .filter(Boolean)
                                                       .join(', ');

                                             const createdAt =
                                                  customer.created_at
                                                       ? new Date(customer.created_at)
                                                       : null;

                                             const validCreatedAt =
                                                  createdAt &&
                                                  !Number.isNaN(
                                                       createdAt.getTime()
                                                  );

                                             return (
                                                  <TableRow
                                                       hover
                                                       key={customer.id}
                                                       selected={isSelected}
                                                  >
                                                       <TableCell padding="checkbox">
                                                            <Checkbox
                                                                 checked={isSelected}
                                                                 onChange={(event) => {
                                                                      if (
                                                                           event.target.checked
                                                                      ) {
                                                                           onSelectOne?.(
                                                                                customer.id
                                                                           );
                                                                      } else {
                                                                           onDeselectOne?.(
                                                                                customer.id
                                                                           );
                                                                      }
                                                                 }}
                                                            />
                                                       </TableCell>

                                                       <TableCell>
                                                            <Stack
                                                                 alignItems="center"
                                                                 direction="row"
                                                                 spacing={2}
                                                            >
                                                                 <Avatar
                                                                      src={avatar}
                                                                      alt={
                                                                           customer.full_name ||
                                                                           'Klijent'
                                                                      }
                                                                 >
                                                                      {getInitials(
                                                                           customer.full_name ||
                                                                           customer.email ||
                                                                           'K'
                                                                      )}
                                                                 </Avatar>

                                                                 <Typography variant="subtitle2">
                                                                      {customer.full_name ||
                                                                           'Nepoznat klijent'}
                                                                 </Typography>
                                                            </Stack>
                                                       </TableCell>

                                                       <TableCell>
                                                            <Typography variant="body2">
                                                                 {customer.email || '—'}
                                                            </Typography>
                                                       </TableCell>

                                                       <TableCell>
                                                            <Typography variant="body2">
                                                                 {customer.phone_number || '—'}
                                                            </Typography>
                                                       </TableCell>

                                                       <TableCell>
                                                            <Typography variant="body2">
                                                                 {fullAddress ||
                                                                      'Adresa nije uneta'}
                                                            </Typography>
                                                       </TableCell>

                                                       <TableCell align="center">
                                                            <Chip
                                                                 label={
                                                                      customer.orders?.[0]?.count ?? 0
                                                                 }
                                                                 size="small"
                                                                 color={
                                                                      customer.orders?.[0]?.count > 0
                                                                           ? 'primary'
                                                                           : 'default'
                                                                 }
                                                                 variant={
                                                                      customer.orders?.[0]?.count > 0
                                                                           ? 'filled'
                                                                           : 'outlined'
                                                                 }
                                                            />
                                                       </TableCell>

                                                       <TableCell>
                                                            <Typography variant="body2">
                                                                 {validCreatedAt
                                                                      ? format(
                                                                           createdAt,
                                                                           'dd.MM.yyyy.'
                                                                      )
                                                                      : '—'}
                                                            </Typography>
                                                       </TableCell>
                                                       <TableCell align="center">
                                                            {isPending &&
                                                                 activeCustomerId === customer.id ? (
                                                                 <CircularProgress size={24} />
                                                            ) : (
                                                                 <ButtonGroup
                                                                      size="small"
                                                                      variant="outlined"
                                                                 >
                                                                      {customer.is_banned ? (
                                                                           <Button
                                                                                color="success"
                                                                                onClick={() =>
                                                                                     handleUnban(customer)
                                                                                }
                                                                           >
                                                                                Odblokiraj
                                                                           </Button>
                                                                      ) : (
                                                                           <Button
                                                                                color="warning"
                                                                                onClick={() =>
                                                                                     handleBan(customer)
                                                                                }
                                                                           >
                                                                                Blokiraj
                                                                           </Button>
                                                                      )}

                                                                      <Button
                                                                           onClick={() =>
                                                                                handlePasswordReset(customer)
                                                                           }
                                                                           disabled={!customer.email}
                                                                      >
                                                                           Resetuj lozinku
                                                                      </Button>
                                                                 </ButtonGroup>
                                                            )}
                                                       </TableCell>

                                                       <TableCell align="right">
                                                            <Button
                                                                 color="error"
                                                                 size="small"
                                                                 variant="outlined"
                                                                 disabled={
                                                                      isPending &&
                                                                      activeCustomerId === customer.id
                                                                 }
                                                                 onClick={() => handleDelete(customer)}
                                                            >
                                                                 Obriši
                                                            </Button>
                                                       </TableCell>
                                                  </TableRow>
                                             );
                                        }
                                   )}

                                   {visibleRows.length === 0 && (
                                        <TableRow>
                                             <TableCell
                                                  colSpan={9}
                                                  align="center"
                                                  sx={{ py: 6 }}
                                             >
                                                  <Typography
                                                       color="text.secondary"
                                                       variant="body2"
                                                  >
                                                       Nema pronađenih klijenata.
                                                  </Typography>
                                             </TableCell>
                                        </TableRow>
                                   )}
                              </TableBody>
                         </Table>
                    </Box>
               </Box>

               <TablePagination
                    component="div"
                    count={count}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={onPageChange}
                    onRowsPerPageChange={onRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    showFirstButton
                    showLastButton
                    labelRowsPerPage="Broj po stranici"
                    sx={{
                         borderTop: 1,
                         borderColor: 'divider',
                    }}
               />
          </Card>
     );
};

CustomersTable.propTypes = {
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
     selected: PropTypes.array,
     sortBy: PropTypes.string,
     sortDir: PropTypes.oneOf(['asc', 'desc']),
};