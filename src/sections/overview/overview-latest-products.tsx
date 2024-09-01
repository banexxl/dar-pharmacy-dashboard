import { formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from 'next/link';
import { IProduct } from '../products/products-table';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  SvgIcon
} from '@mui/material';
import { indigo } from '@/theme/colors';


export const OverviewLatestProducts = (props: any) => {

  const { products = [], sx } = props;

  return (
    <Card sx={sx}>
      <CardHeader title="Poslednje dodati artikli" />
      <List>
        {products.map((product: IProduct, index: number) => {
          const hasDivider = index < products.length - 1;
          // Convert updatedAt to a Date object
          const updatedAtDate = new Date(product.updatedAt!);
          const ago = formatDistanceToNow(updatedAtDate);

          return (
            <ListItem
              divider={hasDivider}
              key={product._id}
            >
              <ListItemAvatar>
                {
                  product.imageURL
                    ? (
                      <Box
                        component="img"
                        src={product.imageURL}
                        sx={{
                          borderRadius: 1,
                          height: 48,
                          width: 48
                        }}
                      />
                    )
                    : (
                      <Box
                        sx={{
                          borderRadius: 1,
                          backgroundColor: 'neutral.200',
                          height: 48,
                          width: 48
                        }}
                      />
                    )
                }
              </ListItemAvatar>
              <ListItemText
                primary={product.name}
                primaryTypographyProps={{ variant: 'subtitle1' }}
                secondary={`Izmenjen ${ago} ago`}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
              <IconButton edge="end">
                <Link href={'/dashboard/artikli/'} style={{ textDecoration: 'none', color: indigo.main }}>
                  <SvgIcon>
                    <OpenInNewIcon />
                  </SvgIcon>
                </Link>
              </IconButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={(
            <SvgIcon fontSize="small" style={{ textDecoration: 'none', color: indigo.main }}>
              <ArrowRightIcon />
            </SvgIcon>
          )}
          size="small"
          variant="text"
        >
          <Link href={'/dashboard/artikli'} style={{ textDecoration: 'none', color: indigo.main }}>
            Pogledaj sve
          </Link>
        </Button>
      </CardActions>
    </Card>
  );
};

OverviewLatestProducts.propTypes = {
  products: PropTypes.array,
  sx: PropTypes.object
};
