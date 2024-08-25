import { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';

import { useUpdateEffect } from 'src/hooks/use-update-effect';
import { OrderStatus } from '@/schemas/order';

type TabOptions = {
  label: string;
  value: OrderStatus | 'all';
};


const tabOptions: TabOptions[] = [
  {
    label: 'Sve',
    value: 'all',
  },
  {
    label: 'Otkazano',
    value: 'cancelled',
  },
  {
    label: 'Dostavljeno',
    value: 'delivered',
  },
  {
    label: 'Na čekanju',
    value: 'pending',
  },
  {
    label: 'Poslato',
    value: 'shipped',
  },
];

const sortOptions = [
  {
    label: 'Najnovije',
    value: 'desc',
  },
  {
    label: 'Najsatarije',
    value: 'asc',
  },
];

interface Filters {
  query?: string;
  status?: string;
}

export const OrderListSearch = (props: any) => {
  const {
    onFiltersChange,
    onSortChange,
    // sortBy = 'createdAt',
    sortDir = 'asc',
  } = props;
  const queryRef = useRef<HTMLInputElement>(null);
  const [currentTab, setCurrentTab] = useState('all');
  const [filters, setFilters] = useState<Filters>({
    query: undefined,
    status: undefined,
  });

  const handleFiltersUpdate = useCallback(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  useUpdateEffect(() => {
    handleFiltersUpdate();
  }, []);

  const handleTabsChange = useCallback((event: any, tab: any) => {
    setCurrentTab(tab);
    const status = tab === 'all' ? undefined : tab;

    setFilters((prevState) => ({
      ...prevState,
      status,
    }));
  }, []);

  const handleQueryChange = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    const query = queryRef.current?.value || '';
    setFilters((prevState) => ({
      ...prevState,
      query,
    }));
  }, []);

  const handleSortChange = useCallback(
    (event: any) => {
      const sortDir = event.target.value;
      onSortChange?.(sortDir);
    },
    [onSortChange]
  );

  return (
    <div>
      <Tabs
        indicatorColor="primary"
        onChange={handleTabsChange}
        scrollButtons="auto"
        sx={{ px: 3 }}
        textColor="primary"
        value={currentTab}
        variant="scrollable"
      >
        {tabOptions.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
          />
        ))}
      </Tabs>
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        gap={3}
        sx={{ p: 3 }}
      >
        <Box
          component="form"
          onSubmit={handleQueryChange}
          sx={{ flexGrow: 1 }}
        >
          <OutlinedInput
            defaultValue=""
            fullWidth
            inputProps={{ ref: queryRef }}
            name="orderNumber"
            placeholder="Pretraži po broju porudžbenice"
            startAdornment={
              <InputAdornment position="start">
                <SvgIcon>
                  <SearchMdIcon />
                </SvgIcon>
              </InputAdornment>
            }
          />
        </Box>
        <TextField
          label="Sortiraj po"
          name="sort"
          onChange={handleSortChange}
          select
          SelectProps={{ native: true }}
          value={sortDir}
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </TextField>
      </Stack>
    </div>
  );
};

OrderListSearch.propTypes = {
  onFiltersChange: PropTypes.func,
  onSortChange: PropTypes.func,
  sortBy: PropTypes.string,
  sortDir: PropTypes.oneOf(['asc', 'desc']),
};
