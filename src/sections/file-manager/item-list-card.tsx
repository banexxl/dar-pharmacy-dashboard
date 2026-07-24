import type { FC } from 'react';
import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Star01Icon from '@untitled-ui/icons-react/build/esm/Star01';
import DotsVerticalIcon from '@untitled-ui/icons-react/build/esm/DotsVertical';
import Globe01Icon from '@untitled-ui/icons-react/build/esm/Globe03';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { usePopover } from 'src/hooks/use-popover';

import { ItemIcon } from './item-icon';
import { ItemMenu } from './item-menu';
import { Item } from '@/schemas/file-manager';
import { bytesToSize } from '@/utils/bytes-to-size';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface ItemListCardProps {
  item: Item;
  onDelete?: (itemId: string) => void;
  // onFavorite?: (itemId: string, value: boolean) => void;
  onOpenFolder?: (folderId: string) => void;
  onOpen?: (itemId: string) => void;
}

export const ItemListCard: FC<ItemListCardProps> = (props) => {
  const { item, onDelete, onOpenFolder, onOpen } = props;
  const popover = usePopover();

  const handleDelete = useCallback((): void => {
    popover.handleClose();
    onDelete?.(item.id);
  }, [item, popover, onDelete]);

  let size = bytesToSize(item.size);

  if (item.type === 'folder') {
    size += `• ${item.itemsCount} items`;
  }

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()!;

  const handleDoubleClick = (item: any) => {
    if (item.type === 'folder') {
      // Get the current 'putanja' query parameter
      const currentPath = searchParams.get('putanja') || '';
      const newPath = currentPath ? `${currentPath}/${item.name}` : item.name; // Append the folder name

      const params = new URLSearchParams(searchParams.toString());
      params.set('putanja', newPath);
      router.push(`${pathname}?${params.toString()}`);
    } else {
      onOpen?.(item.id); // Open the file
    }
  };

  const updatedAt = item.updatedAt && format(item.updatedAt, 'MMM dd, yyyy');

  return (
    <>
      <Card
        key={item.id}
        sx={{
          cursor: 'pointer',
          backgroundColor: 'transparent',
          boxShadow: 0,
          transition: (theme) =>
            theme.transitions.create(['background-color, box-shadow'], {
              easing: theme.transitions.easing.easeInOut,
              duration: 200,
            }),
          '&:hover': {
            backgroundColor: 'background.paper',
            boxShadow: 16,
          },
        }}
        variant="outlined"
        onDoubleClick={() => handleDoubleClick(item)}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              mb: 1,
            }}
          >
            <Box
              onClick={() => onOpen?.(item.id)}
              sx={{
                display: 'inline-flex',
                cursor: 'pointer',
              }}
            >
              <ItemIcon
                type={item.type}
                extension={item.extension}
              />
            </Box>
          </Box>
          <Typography
            onClick={() => onOpen?.(item.id)}
            sx={{ cursor: 'pointer' }}
            variant="subtitle2"
          >
            {item.name}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={1}
          >
            <div>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                {size}
              </Typography>
            </div>

          </Stack>
          <Typography
            color="text.secondary"
            variant="caption"
          >
            Updated at {updatedAt}
          </Typography>
        </Box>
      </Card>
      <ItemMenu
        anchorEl={popover.anchorRef.current}
        onClose={popover.handleClose}
        onDelete={handleDelete}
        open={popover.open}
      />
    </>
  );
};

ItemListCard.propTypes = {
  // @ts-ignore
  item: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  onFavorite: PropTypes.func,
  onOpen: PropTypes.func,
  onOpenFolder: PropTypes.func,
};
