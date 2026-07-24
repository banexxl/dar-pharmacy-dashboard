import PropTypes from 'prop-types';
import { format } from 'date-fns';
import {
     Avatar,
     Box,
     Card,
     Checkbox,
     Stack,
     Table,
     TableBody,
     TableCell,
     TableHead,
     TablePagination,
     TableRow,
     Typography
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import Image from 'next/image';
import { useMemo } from 'react';
import { ICustomer } from '@/schemas/customer';
import { getComparator } from '../order/order-list-table';
import { getInitials } from '@/utils/get-initials';

export const CustomersTable = (props: any) => {
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
          selected = [],
          sortDir = 'desc',
          sortBy = 'name',
     } = props;

     const selectedSome = (selected.length > 0) && (selected.length < items.length);
     const selectedAll = (items.length > 0) && (selected.length === items.length);

     const visibleRows = useMemo(
          () =>
               [...items]
                    // .filter((customer: ICustomer) =>
                    //      !searchQuery || customer.name.toLowerCase().includes(searchQuery.toLowerCase())
                    // )
                    .sort(getComparator(sortDir, sortBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
          [items, page, rowsPerPage],
     );

     return (
          <Card>
               <Scrollbar>
                    <Box sx={{ minWidth: 800 }
                    }>
                         <Table>
                              <TableHead>
                                   <TableRow>
                                        <TableCell padding="checkbox" >
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
                                             Name
                                        </TableCell>
                                        <TableCell>
                                             Email
                                        </TableCell>
                                        <TableCell>
                                             Image
                                        </TableCell>
                                   </TableRow>
                              </TableHead>
                              <TableBody>
                                   {
                                        visibleRows.map((customer: ICustomer) => {
                                             const isSelected = selected.includes(customer.id);

                                             return (
                                                  <TableRow
                                                       hover
                                                       key={customer.id}
                                                       selected={isSelected}
                                                  >
                                                       <TableCell padding="checkbox" >
                                                            <Checkbox
                                                                 checked={isSelected}
                                                                 onChange={(event) => {
                                                                      if (event.target.checked) {
                                                                           onSelectOne?.(customer.id);
                                                                      } else {
                                                                           onDeselectOne?.(customer.id);
                                                                      }
                                                                 }
                                                                 }
                                                            />
                                                       </TableCell>
                                                       < TableCell >
                                                            <Stack
                                                                 alignItems="center"
                                                                 direction="row"
                                                                 spacing={2}
                                                            >
                                                                 <Avatar src={customer.avatar || customer.avatar} >
                                                                      {getInitials(customer.avatar || customer.name)
                                                                      }
                                                                 </Avatar>
                                                                 < Typography variant="subtitle2" >
                                                                      {customer.name || customer.name}
                                                                 </Typography>
                                                            </Stack>
                                                       </TableCell>
                                                       <TableCell>
                                                            {customer.email}
                                                       </TableCell>
                                                       < TableCell >
                                                            <Image
                                                                 src={
                                                                      customer.gender == 'male' ? '/assets/avatars/avatar-omar-darboe.png' :
                                                                           customer.gender == 'female' ? '/assets/avatars/avatar-neha-punita.png' :
                                                                                '/assets/avatars/avatar-omar-darboe.png'
                                                                 }
                                                                 width={80}
                                                                 height={80}
                                                                 alt='image'
                                                                 style={{ borderRadius: '50%' }}
                                                            />
                                                       </TableCell>
                                                  </TableRow>
                                             );
                                        })}
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
     selected: PropTypes.array
};
