import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { Box, Divider, MenuItem, MenuList, Popover, Typography } from '@mui/material';
import Swal from 'sweetalert2';
import { useAuth } from '@/context/auth-context';

export const AccountPopover = (props: any) => {
     const { anchorEl, onClose, open, deferredPrompt, isInstallable, setDeferredPrompt, setIsInstallable } = props;
     const router = useRouter();
     const auth = useAuth()
     const appUrl = 'https://dar-pharmacy-dashboard.vercel.app';
     const appName = 'DAR Admin';
     const iconUrl = '/dar_icon_only.png';

     const handleSignOut = useCallback(async () => {
          try {
               onClose?.();
               await auth.signOut();
               router.replace('/auth/login');
               router.refresh();
          } catch (error) {
               console.error('Unable to sign out:', error);
          }
     }, [auth, onClose, router]);

     const handleRebuild = useCallback(async () => {
          onClose?.()
          const result = await Swal.fire({
               title: 'Pošalji izmene na sajt?',
               text: 'Ova akcija pokreće deploy. Može potrajati nekoliko minuta.',
               icon: 'warning',
               showCancelButton: true,
               confirmButtonText: 'Pošalji',
               cancelButtonText: 'Odustani'
          });

          if (!result.isConfirmed) {
               return;
          }

          try {
               const response = await fetch('https://api.vercel.com/v1/integrations/deploy/prj_8oTQMbXR6nd6jPsw1OWW2Ku6vXIi/bag2X5T5DK', {
                    method: 'POST'
               });

               if (response.ok) {
                    Swal.fire({
                         icon: 'success',
                         title: 'Success',
                         text: 'Proizvodi uspešno poslati! Sačekajte par minuta i osvežite stranicu!',
                    });
               } else {
                    const errorData = await response.json();
                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Something went wrong! Error: ' + errorData,
                    });
               }
          } catch (error) {
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! Error: ' + error,
               });
          }
     }, []);

     const downloadShortcut = (filename: string, content: string) => {
          const blob = new Blob([content], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
     }

     const handleDesktopShortcut = () => {
          const isWindows = navigator.platform.indexOf('Win') > -1
          let shortcutContent: string

          if (isWindows) {
               shortcutContent = `[InternetShortcut]\nURL=${appUrl}\nIconFile=${iconUrl}`
               downloadShortcut(`${appName}.url`, shortcutContent)
          } else {
               shortcutContent = `[Desktop Entry]\nName=${appName}\nURL=${appUrl}\nIcon=${iconUrl}`
               downloadShortcut(`${appName}.desktop`, shortcutContent)
          }
     }

     const handleInstall = useCallback(async () => {
          if (deferredPrompt) {
               deferredPrompt.prompt()
               const { outcome } = await deferredPrompt.userChoice
               if (outcome === 'accepted') {
                    setDeferredPrompt(null)
                    setIsInstallable(false)
               }
          } else {
               handleDesktopShortcut()
          }
     }, [deferredPrompt, setDeferredPrompt, setIsInstallable]);

     return (
          <Popover
               anchorEl={anchorEl}
               anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom'
               }}
               onClose={onClose}
               open={open}
               PaperProps={{ sx: { width: 300 } }}
          >
               <Box
                    sx={{
                         py: 1.5,
                         px: 2
                    }}
               >
                    <Typography variant="overline">
                         Nalog
                    </Typography>
                    <Typography
                         color="text.secondary"
                         variant="body2"
                    >
                         {auth.viewer?.name}

                    </Typography>
                    <Typography
                         color="text.secondary"
                         variant="body2"
                    >
                         {auth.viewer?.email}
                    </Typography>
               </Box>
               <Divider />
               <MenuList
                    disablePadding
                    dense
                    sx={{
                         p: '8px',
                         '& > *': {
                              borderRadius: 1
                         }
                    }}
               >
                    <MenuItem onClick={handleInstall}>
                         {isInstallable ? 'Dodaj na početni ekran' : 'Preuzmi prečicu'}
                    </MenuItem>
                    <MenuItem onClick={handleRebuild}>
                         Pošalji izmene na sajt
                    </MenuItem>
                    <MenuItem onClick={() => handleSignOut()}>
                         Odjavi se
                    </MenuItem>
               </MenuList>
          </Popover>
     );
};

AccountPopover.propTypes = {
     anchorEl: PropTypes.any,
     deferredPrompt: PropTypes.any,
     isInstallable: PropTypes.bool,
     onClose: PropTypes.func,
     open: PropTypes.bool.isRequired,
     setDeferredPrompt: PropTypes.func,
     setIsInstallable: PropTypes.func
};
