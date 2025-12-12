import type { FC } from 'react';
import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Globe01Icon from '@untitled-ui/icons-react/build/esm/Globe03';
import Star01Icon from '@untitled-ui/icons-react/build/esm/Star01';
import DotsVerticalIcon from '@untitled-ui/icons-react/build/esm/DotsVertical';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { usePopover } from 'src/hooks/use-popover';

import { ItemIcon } from './item-icon';
import { ItemMenu } from './item-menu';
import { Item } from '@/schemas/file-manager';
import { bytesToSize } from '@/utils/bytes-to-size';

interface ItemListRowProps {
  item: Item;
  onDelete?: (itemId: string) => void;
  onFavorite?: (itemId: string, value: boolean) => void;
  onOpen?: (itemId: string) => void;
}

export const ItemListRow: FC<ItemListRowProps> = (props) => {
  const { item, onDelete, onOpen } = props;
  const popover = usePopover();

  const handleDelete = useCallback((): void => {
    popover.handleClose();
    onDelete?.(item.id);
  }, [item, popover, onDelete]);

  let size = bytesToSize(item.size);

  if (item.type === 'folder') {
    size += `• ${item.itemsCount} items`;
  }

  const updatedAt = item.updatedAt && format(item.updatedAt, 'MMM dd, yyyy');

  return (
    <>
      <TableRow
        key={item.id}
        sx={{
          backgroundColor: 'transparent',
          borderRadius: 1.5,
          boxShadow: 0,
          transition: (theme) =>
            theme.transitions.create(['background-color', 'box-shadow'], {
              easing: theme.transitions.easing.easeInOut,
              duration: 200,
            }),
          '&:hover': {
            backgroundColor: 'background.paper',
            boxShadow: 16,
          },
          [`& .${tableCellClasses.root}`]: {
            borderBottomWidth: 1,
            borderBottomColor: 'divider',
            borderBottomStyle: 'solid',
            borderTopWidth: 1,
            borderTopColor: 'divider',
            borderTopStyle: 'solid',
            '&:first-of-type': {
              borderTopLeftRadius: (theme) => {
                const radius = typeof theme.shape.borderRadius === 'number'
                  ? theme.shape.borderRadius
                  : parseFloat(theme.shape.borderRadius);
                return radius * 1.5;
              },
              borderBottomLeftRadius: (theme) => {
                const radius = typeof theme.shape.borderRadius === 'number'
                  ? theme.shape.borderRadius
                  : parseFloat(theme.shape.borderRadius);
                return radius * 1.5;
              },
              borderLeftWidth: 1,
              borderLeftColor: 'divider',
              borderLeftStyle: 'solid',
            },
            '&:last-of-type': {
              borderTopRightRadius: (theme) => {
                const radius = typeof theme.shape.borderRadius === 'number'
                  ? theme.shape.borderRadius
                  : parseFloat(theme.shape.borderRadius);
                return radius * 1.5;
              },
              borderBottomRightRadius: (theme) => {
                const radius = typeof theme.shape.borderRadius === 'number'
                  ? theme.shape.borderRadius
                  : parseFloat(theme.shape.borderRadius);
                return radius * 1.5;
              },
              borderRightWidth: 1,
              borderRightColor: 'divider',
              borderRightStyle: 'solid',
            },
          },
        }}
      >
        <TableCell>
          <Stack
            alignItems="center"
            direction="row"
            spacing={2}
          >
            <Box
              onClick={() => onOpen?.(item.id)}
              sx={{ cursor: 'pointer' }}
            >
              <ItemIcon
                type={item.type}
                extension={item.extension}
              />
            </Box>
            <div>
              <Typography
                noWrap
                onClick={() => onOpen?.(item.id)}
                sx={{ cursor: 'pointer' }}
                variant="subtitle2"
              >
                {item.name}
              </Typography>
              <Typography
                color="text.secondary"
                noWrap
                variant="body2"
              >
                {size}
              </Typography>
            </div>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography
            noWrap
            variant="subtitle2"
          >
            Updated at
          </Typography>
          <Typography
            color="text.secondary"
            noWrap
            variant="body2"
          >
            {updatedAt}
          </Typography>
        </TableCell>
        {/* <TableCell>
          <Box sx={{ display: 'flex' }}>
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
          </Box>
        </TableCell> */}
        {/* <TableCell align="right">
          <IconButton onClick={() => onFavorite?.(item.id, !item.isFavorite)}>
            <SvgIcon
              fontSize="small"
              sx={{ color: item.isFavorite ? 'warning.main' : 'action.active' }}
            >
              <Star01Icon />
            </SvgIcon>
          </IconButton>
        </TableCell> */}
        <TableCell align="right">
          <IconButton
            onClick={popover.handleOpen}
            ref={popover.anchorRef}
          >
            <SvgIcon fontSize="small">
              <DotsVerticalIcon />
            </SvgIcon>
          </IconButton>
        </TableCell>
      </TableRow>
      <ItemMenu
        anchorEl={popover.anchorRef.current}
        onClose={popover.handleClose}
        onDelete={handleDelete}
        open={popover.open}
      />
    </>
  );
};

ItemListRow.propTypes = {
  // @ts-ignore
  item: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  onFavorite: PropTypes.func,
  onOpen: PropTypes.func,
};
