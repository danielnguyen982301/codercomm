import { IconButton, Stack, Typography } from "@mui/material";
import ThumbDownAltRoundedIcon from "@mui/icons-material/ThumbDownAltRounded";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import React from "react";
import { Post, sendPostReaction } from "./postSlice";
import { useAppDispatch } from "../../app/hooks";

function PostReaction({ post }: { post: Post }) {
  const dispatch = useAppDispatch();

  const handleClick = (emoji: string) => {
    dispatch(sendPostReaction({ postId: post._id, emoji }));
  };

  return (
    <Stack direction="row" alignItems="center">
      <IconButton onClick={() => handleClick("like")}>
        <ThumbUpRoundedIcon sx={{ fontSize: 20, color: "primary.main" }} />
      </IconButton>
      <Typography variant="h6" mr={1}>
        {post?.reactions?.like}
      </Typography>

      <IconButton onClick={() => handleClick("dislike")}>
        <ThumbDownAltRoundedIcon sx={{ fontSize: 20, color: "error.main" }} />
      </IconButton>
      <Typography variant="h6">{post?.reactions?.dislike}</Typography>
    </Stack>
  );
}

export default PostReaction;
