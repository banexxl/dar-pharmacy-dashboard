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
     Typography,
} from '@mui/material';
import { useMemo, useState, useTransition } from 'react';
import { Customer } from '@/schemas/customer';
import { getComparator } from '../order/order-list-table';
import { getInitials } from '@/utils/get-initials';
import { banCustomer, deleteCustomer, sendCustomerPasswordReset, unbanCustomer } from '@/app/(dashboard)/klijenti/actions';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

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
          sortDir = 'desc',
          sortBy = 'full_name',
     } = props;

     const router = useRouter();
     const [isPending, startTransition] = useTransition();
     const [activeCustomerId, setActiveCustomerId] =
          useState<string | null>(null);

     const selectedSome =
          selected.length > 0 &&
          selected.length < items.length;

     const selectedAll =
          items.length > 0 &&
          selected.length === items.length;

     const visibleRows = useMemo(() => {
          const normalizedSortBy =
               sortBy === 'name'
                    ? 'full_name'
                    : sortBy;

          return [...items]
               .sort(
                    getComparator(
                         sortDir,
                         normalizedSortBy
                    )
               )
               .slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
               );
     }, [
          items,
          page,
          rowsPerPage,
          sortBy,
          sortDir,
     ]);

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

                                        <TableCell>
                                             Klijent
                                        </TableCell>

                                        <TableCell>
                                             Email
                                        </TableCell>

                                        <TableCell>
                                             Telefon
                                        </TableCell>

                                        <TableCell>
                                             Adresa
                                        </TableCell>

                                        <TableCell align="center">
                                             Broj porudžbina
                                        </TableCell>

                                        <TableCell>
                                             Datum registracije
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