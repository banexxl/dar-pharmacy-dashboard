import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import type { OrderItem } from '@/schemas/order';

interface OrderItemsProps {
  items: OrderItem[];
}

export const OrderItems = ({ items, ...other }: OrderItemsProps & Record<string, any>) => {
  return (
    <Card {...other}>
      <CardHeader title="Stavke porudžbenice" />
      <Scrollbar>
        <Box sx={{ minWidth: 700 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Naziv</TableCell>
                <TableCell align="center">Količina</TableCell>
                <TableCell align="right">Cena po kom.</TableCell>
                <TableCell align="center">Popust %</TableCell>
                <TableCell align="right">Konačna cena</TableCell>
                <TableCell align="right">Ukupno</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Nema stavki u ovoj porudžbenici.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const lineTotal = (item.final_unit_price * item.count).toFixed(2);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        {item.manufacturer_name && (
                          <Typography color="text.secondary" variant="body2">
                            {item.manufacturer_name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">{item.count}</TableCell>
                      <TableCell align="right">{item.unit_price} RSD</TableCell>
                      <TableCell align="center">
                        {item.discount ? `${item.discount_amount}%` : '-'}
                      </TableCell>
                      <TableCell align="right">{item.final_unit_price} RSD</TableCell>
                      <TableCell align="right">{lineTotal} RSD</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
    </Card>
  );
};

OrderItems.propTypes = {
  items: PropTypes.array.isRequired,
};
