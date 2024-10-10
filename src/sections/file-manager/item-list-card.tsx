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
import { useRouter } from 'next/router';
import { create } from 'lodash';

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

  const handleDoubleClick = (item: any) => {
    if (item.type === 'folder') {
      // Get the current 'putanja' query parameter
      const currentPath = router.query.putanja || '';
      const newPath = currentPath ? `${currentPath}/${item.name}` : item.name; // Append the folder name

      // Navigate to the new path with the updated query
      router.push({
        pathname: router.pathname, // Keep the same path
        query: { ...router.query, putanja: newPath }, // Update the query parameter
      });
    } else {
      onOpen?.(item.id); // Open the file
    }
  };

  const createdAt = item.createdAt && format(item.createdAt, 'MMM dd, yyyy');

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
        {/* <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={3}
          sx={{
            pt: 2,
            px: 2,
          }}
        >
          <IconButton onClick={() => onFavorite?.(item.id, !item.isFavorite)}>
            <SvgIcon
              fontSize="small"
              sx={{ color: item.isFavorite ? 'warning.main' : 'action.active' }}
            >
              <Star01Icon />
            </SvgIcon>
          </IconButton>
          <IconButton
            onClick={popover.handleOpen}
            ref={popover.anchorRef}
          >
            <SvgIcon fontSize="small">
              <DotsVerticalIcon />
            </SvgIcon>
          </IconButton>
        </Stack> */}
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
            {/* <div>
              {item.isPublic && (
                <Tooltip title="Public">
                  <Avatar
                    sx={{
                      height: 32,
                      width: 32,
                    }}
                  >
                    <SvgIcon fontSize="small">
                      <Globe01Icon />
                    </SvgIcon>
                  </Avatar>
                </Tooltip>
              )}
              {showShared && (
                <AvatarGroup max={3}>
                  {item.shared?.map((person) => (
                    <Avatar
                      key={person.name}
                      src={person.avatar}
                      sx={{
                        height: 32,
                        width: 32,
                      }}
                    />
                  ))}
                </AvatarGroup>
              )}
            </div> */}
          </Stack>
          <Typography
            color="text.secondary"
            variant="caption"
          >
            Created at {createdAt}
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
