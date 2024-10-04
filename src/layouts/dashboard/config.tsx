import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
import CogIcon from '@heroicons/react/24/solid/CogIcon';
import LockClosedIcon from '@heroicons/react/24/solid/LockClosedIcon';
import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import UserIcon from '@heroicons/react/24/solid/UserIcon';
import UserPlusIcon from '@heroicons/react/24/solid/UserPlusIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import StorageIcon from '@mui/icons-material/Storage';
import { SvgIcon } from '@mui/material';
import path from 'path';

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
          title: 'Kanban',
          path: '/dashboard/kanban',
          icon: (
               <SvgIcon fontSize="small">
                    <AssignmentTurnedInIcon />
               </SvgIcon>
          ),
     },
     {
          title: 'Datoteke',
          path: '/dashboard/datoteke',
          icon: (
               <SvgIcon fontSize="small">
                    <StorageIcon />
               </SvgIcon>
          ),
     }
];
