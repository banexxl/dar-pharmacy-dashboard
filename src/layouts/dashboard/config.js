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
          title: 'Overview',
          path: '/',
          icon: (
               <SvgIcon fontSize="small">
                    <ChartBarIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Customers',
          path: '/dashboard/customers?page=0&limit=5',
          icon: (
               <SvgIcon fontSize="small">
                    <UsersIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Products',
          path: '/dashboard/products?page=0&limit=5',
          icon: (
               <SvgIcon fontSize="small">
                    <ShoppingBagIcon />
               </SvgIcon>
          )
     },
     {
          title: 'Orders',
          path: '/dashboard/orders?page=0&limit=5',
          icon: (
               <SvgIcon fontSize="small">
                    <ShoppingCartIcon />
               </SvgIcon>
          )
     },
];
