import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";
import { COMMENTS_PER_POST } from "../../app/config";
import { AppThunk } from "../../app/store";

export type Comment = {
  _id: string;
  author: { name: string; avatarUrl: string; [key: string]: any };
  createdAt: string;
  content: string;
  reactions: { like: number; dislike: number };
  [key: string]: any;
};

type CommentState = {
  isLoading: boolean;
  error: null | Error;
  commentsByPost: Record<string, string[]>;
  totalCommentsByPost: Record<string, number>;
  currentPageByPost: Record<string, number>;
  commentsById: Record<string, Comment>;
};

const initialState: CommentState = {
  isLoading: false,
  error: null,
  commentsByPost: {},
  totalCommentsByPost: {},
  currentPageByPost: {},
  commentsById: {},
};

const slice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getCommentsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { postId, comments, count, page } = action.payload;

      comments.forEach(
        (comment: Comment) => (state.commentsById[comment._id] = comment)
      );
      state.commentsByPost[postId] = comments
        .map((comment: Comment) => comment._id)
        .reverse();
      state.totalCommentsByPost[postId] = count;
      state.currentPageByPost[postId] = page;
    },

    createCommentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
    },

    sendCommentReactionSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { commentId, reactions } = action.payload;
      state.commentsById[commentId].reactions = reactions;
    },

    deleteCommentSuccess(state) {
      state.isLoading = false;
      state.error = null;
    },

    updateCommentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const {
        commentId,
        newComment: { content },
      } = action.payload;
      state.commentsById[commentId].content = content;
    },
  },
});

export default slice.reducer;

export const getComments =
  ({
    postId,
    page = 1,
    limit = COMMENTS_PER_POST,
  }: {
    postId: string;
    page?: number;
    limit?: number;
  }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = {
        page: page,
        limit: limit,
      };
      const response = await apiService.get(`/posts/${postId}/comments`, {
        params,
      });
      dispatch(
        slice.actions.getCommentsSuccess({
          ...response.data,
          postId,
          page,
        })
      );
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const createComment =
  ({ postId, content }: { postId: string; content: string }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post("/comments", {
        content,
        postId,
      });
      dispatch(slice.actions.createCommentSuccess(response.data));
      dispatch(getComments({ postId }));
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const sendCommentReaction =
  ({ commentId, emoji }: { commentId: string; emoji: string }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(`/reactions`, {
        targetType: "Comment",
        targetId: commentId,
        emoji,
      });
      dispatch(
        slice.actions.sendCommentReactionSuccess({
          commentId,
          reactions: response.data,
        })
      );
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const deleteComment =
  ({ commentId, postId }: { commentId: string; postId: string }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await apiService.delete(`/comments/${commentId}`);
      dispatch(slice.actions.deleteCommentSuccess());
      dispatch(getComments({ postId }));
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const updateComment =
  ({ commentId, content }: { commentId: string; content: string }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const res = await apiService.put(`/comments/${commentId}`, { content });
      dispatch(
        slice.actions.updateCommentSuccess({ commentId, newComment: res.data })
      );
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };
