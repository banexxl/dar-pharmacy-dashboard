import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import ClearIcon from '@mui/icons-material/Clear';
import {
     Alert,
     Card,
     IconButton,
     InputAdornment,
     OutlinedInput,
     Stack,
     SvgIcon,
} from '@mui/material';
import type { ChangeEvent } from 'react';

type CustomersSearchProps = {
     query: string;
     onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void;
     onClear: () => void;
};

export const CustomersSearch = ({
     query,
     onQueryChange,
     onClear,
}: CustomersSearchProps) => (
     <Card sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
               <OutlinedInput
                    value={query}
                    onChange={onQueryChange}
                    placeholder="Pretraži klijente..."
                    startAdornment={
                         <InputAdornment position="start">
                              <SvgIcon color="action" fontSize="small">
                                   <MagnifyingGlassIcon />
                              </SvgIcon>
                         </InputAdornment>
                    }
                    endAdornment={
                         query ? (
                              <InputAdornment position="end">
                                   <IconButton size="small" onClick={onClear}>
                                        <ClearIcon fontSize="small" />
                                   </IconButton>
                              </InputAdornment>
                         ) : null
                    }
                    sx={{ maxWidth: 400, flexGrow: 1 }}
               />
               <Alert severity="info" sx={{ py: 0.5 }}>
                    Pretraga pretražuje po imenu, email-u, broju telefona, adresi i datumu registracije.
               </Alert>
          </Stack>
     </Card>
);
