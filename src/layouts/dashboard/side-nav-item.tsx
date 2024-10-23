import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import { useSelector } from '@/store';
import { success } from '@/theme/colors';

interface SideNavItemProps {
     active: boolean;
     disabled: boolean;
     icon: ReactNode; // Ensure it is compatible with ReactNode
     path: string;
     title: string;
     external?: boolean;
}

export const SideNavItem = (props: SideNavItemProps) => {
     const { active = false, disabled, external, icon, path, title } = props;

     const linkProps = path
          ? external
               ? {
                    component: 'a',
                    href: path,
                    target: '_blank'
               }
               : {
                    component: NextLink,
                    href: path
               }
          : {};

     return (
          <li>
               <ButtonBase
                    sx={{
                         alignItems: 'center',
                         borderRadius: 1,
                         display: 'flex',
                         justifyContent: 'flex-start',
                         pl: '16px',
                         pr: '16px',
                         py: '6px',
                         textAlign: 'left',
                         width: '100%',
                         ...(active && {
                              backgroundColor: 'rgba(255, 255, 255, 0.04)'
                         }),
                         '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.04)'
                         }
                    }}
                    {...linkProps}
               >
                    {icon && (
                         <Box
                              component="span"
                              sx={{
                                   alignItems: 'center',
                                   color: 'neutral.400',
                                   display: 'inline-flex',
                                   justifyContent: 'center',
                                   mr: 2,
                                   ...(active && {
                                        color: 'primary.main'
                                   })
                              }}
                         >
                              {icon}
                         </Box>
                    )}
                    <Box
                         component="span"
                         sx={{
                              display: 'flex',
                              alignItems: 'center',
                              color: 'neutral.400',
                              flexGrow: 1,
                              fontFamily: (theme) => theme.typography.fontFamily,
                              fontSize: 14,
                              fontWeight: 600,
                              lineHeight: '24px',
                              whiteSpace: 'nowrap',
                              ...(active && {
                                   color: 'common.white'
                              }),
                              ...(disabled && {
                                   color: 'neutral.500'
                              })
                         }}
                    >
                         {title}
                         {/* {title === 'Email' && (
                              loading ? (
                                   <Typography component="span">
                                        {'\u00A0\u00A0\u00A0'}
                                        <CircularProgress size={15} />
                                   </Typography>
                              ) : (
                                   <Typography
                                        sx={{
                                             fontSize: '.9rem',
                                             color: labels[0]?.unreadCount! as number > 0 ? success.light : 'inherit', // Change color if greater than 0
                                        }}
                                   >
                                        {'\u00A0\u00A0\u00A0' + labels[0]?.unreadCount}
                                   </Typography>
                              )
                         )} */}

                    </Box>
               </ButtonBase>
          </li >
     );
};

SideNavItem.propTypes = {
     active: PropTypes.bool,
     disabled: PropTypes.bool,
     external: PropTypes.bool,
     icon: PropTypes.node,
     path: PropTypes.string,
     title: PropTypes.string.isRequired
};
