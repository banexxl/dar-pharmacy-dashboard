'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';

export default function DashboardTemplate({
     children,
}: {
     children: ReactNode;
}) {
     return (
          <Box
               sx={{
                    animation: 'page-enter 300ms ease-out',

                    '@keyframes page-enter': {
                         from: {
                              opacity: 0,
                              transform: 'translateY(8px)',
                         },
                         to: {
                              opacity: 1,
                              transform: 'translateY(0)',
                         },
                    },
               }}
          >
               {children}
          </Box>
     );
}