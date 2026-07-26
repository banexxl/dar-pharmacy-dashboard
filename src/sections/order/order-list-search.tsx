import { useCallback } from 'react';
import type {
  ChangeEvent,
  SyntheticEvent,
} from 'react';
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

import type { OrderStatus } from '@/schemas/order';
import type { SortDir } from '@/sections/order/order-list-table';

type TabValue = OrderStatus | 'all';

type TabOption = {
  label: string;
  value: TabValue;
};

type OrderListSearchProps = {
  onQueryChange?: (query: string) => void;
  onSortChange?: (sortDir: SortDir) => void;
  onTabChange?: (tab: string) => void;
  sortBy?: string;
  sortDir?: SortDir;
  tab?: string;
  query?: string;
};

const tabOptions: TabOption[] = [
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

const sortOptions: Array<{
  label: string;
  value: SortDir;
}> = [
    {
      label: 'Najnovije',
      value: 'desc',
    },
    {
      label: 'Najstarije',
      value: 'asc',
    },
  ];

export const OrderListSearch = ({
  onQueryChange,
  onSortChange,
  onTabChange,
  sortDir = 'desc',
  tab = 'all',
  query = '',
}: OrderListSearchProps) => {
  const handleQueryChange = useCallback(
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) => {
      onQueryChange?.(event.target.value);
    },
    [onQueryChange]
  );

  const handleSortChange = useCallback(
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) => {
      onSortChange?.(event.target.value as SortDir);
    },
    [onSortChange]
  );

  const handleTabsChange = useCallback(
    (_event: SyntheticEvent, value: TabValue) => {
      onTabChange?.(value);
    },
    [onTabChange]
  );

  return (
    <div>
      <Tabs
        indicatorColor="primary"
        onChange={handleTabsChange}
        scrollButtons="auto"
        sx={{ px: 3 }}
        textColor="primary"
        value={tab}
        variant="scrollable"
      >
        {tabOptions.map((option) => (
          <Tab
            key={option.value}
            label={option.label}
            value={option.value}
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
        <Box sx={{ flexGrow: 1 }}>
          <OutlinedInput
            value={query}
            onChange={handleQueryChange}
            fullWidth
            name="query"
            placeholder="Pretraži porudžbenice"
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
  onQueryChange: PropTypes.func,
  onTabChange: PropTypes.func,
  onSortChange: PropTypes.func,
  sortBy: PropTypes.string,
  sortDir: PropTypes.oneOf(['asc', 'desc']),
  tab: PropTypes.oneOf([
    'all',
    'cancelled',
    'delivered',
    'pending',
    'shipped',
  ]),
  query: PropTypes.string,
};