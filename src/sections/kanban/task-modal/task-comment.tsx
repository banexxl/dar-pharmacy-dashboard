import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Comment, Member } from 'src/schemas/kanban';
import { useAppSelector } from '@/store/hooks';

const useAuthor = (authorId: string): Member | null => {
  return useAppSelector((state) => {
    const { members } = state.kanban;
    const member = Object.values(members.byId).find(
      (member: Member) => member.email === authorId
    );
    return member || null;
  });
};

interface TaskCommentProps {
  comment: Comment;
}

export const TaskComment: FC<TaskCommentProps> = (props) => {
  const { comment, ...other } = props;
  const author = useAuthor(comment.authorId);
  const avatar = author?.avatar || undefined;
  const createdAtDate = new Date(comment.createdAt);
  if (isNaN(createdAtDate.getTime())) {
    throw new Error('Invalid date');
  }

  const formattedDate = format(createdAtDate, "MMM dd, yyyy 'at' hh:mm a");

  return (
    <Stack
      alignItems="flex-start"
      direction="row"
      spacing={2}
      {...other}
    >
      <Avatar src={avatar} />
      <Stack
        spacing={1}
        sx={{ flexGrow: 1 }}
      >
        <Typography variant="subtitle2">{author?.name}</Typography>
        <Paper
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
            p: 2,
          }}
          variant="outlined"
        >
          <Typography variant="body2">{comment.message}</Typography>
        </Paper>
        <Typography
          color="text.secondary"
          component="p"
          variant="caption"
        >
          {formattedDate}
        </Typography>
      </Stack>
    </Stack>
  );
};

TaskComment.propTypes = {
  // @ts-ignore
  comment: PropTypes.objectOf(PropTypes.any).isRequired,
};
