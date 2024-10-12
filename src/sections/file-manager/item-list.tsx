import type { ChangeEvent, FC, MouseEvent } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TablePagination from '@mui/material/TablePagination';

import { Scrollbar } from 'src/components/scrollbar';
import { ItemListCard } from './item-list-card';
import { ItemListRow } from './item-list-row';
import { Item } from '@/schemas/file-manager';
import { TableCell, TableRow, Typography } from '@mui/material';

type View = 'grid' | 'list';

interface ItemListProps {
  count?: number;
  items?: Item[];
  onDelete?: (itemId: string) => void;
  onFavorite?: (itemId: string, value: boolean) => void;
  onOpen?: (itemId: string) => void;
  onOpenFolder?: (folderName: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  page?: number;
  rowsPerPage?: number;
  view?: View;
}

export const ItemList: FC<ItemListProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDelete,
    onFavorite,
    onOpen,
    onOpenFolder,
    onPageChange = () => { },
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
    view = 'grid',
  } = props;
  let content: JSX.Element;
  console.log('items', items);

  if (view === 'grid') {
    content = (
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: 'repeat(3, 1fr)',
        }}
      >
        {items && items.length > 0 ? (
          items.map((item) => (
            <ItemListCard
              key={item.id}
              item={item}
              onDelete={onDelete}
              onOpenFolder={onOpenFolder}
              // onFavorite={onFavorite}
              onOpen={onOpen}
            />
          ))
        ) : (
          <Typography variant="caption">Prazan folder...</Typography>
        )}
      </Box>
    );
  } else {
    // Negative margin is a fix for the box shadow. The virtual scrollbar cuts it.
    content = (
      <Box sx={{ m: -3 }}>
        <Scrollbar>
          <Box sx={{ p: 3 }}>
            <Table
              sx={{
                minWidth: 600,
                borderCollapse: 'separate',
                borderSpacing: '0 8px',
              }}
            >
              <TableBody>
                {items && items.length > 0 ? (
                  items.map((item) => (
                    <ItemListRow
                      key={item.id}
                      item={item}
                      onDelete={onDelete}
                      onFavorite={onFavorite}
                      onOpen={onOpen}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="caption">Prazan folder...</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Scrollbar>
      </Box>
    );
  }


  return (
    <Stack spacing={4}>
      {content}
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[6, 9, 12, 15, 18]}
      />
    </Stack>
  );
};

ItemList.propTypes = {
  items: PropTypes.array,
  count: PropTypes.number,
  onDelete: PropTypes.func,
  onFavorite: PropTypes.func,
  onOpen: PropTypes.func,
  onOpenFolder: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  view: PropTypes.oneOf<View>(['grid', 'list']),
};
