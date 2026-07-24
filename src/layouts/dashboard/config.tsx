import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import StorageIcon from '@mui/icons-material/Storage';
import { SvgIcon } from '@mui/material';

export const items = [
     {
          title: 'Pregled',
          path: '/',
          icon: (
               <SvgIcon fontSize="small">
                    <ChartBarIcon />
               </SvgIcon>
          ),
          disabled: false
     },
     {
          title: 'Klijenti',
          path: '/dashboard/klijenti',
          icon: (
               <SvgIcon fontSize="small">
                    <UsersIcon />
               </SvgIcon>
          ),
          disabled: false
     },
     {
          title: 'Artikli',
          path: '/dashboard/artikli',
          icon: (
               <SvgIcon fontSize="small">
                    <ShoppingBagIcon />
               </SvgIcon>
          ),
          disabled: false
     },
     {
          title: 'Porudžbenice',
          path: '/dashboard/porudzbenice',
          icon: (
               <SvgIcon fontSize="small">
                    <ShoppingCartIcon />
               </SvgIcon>
          ),
          disabled: false
     },
     {
          title: 'Datoteke',
          path: '/dashboard/datoteke',
          icon: (
               <SvgIcon fontSize="small">
                    <StorageIcon />
               </SvgIcon>
          ),
     },
];
