import React, { FormEvent, useState } from "react";

import { Stack, Avatar, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import useAuth from "../../hooks/useAuth";
import { createComment } from "./commentSlice";
import { useAppDispatch } from "../../app/hooks";

function CommentForm({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const dispatch = useAppDispatch();

  const handleSubmit = (e: FormEvent<HTMLElement>) => {
    e.preventDefault();
    dispatch(createComment({ postId, content }));
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="row" alignItems="center">
        <Avatar src={user?.avatarUrl} alt={user?.name} />
        <TextField
          fullWidth
          size="small"
          value={content}
          placeholder="Write a comment…"
          onChange={(event) => setContent(event.target.value)}
          sx={{
            ml: 2,
            mr: 1,
            "& fieldset": {
              borderWidth: `1px !important`,
              borderColor: (theme) => `${theme.palette.grey[500]} !important`,
            },
          }}
        />
        <IconButton type="submit">
          <SendIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </Stack>
    </form>
  );
}

export default CommentForm;
