import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import {
     Card,
     InputAdornment,
     OutlinedInput,
     SvgIcon,
} from '@mui/material';
import type { ChangeEvent } from 'react';

type CustomersSearchProps = {
     query: string;
     onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const CustomersSearch = ({
     query,
     onQueryChange,
}: CustomersSearchProps) => (
     <Card sx={{ p: 2 }}>
          <OutlinedInput
               value={query}
               onChange={onQueryChange}
               fullWidth
               placeholder="Pretraži klijente"
               startAdornment={
                    <InputAdornment position="start">
                         <SvgIcon
                              color="action"
                              fontSize="small"
                         >
                              <MagnifyingGlassIcon />
                         </SvgIcon>
                    </InputAdornment>
               }
               sx={{ maxWidth: 500 }}
          />
     </Card>
);