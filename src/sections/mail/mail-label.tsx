import type { FC } from 'react';
import PropTypes from 'prop-types';
import AlertCircleIcon from '@untitled-ui/icons-react/build/esm/AlertCircle';
import BookmarkIcon from '@untitled-ui/icons-react/build/esm/Bookmark';
import Inbox01Icon from '@untitled-ui/icons-react/build/esm/Inbox01';
import Mail01Icon from '@untitled-ui/icons-react/build/esm/Mail01';
import Mail04Icon from '@untitled-ui/icons-react/build/esm/Mail04';
import Send01Icon from '@untitled-ui/icons-react/build/esm/Send01';
import Star01Icon from '@untitled-ui/icons-react/build/esm/Star01';
import Tag01Icon from '@untitled-ui/icons-react/build/esm/Tag01';
import Trash02Icon from '@untitled-ui/icons-react/build/esm/Trash02';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import ListItem from '@mui/material/ListItem';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { Label } from '@/schemas/mail';
import { indigo } from '@mui/material/colors';


const systemLabelIcons: Record<string, JSX.Element> = {
  ALL: <Mail01Icon />,
  INBOX: <Inbox01Icon />,
  Sent: <Send01Icon />,
  Trash: <Trash02Icon />,
  Drafts: <Mail04Icon />,
  Spam: <AlertCircleIcon />,
  Starred: <Star01Icon />,
  Important: <BookmarkIcon />,
};

const getIcon = (label: Label): JSX.Element => {
  if (label.type === 'system') {
    return systemLabelIcons[label.id];
  }
  return <Tag01Icon />;
};

const getColor = (label: Label): string => {
  if (label.type === 'user' && label.name === 'Trash') {
    return label.color || 'red';
  } else if (label.type === 'user' && label.name === 'Spam') {
    return label.color || 'orange';
  } else if (label.type === 'user' && label.name === 'Drafts') {
    return label.color || 'blue';
  } else if (label.type === 'system' && label.name === 'INBOX') {
    return label.color || indigo[500];
  } else if (label.type === 'system' && label.name === 'Sent') {
    return label.color || indigo[500];
  }
  return 'inherit';
};

interface MailLabelProps {
  active?: boolean;
  label: Label;
  onClick?: () => void;
}

export const MailLabel: FC<MailLabelProps> = (props) => {
  const { active, label, ...other } = props;

  const icon = getIcon(label);
  console.log(icon);

  const color = getColor(label);
  const showUnreadCount = !!(label.unreadCount && label.unreadCount > 0);

  return (
    <ListItem
      disableGutters
      disablePadding
      sx={{
        '& + &': {
          mt: 1,
        },
      }}
      {...other}
    >
      <ButtonBase
        sx={{
          borderRadius: 1,
          color: 'text.secondary',
          flexGrow: 1,
          fontSize: (theme) => theme.typography.button.fontSize,
          fontWeight: (theme) => theme.typography.button.fontWeight,
          justifyContent: 'flex-start',
          lineHeight: (theme) => theme.typography.button.lineHeight,
          py: 1,
          px: 2,
          textAlign: 'left',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          ...(active && {
            backgroundColor: 'action.selected',
            color: 'text.primary',
          }),
        }}
      >
        <SvgIcon
          sx={{
            color,
            mr: 1,
          }}
        >
          {icon}
        </SvgIcon>
        <Box sx={{ flexGrow: 1 }}>{label.name}</Box>
        {showUnreadCount && (
          <Typography
            color="inherit"
            variant="subtitle2"
          >
            {label.unreadCount}
          </Typography>
        )}
      </ButtonBase>
    </ListItem>
  );
};

MailLabel.propTypes = {
  active: PropTypes.bool,
  // @ts-ignore
  label: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};
