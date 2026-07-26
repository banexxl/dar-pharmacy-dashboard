'use client';

import PropTypes from 'prop-types';
import { format } from 'date-fns';
import {
     Avatar,
     Box,
     Card,
     Checkbox,
     Chip,
     Stack,
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableRow,
     Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { Scrollbar } from '@/components/scrollbar';
import { Customer } from '@/schemas/customer';
import { getComparator } from '../order/order-list-table';
import { getInitials } from '@/utils/get-initials';

export const CustomersTable = (props: any) => {
     const {
          items = [],
          onDeselectAll,
          onDeselectOne,
          onSelectAll,
          onSelectOne,
          page = 0,
          rowsPerPage = 5,
          selected = [],
          sortDir = 'desc',
          sortBy = 'full_name',
     } = props;

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

     return (
          <Card>
               <Scrollbar>
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
                                                  </TableRow>
                                             );
                                        }
                                   )}

                                   {visibleRows.length === 0 && (
                                        <TableRow>
                                             <TableCell
                                                  colSpan={7}
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
               </Scrollbar>
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