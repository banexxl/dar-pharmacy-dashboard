import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
import CogIcon from '@heroicons/react/24/solid/CogIcon';
import LockClosedIcon from '@heroicons/react/24/solid/LockClosedIcon';
import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import UserIcon from '@heroicons/react/24/solid/UserIcon';
import UserPlusIcon from '@heroicons/react/24/solid/UserPlusIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import { SvgIcon } from '@mui/material';

export const items = [
     {
          title: 'Pregled',
          path: '/',
          icon: (
               <SvgIcon fontSize="small">
                    <ChartBarIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Klijenti',
          path: '/dashboard/klijent?page=0&limit=5',
          icon: (
               <SvgIcon fontSize="small">
                    <UsersIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Artikli',
          path: '/dashboard/artikli?page=0&limit=5',
          icon: (
               <SvgIcon fontSize="small">
                    <ShoppingBagIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Porudžbenice',
          path: '/dashboard/porudzbenice?page=0&limit=5',
          icon: (
               <SvgIcon fontSize="small">
                    <ShoppingCartIcon />
               </SvgIcon>
          )
     },
];
