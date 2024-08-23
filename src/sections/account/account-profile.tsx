import {
     Avatar,
     Box,
     Button,
     Card,
     CardActions,
     CardContent,
     Divider,
     Typography
} from '@mui/material';
import { time } from 'console';

const user = {
     id: '5e86809283e28b96d2d38537',
     avatar: '/assets/avatars/avatar-anika-visser.png',
     city: 'Kragujevac',
     country: 'Serbia',
     jobTitle: 'Senior Sales',
     name: 'Maja',
     email: 'maja@apoteka-dar.rs',
     timezone: 'GMT+1'
};

export const AccountProfile = () => (
     <Card>
          <CardContent>
               <Box
                    sx={{
                         alignItems: 'center',
                         display: 'flex',
                         flexDirection: 'column'
                    }}
               >
                    <Avatar
                         src={user.avatar}
                         sx={{
                              height: 80,
                              mb: 2,
                              width: 80
                         }}
                    />
                    <Typography
                         gutterBottom
                         variant="h5"
                    >
                         {user.name}
                    </Typography>
                    <Typography
                         color="text.secondary"
                         variant="body2"
                    >
                         {user.city} {user.country}
                    </Typography>
                    <Typography
                         color="text.secondary"
                         variant="body2"
                    >
                         {user.timezone}
                    </Typography>
               </Box>
          </CardContent>
          <Divider />
          <CardActions>
               <Button
                    fullWidth
                    variant="text"
               >
                    Upload picture
               </Button>
          </CardActions>
     </Card>
);
