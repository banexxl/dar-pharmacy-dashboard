import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import EyeIcon from '@untitled-ui/icons-react/build/esm/Eye';
import FileCheck03Icon from '@untitled-ui/icons-react/build/esm/FileCheck03';
import ListIcon from '@untitled-ui/icons-react/build/esm/List';
import MessageDotsCircleIcon from '@untitled-ui/icons-react/build/esm/MessageDotsCircle';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import type { RootState } from 'src/store';
import { useSelector } from 'src/store';
import type { Member, Task } from 'src/schemas/kanban';

const useTask = (taskId: string): Task | undefined => {
  return useSelector((state: RootState) => {
    const { tasks } = state.kanban;
    return tasks.byId[taskId];
  });
};

const useAssignees = (assignedTo?: Member[]): Member[] => {
  return useSelector((state: RootState) => {
    const { members } = state.kanban;

    if (!assignedTo) {
      return [];
    }

    return assignedTo
      .map((assignee: Member) => members.byId[assignee._id!.toString()])
      .filter((assignee) => !!assignee);
  });
};

interface TaskCardProps {
  taskId: string;
  dragging?: boolean;
  onOpen?: () => void;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(function TaskCard(props, ref) {
  const { taskId, dragging = false, onOpen, ...other } = props;
  const task = useTask(taskId);
  const assignedTo = useAssignees(task?.assignedTo);
  console.log('attached', task!.attachments);

  if (!task) {
    return null;
  }

  const hasAssignees = task.assignedTo?.length > 0;
  const hasAttachments = task.attachments?.length > 0;
  const hasChecklists = Object.keys(task.checklist?._id || {}).length > 0;
  const hasComments = task.comments?.length > 0;
  const hasLabels = task.labels?.length > 0;

  return (
    <Card
      elevation={dragging ? 8 : 1}
      onClick={onOpen}
      ref={ref}
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'neutral.800' : 'background.paper',
        ...(dragging && {
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'neutral.800' : 'background.paper',
        }),
        p: 3,
        userSelect: 'none',
        '&:hover': {
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'neutral.700' : 'neutral.50',
        },
        '&.MuiPaper-elevation1': {
          boxShadow: 1,
        },
      }}
      {...other}
    >
      {hasAttachments && (
        task.attachments.map((attachment) => {
          if (attachment.type === 'image') {
            // Display image if the file type is an image
            return (
              <CardMedia
                key={attachment._id!.toString()}
                image={attachment.url}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  borderRadius: 1.5,
                  height: 80,
                  mb: 1,
                }}
              />
            );
          } else {
            // Determine the file extension
            const fileExtension = attachment.url.split('.').pop()?.toLowerCase();

            let IconComponent;
            if (fileExtension === 'pdf') {
              IconComponent = PictureAsPdfIcon; // MUI icon for PDF
            } else if (fileExtension === 'doc' || fileExtension === 'docx') {
              IconComponent = ArticleIcon; // MUI icon for DOC/DOCX
            } else {
              IconComponent = ArticleIcon; // Fallback for other file types
            }

            // Display appropriate icon for non-image attachments
            return (
              <IconComponent
                key={attachment._id!.toString()}
                sx={{
                  fontSize: 44,
                  color: 'primary.main',
                  mb: 1,
                }}
              />
            );
          }
        })
      )}

      <Typography variant="subtitle1">{task.name}</Typography>
      {hasLabels && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            m: -1,
            mt: 1,
          }}
        >
          {task.labels.map((label) => (
            <Chip
              key={label}
              label={label}
              size="small"
              sx={{ m: 1 }}
            />
          ))}
        </Box>
      )}
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
          sx={{ mt: 2 }}
        >
          {task.isSubscribed && (
            <SvgIcon color="action">
              <EyeIcon />
            </SvgIcon>
          )}
          {hasAttachments && (
            <SvgIcon color="action">
              <FileCheck03Icon />
            </SvgIcon>
          )}
          {hasChecklists && (
            <SvgIcon color="action">
              <ListIcon />
            </SvgIcon>
          )}
          {hasComments && (
            <SvgIcon color="action">
              <MessageDotsCircleIcon />
            </SvgIcon>
          )}
        </Stack>
        {hasAssignees && (
          <AvatarGroup max={3}>
            {assignedTo.map((assignee) => (
              <Avatar
                key={assignee._id!.toString()}
                src={assignee.avatar || undefined}
              />
            ))}
          </AvatarGroup>
        )}
      </Stack>
    </Card>
  );
});

// @ts-ignore
TaskCard.propTypes = {
  taskId: PropTypes.string.isRequired,
  dragging: PropTypes.bool,
  onOpen: PropTypes.func,
};
