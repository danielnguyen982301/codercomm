import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { fDate } from "../../utils/formatTime";
import CommentReaction from "./CommentReaction";
import { Comment, deleteComment, updateComment } from "./commentSlice";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useAppDispatch } from "../../app/hooks";
import useAuth from "../../hooks/useAuth";
import { User } from "../../contexts/AuthContext";

function CommentCard({ comment }: { comment: Comment }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const dispatch = useAppDispatch();
  const { user } = useAuth() as { user: User };

  const commentMenu = (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon sx={{ fontSize: 30 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        id={comment._id}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setIsEditing(true);
          }}
        >
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            handleDelete(comment._id);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );

  const editingView = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(updateComment({ commentId: comment._id, content }));
        setIsEditing(false);
      }}
    >
      <TextField
        value={content}
        placeholder="Search by name"
        onChange={(event) => setContent(event.target.value)}
        fullWidth
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button type="submit" variant="contained" size="small">
                Save
              </Button>
              <Button
                sx={{ ml: 1 }}
                variant="contained"
                size="small"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </InputAdornment>
          ),
        }}
      />
    </form>
  );

  const handleDelete = (commentId: string) => {
    if (window.confirm("Delete the selected comment?")) {
      dispatch(deleteComment({ commentId, postId: comment.post }));
    }
  };

  return (
    <Stack direction="row" spacing={2}>
      <Avatar alt={comment.author?.name} src={comment.author?.avatarUrl} />
      <Paper sx={{ p: 1.5, flexGrow: 1, bgcolor: "background.neutral" }}>
        <Stack
          direction="row"
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 0.5 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {comment.author?.name}
          </Typography>
          <Box>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              {fDate(comment.createdAt)}
            </Typography>
            {comment.author._id === user._id && commentMenu}
          </Box>
        </Stack>
        {isEditing ? (
          editingView
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {comment.content}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <CommentReaction comment={comment} />
        </Box>
      </Paper>
    </Stack>
  );
}

export default CommentCard;
