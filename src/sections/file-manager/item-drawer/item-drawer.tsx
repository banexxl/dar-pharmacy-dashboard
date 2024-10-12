import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Star01Icon from '@untitled-ui/icons-react/build/esm/Star01';
import Trash02Icon from '@untitled-ui/icons-react/build/esm/Trash02';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Avatar from '@mui/material/Avatar';
import { backdropClasses } from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { ItemIcon } from '../item-icon';
import { ItemTags } from './item-tags';
import { ItemShared } from './item-shared';
import { bytesToSize } from '@/utils/bytes-to-size';
import { Item } from '@/schemas/file-manager';
import sweetalert2 from 'sweetalert2';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface ItemDrawerProps {
  item?: Item;
  onClose?: () => void;
  onDelete?: (itemId: string) => void;
  onFavorite?: (itemId: string, value: boolean) => void;
  onTagsChange?: (itemId: string, value: string[]) => void;
  open?: boolean;
}

export const ItemDrawer: FC<ItemDrawerProps> = (props) => {
  const { item, onClose, onDelete, onFavorite, onTagsChange, open = false } = props;
  let content: JSX.Element | null = null;
  console.log('item', item);

  const onDeleteClick = (item: Item) => {
    onClose?.()
    sweetalert2.fire({
      title: 'Upozorenje!',
      text: "Da li stvarno želite da obrišete datoteku?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Da!',
      cancelButtonText: 'Ne!',
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        try {

          onDelete?.(item.id)
          toast.success('Datoteka uspešno obrisana!')
        } catch (error) {
          console.error('Error deleting file:', error)
          onClose?.()
          toast.error('Greška prilikom brisanja datoteke!')
        }
      }
    })
  }

  if (item) {
    const size = bytesToSize(item.size);
    const updatedAt = item.updatedAt && format(item.updatedAt, 'MMM dd, yyyy HH:mm');

    content = (
      <div>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="flex-end"
          spacing={2}
          sx={{ p: 3 }}
        >
          <IconButton onClick={onClose}>
            <SvgIcon fontSize="small">
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
        <Divider />
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{ my: 2, px: 3 }}
        >
          <Typography variant="h6" sx={{ width: '300px', textAlign: 'center' }}>
            Kliknite na ikonu da biste preuzeli datoteku
          </Typography>
        </Stack>
        <Box
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'neutral.500' : 'neutral.300',
              borderRadius: 1,
              borderStyle: 'dashed',
              borderWidth: 1,
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
              p: 3,
            }}
          >
            <Link href={`https://dar-pharmacy.s3.eu-central-1.amazonaws.com/${item.id}`} passHref target="_blank">
              <ItemIcon
                type={item.type}
                extension={item.extension}
              />
            </Link>
          </Box>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">{item.name}</Typography>
            <IconButton>
              <SvgIcon fontSize="small">
                <Edit02Icon />
              </SvgIcon>
            </IconButton>
          </Stack>
          <Grid
            container
            spacing={3}
          >

            <Grid
              xs={12}
              sm={4}
            >
              <Typography
                color="text.secondary"
                variant="caption"
              >
                Size
              </Typography>
            </Grid>
            <Grid
              xs={12}
              sm={8}
            >
              <Typography variant="body2">{size}</Typography>
            </Grid>
            <Grid
              xs={12}
              sm={4}
            >
              <Typography
                color="text.secondary"
                variant="caption"
              >
                Updated at
              </Typography>
            </Grid>
            <Grid
              xs={12}
              sm={8}
            >
              <Typography variant="body2">{updatedAt}</Typography>
            </Grid>
            <Grid
              xs={12}
              sm={4}
            >
              <Typography
                color="text.secondary"
                variant="caption"
              >
                Actions
              </Typography>
            </Grid>
            <Grid
              xs={12}
              sm={8}
            >
              <IconButton onClick={() => onDeleteClick(item)}>
                <SvgIcon fontSize="small">
                  <Trash02Icon />
                </SvgIcon>
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      </div>
    );
  }



  return (
    <Drawer
      anchor="right"
      ModalProps={{
        sx: {
          [`& .${backdropClasses.root}`]: {
            background: 'transparent !important',
          },
        },
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          maxWidth: '100%',
          width: 400,
        },
      }}
    >
      {content}
    </Drawer>
  );
};

ItemDrawer.propTypes = {
  // @ts-ignore
  item: PropTypes.object,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  onFavorite: PropTypes.func,
  onTagsChange: PropTypes.func,
  open: PropTypes.bool,
};
