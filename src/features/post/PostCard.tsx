import React, { useState } from "react";
import {
  Box,
  Link,
  Card,
  Stack,
  Avatar,
  Typography,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { fDate } from "../../utils/formatTime";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import PostReaction from "./PostReaction";
import CommentForm from "../comment/CommentForm";
import CommentList from "../comment/CommentList";
import { Post, deletePost } from "./postSlice";
import { useAppDispatch } from "../../app/hooks";
import useAuth from "../../hooks/useAuth";
import { User } from "../../contexts/AuthContext";
import PostForm from "./PostForm";

function PostCard({ post }: { post: Post }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAuth() as { user: User };

  const handleDelete = (postId: string) => {
    if (window.confirm("Delete the selected post?")) {
      dispatch(deletePost({ postId, userId: user._id }));
    }
  };

  const postMenu = (
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
        id={post._id}
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
            handleDelete(post._id);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );

  const initialView = (
    <>
      <Typography>{post.content}</Typography>

      {post.image && (
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            height: 300,
            "& img": { objectFit: "cover", width: 1, height: 1 },
          }}
        >
          <img src={post.image} alt="post" />
        </Box>
      )}
    </>
  );

  const defaultValues = {
    content: post.content,
    image: post.image,
  };

  const editingView = (
    <PostForm
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      postData={defaultValues}
      postId={post._id}
    />
  );

  return (
    <Card>
      <CardHeader
        disableTypography
        avatar={
          <Avatar src={post?.author?.avatarUrl} alt={post?.author?.name} />
        }
        title={
          <Link
            variant="subtitle2"
            color="text.primary"
            component={RouterLink}
            sx={{ fontWeight: 600 }}
            to={`/user/${post.author._id}`}
          >
            {post?.author?.name}
          </Link>
        }
        subheader={
          <Typography
            variant="caption"
            sx={{ display: "block", color: "text.secondary" }}
          >
            {fDate(post.createdAt)}
          </Typography>
        }
        action={post.author._id === user._id ? postMenu : null}
      />

      <Stack spacing={2} sx={{ p: 3 }}>
        {isEditing ? editingView : initialView}

        <PostReaction post={post} />
        <CommentList postId={post._id} />
        <CommentForm postId={post._id} />
      </Stack>
    </Card>
  );
}

export default PostCard;
