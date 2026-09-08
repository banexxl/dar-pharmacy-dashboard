'use client';

import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';

import { ProductEditForm } from '@/sections/products/product-edit-form';
import { Product } from '@/schemas/product';

interface Props {
     product: Product;
     allManufacturers: any[];
}

const Page = ({ product, allManufacturers }: Props) => {
     const router = useRouter();

     return (
          <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
               <Container maxWidth="xl">
                    <Stack spacing={4}>
                         <div>
                              <Link
                                   color="text.primary"
                                   href="/artikli"
                                   sx={{ alignItems: 'center', display: 'inline-flex' }}
                                   underline="hover"
                              >
                                   <SvgIcon sx={{ mr: 1 }}>
                                        <ArrowLeftIcon />
                                   </SvgIcon>
                                   <Typography variant="subtitle2">Proizvodi</Typography>
                              </Link>
                         </div>
                         <Stack spacing={1}>
                              <Typography variant="h4">
                                   Izmena proizvoda
                              </Typography>
                              <Typography color="text.secondary" variant="body2">
                                   {product.name}
                              </Typography>
                         </Stack>
                         <Card>
                              <ProductEditForm
                                   product={product}
                                   manufacturers={allManufacturers}
                                   onUpdated={() => router.push('/artikli')}
                                   onDeleted={() => router.push('/artikli')}
                                   showCancelButton
                                   cancelLabel="Nazad na listu"
                                   onCancel={() => router.push('/artikli')}
                              />
                         </Card>
                    </Stack>
               </Container>
          </Box>
     );
};

export default Page;
