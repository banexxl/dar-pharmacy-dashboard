import {
     Box,
     CircularProgress,
     LinearProgress,
     Stack,
     Typography,
} from '@mui/material';

export default function Loading() {
     return (
          <Box
               sx={{
                    alignItems: 'center',
                    display: 'flex',
                    flex: '1 1 auto',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 64px)',
                    position: 'relative',
                    width: '100%',
               }}
          >
               <LinearProgress
                    sx={{
                         left: 0,
                         position: 'absolute',
                         right: 0,
                         top: 0,
                    }}
               />

               <Stack
                    alignItems="center"
                    spacing={2}
               >
                    <CircularProgress size={42} />

                    <Typography
                         color="text.secondary"
                         variant="body2"
                    >
                         Učitavanje...
                    </Typography>
               </Stack>
          </Box>
     );
}