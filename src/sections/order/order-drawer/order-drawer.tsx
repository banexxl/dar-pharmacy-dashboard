import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { OrderDetails } from './order-details';
import { OrderEdit } from './order-edit';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

export const OrderDrawer = (props: any) => {
  const { container, onClose, open, order } = props;
  const [isEditing, setIsEditing] = useState(false);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const router = useRouter();

  const handleEditOpen = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleEditSave = async (values: any) => {
    const orderObejct = {
      address: values.address,
      country: values.country,
      city: values.city,
      status: values.status,
      orderNumber: props.order.orderNumber
    }

    try {
      await fetch(`/api/orders-api/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',  // Set the Content-Type header
        },
        body: JSON.stringify(orderObejct),  // Convert the values to a JSON string
      })
        .then((res) => res.json())
        .then((data) => {
          setIsEditing(false);
          if (data.message === 'Order updated successfully') {
            router.push('/dashboard/porudzbenice');
            Swal.fire({
              icon: 'success',
              title: 'Porudžbina je uspešno ažurirana!',
            })
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Došlo je do greške prilikom ažuriranja porudžbine!',
              text: data.message,
            })
          }
        })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Došlo je do greške prilikom ažuriranja porudžbine!',
      })
    }
  }


  let content = null;

  if (order) {
    content = (
      <div>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Typography
            color="inherit"
            variant="h6"
          >
            {order.number}
          </Typography>
          <IconButton
            color="inherit"
            onClick={onClose}
          >
            <SvgIcon>
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
        <Box
          sx={{
            px: 3,
            py: 4,
          }}
        >
          {!isEditing ? (
            <OrderDetails
              onApprove={onClose}
              onEdit={handleEditOpen}
              onReject={onClose}
              order={order}
            />
          ) : (
            <OrderEdit
              onCancel={handleEditCancel}
              onSave={handleEditSave}
              order={order}
            />
          )}
        </Box>
      </div>
    );
  }

  if (lgUp) {
    return (
      <Drawer
        anchor="right"
        open={open}
        PaperProps={{
          sx: {
            position: 'relative',
            width: 500,
          },
        }}
        SlideProps={{ container }}
        variant="persistent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      hideBackdrop
      ModalProps={{
        container,
        sx: {
          pointerEvents: 'none',
          position: 'absolute',
        },
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          maxWidth: '100%',
          width: 400,
          pointerEvents: 'auto',
          position: 'absolute',
        },
      }}
      SlideProps={{ container }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

OrderDrawer.propTypes = {
  container: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  order: PropTypes.object,
};
