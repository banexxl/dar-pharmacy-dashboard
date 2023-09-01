import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Avatar, Box, Card, Checkbox, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

export const ProductsTable = (props) => {
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

          return (
                    <Card>
                              <Scrollbar>
                                        <Box sx={{ minWidth: 800 }}>
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
                                                                                          Naziv
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                          Glavna Kategorija
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                          Pod Kategorija
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                          Sub Kategorija
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                          Na stanju
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                          Količina
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                          Proizvođač
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                          Cena
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                          Na popustu
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                          Popust
                                                                                </TableCell>
                                                                      </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                      {items.map((product) => {
                                                                                const isSelected = selected.includes(product._id);

                                                                                return (
                                                                                          <TableRow
                                                                                                    hover
                                                                                                    key={product._id}
                                                                                                    selected={isSelected}
                                                                                          >
                                                                                                    <TableCell padding="checkbox">
                                                                                                              <Checkbox
                                                                                                                        checked={isSelected}
                                                                                                                        onChange={(event) => {
                                                                                                                                  if (event.target.checked) {
                                                                                                                                            onSelectOne?.(product._id);
                                                                                                                                  } else {
                                                                                                                                            onDeselectOne?.(product._id);
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
                                                                                                                        <Typography variant="subtitle2">
                                                                                                                                  {product.name}
                                                                                                                        </Typography>
                                                                                                              </Stack>
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              {product.mainCategory}
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              {product.midCategory}
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              {product.subCategory}
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              {product.availableStock}
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              {product.quantity}
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              {product.manufacturer}
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              {product.price}
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              {product.discount}
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                              {product.discountAmount}
                                                                                                    </TableCell>
                                                                                          </TableRow>
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
