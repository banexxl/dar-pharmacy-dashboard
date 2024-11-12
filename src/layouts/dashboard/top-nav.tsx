import PropTypes from 'prop-types';
import BellIcon from '@heroicons/react/24/solid/BellIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import Bars3Icon from '@heroicons/react/24/solid/Bars3Icon';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import {
     Avatar,
     Badge,
     Box,
     Button,
     IconButton,
     Stack,
     SvgIcon,
     Tooltip,
     Typography,
     useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { usePopover } from 'src/hooks/use-popover';
import { AccountPopover } from './account-popover';
import { useEffect, useState } from 'react';

const SIDE_NAV_WIDTH = 280;
const TOP_NAV_HEIGHT = 64;

export const TopNav = (props: any) => {
     const { onNavOpen } = props;
     const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
     const accountPopover = usePopover();
     const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
     const appUrl = 'https://dar-pharmacy-dashboard.vercel.app'
     const appName = 'DAR Admin'
     const iconUrl = '/dar_icon_only.png'

     const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
     const [isInstallable, setIsInstallable] = useState(false)

     useEffect(() => {
          const handleBeforeInstallPrompt = (e: Event) => {
               e.preventDefault()
               setDeferredPrompt(e)
               setIsInstallable(true)
          }

          window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

          return () => {
               window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
          }
     }, [])

     const handleInstall = async () => {
          if (deferredPrompt) {
               deferredPrompt.prompt()
               const { outcome } = await deferredPrompt.userChoice
               if (outcome === 'accepted') {
                    console.log('User accepted the install prompt')
               }
               setDeferredPrompt(null)
               setIsInstallable(false)
          } else {
               handleDesktopShortcut()
          }
     }

     const handleDesktopShortcut = () => {
          const isWindows = navigator.platform.indexOf('Win') > -1
          let shortcutContent: string

          if (isWindows) {
               shortcutContent = `[InternetShortcut]\nURL=${appUrl}\nIconFile=${iconUrl}`
               downloadShortcut(`${appName}.url`, shortcutContent)
          } else {
               //Assume android
               shortcutContent = `[Desktop Entry]\nName=${appName}\nURL=${appUrl}\nIcon=${iconUrl}`
               downloadShortcut(`${appName}.desktop`, shortcutContent)
          }
     }

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


     return (
          <>
               <Box
                    component="header"
                    sx={{
                         backdropFilter: 'blur(6px)',
                         backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
                         position: 'sticky',
                         left: {
                              lg: `${SIDE_NAV_WIDTH}px`
                         },
                         top: 0,
                         width: {
                              lg: `calc(100% - ${SIDE_NAV_WIDTH}px)`
                         },
                         zIndex: (theme) => theme.zIndex.appBar
                    }}
               >
                    <Stack
                         alignItems="center"
                         direction="row"
                         justifyContent="space-between"
                         spacing={2}
                         sx={{
                              minHeight: TOP_NAV_HEIGHT,
                              px: 2
                         }}
                    >
                         <Stack
                              alignItems="center"
                              direction="row"
                              spacing={2}
                         >
                              {!lgUp && (
                                   <IconButton onClick={onNavOpen}>
                                        <SvgIcon fontSize="small">
                                             <Bars3Icon />
                                        </SvgIcon>
                                   </IconButton>
                              )}
                              <Tooltip title="Search">
                                   <IconButton>
                                        <SvgIcon fontSize="small">
                                             <MagnifyingGlassIcon />
                                        </SvgIcon>
                                   </IconButton>
                              </Tooltip>
                         </Stack>
                         <Stack
                              alignItems="center"
                              direction="row"
                              spacing={2}
                         >
                              <Tooltip title="Contacts">
                                   <IconButton>
                                        <SvgIcon fontSize="small">
                                             <UsersIcon />
                                        </SvgIcon>
                                   </IconButton>
                              </Tooltip>
                              <Tooltip title="Notifications">
                                   <IconButton>
                                        <Badge
                                             badgeContent={4}
                                             color="success"
                                             variant="dot"
                                        >
                                             <SvgIcon fontSize="small">
                                                  <BellIcon />
                                             </SvgIcon>
                                        </Badge>
                                   </IconButton>
                              </Tooltip>
                              <Tooltip title="Add to Home Screen">
                                   <Button variant="contained" color="primary" onClick={handleInstall}
                                        sx={{
                                             padding: isMobile ? '0px' : '5px',
                                             width: isMobile ? '50px' : '100px',
                                        }}
                                   >
                                        {isInstallable ? (
                                             <Typography
                                                  variant="body2"
                                                  sx={{
                                                       display: 'flex',
                                                       alignItems: 'center',
                                                       fontSize: isMobile ? '10px' : '12px',
                                                       height: isMobile ? '30px' : '40px',
                                                  }}
                                             >
                                                  Add to Home Screen
                                             </Typography>
                                        ) : (
                                             <Typography
                                                  variant="body2"
                                                  sx={{
                                                       display: 'flex',
                                                       alignItems: 'center',
                                                       fontSize: isMobile ? '10px' : '12px',
                                                       height: isMobile ? '30px' : '40px',
                                                  }}
                                             >
                                                  Download Shortcut
                                             </Typography>
                                        )}

                                   </Button>
                              </Tooltip>
                              <Avatar
                                   onClick={accountPopover.handleOpen}
                                   ref={accountPopover.anchorRef}
                                   sx={{
                                        cursor: 'pointer',
                                        height: 40,
                                        width: 40
                                   }}
                                   src={props.session.data.user.avatar}
                              />
                         </Stack>
                    </Stack>
               </Box>
               <AccountPopover
                    anchorEl={accountPopover.anchorRef.current}
                    open={accountPopover.open}
                    onClose={accountPopover.handleClose}
               />
          </>
     );
};

TopNav.propTypes = {
     onNavOpen: PropTypes.func,
     session: PropTypes.any
};
