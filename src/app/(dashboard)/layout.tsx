'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { styled } from '@mui/material/styles';
import { TopNav } from '@/components/top-nav';
import { SideNav } from '@/components/side-nav';
import { useAuth } from '@/context/auth-context';

const SIDE_NAV_WIDTH = 280;

const LayoutRoot = styled('div')(({ theme }) => ({
     display: 'flex',
     flex: '1 1 auto',
     maxWidth: '100%',

     [theme.breakpoints.up('lg')]: {
          paddingLeft: SIDE_NAV_WIDTH,
     },
}));

const LayoutContainer = styled('div')({
     display: 'flex',
     flex: '1 1 auto',
     flexDirection: 'column',
     width: '100%',
});

export default function DashboardLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     const pathname = usePathname();
     const [openNav, setOpenNav] = useState(false);

     const {
          viewer,
          status,
     } = useAuth();
     console.log('viewer', viewer);
     console.log('status', status);

     useEffect(() => {
          setOpenNav(false);
     }, [pathname]);

     return (
          <>
               <TopNav
                    onNavOpen={() => setOpenNav(true)}
                    viewer={viewer}
                    sessionStatus={status}
               />

               <SideNav
                    open={openNav}
                    onClose={() => setOpenNav(false)}
               />

               <LayoutRoot>
                    <LayoutContainer>
                         {children}
                    </LayoutContainer>
               </LayoutRoot>
          </>
     );
}