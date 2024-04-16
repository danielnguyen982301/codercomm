import { IconButton, Stack, Typography } from "@mui/material";
import ThumbDownAltRoundedIcon from "@mui/icons-material/ThumbDownAltRounded";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import React from "react";
import { Comment, sendCommentReaction } from "./commentSlice";
import { useAppDispatch } from "../../app/hooks";

function CommentReaction({ comment }: { comment: Comment }) {
  const dispatch = useAppDispatch();

  const handleClick = (emoji: string) => {
    dispatch(sendCommentReaction({ commentId: comment._id, emoji }));
  };

  return (
    <Stack direction="row" alignItems="center">
      <IconButton
        onClick={() => handleClick("like")}
        sx={{ color: "primary.main" }}
      >
        <ThumbUpRoundedIcon sx={{ fontSize: 20 }} />
      </IconButton>
      <Typography variant="body2" mr={1}>
        {comment?.reactions?.like}
      </Typography>

      <IconButton
        onClick={() => handleClick("dislike")}
        sx={{ color: "error.main" }}
      >
        <ThumbDownAltRoundedIcon sx={{ fontSize: 20 }} />
      </IconButton>
      <Typography variant="body2">{comment?.reactions?.dislike}</Typography>
    </Stack>
  );
}

export default CommentReaction;
