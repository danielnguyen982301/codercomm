import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";
import { POSTS_PER_PAGE } from "../../app/config";
import { cloudinaryUpload } from "../../utils/cloudinary";
import { getCurrentUserProfile } from "../user/userSlice";
import { AppThunk } from "../../app/store";

export type Post = {
  _id: string;
  author: { _id: string; avatarUrl: string; name: string };
  createdAt: string;
  content: string;
  image?: string;
  reactions: { like: number; dislike: number };
  [key: string]: any;
};

type PostState = {
  isLoading: boolean;
  error: null | Error;
  postsById: Record<string, Post>;
  currentPagePosts: string[];
  totalPosts: number;
};

const initialState: PostState = {
  isLoading: false,
  error: null,
  postsById: {},
  currentPagePosts: [],
  totalPosts: 0,
};

const slice = createSlice({
  name: "post",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    resetPosts(state) {
      state.postsById = {};
      state.currentPagePosts = [];
    },

    getPostsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      const { posts, count } = action.payload;
      posts.forEach((post: Post) => {
        state.postsById[post._id] = post;
        if (!state.currentPagePosts.includes(post._id))
          state.currentPagePosts.push(post._id);
      });
      state.totalPosts = count;
    },

    createPostSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const newPost = action.payload;
      if (state.currentPagePosts.length % POSTS_PER_PAGE === 0)
        state.currentPagePosts.pop();
      state.postsById[newPost._id] = newPost;
      state.currentPagePosts.unshift(newPost._id);
    },

    sendPostReactionSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { postId, reactions } = action.payload;
      state.postsById[postId].reactions = reactions;
    },

    deletePostSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const deletedPostId = action.payload;
      state.currentPagePosts = state.currentPagePosts.filter(
        (postId) => postId !== deletedPostId
      );
    },

    updatePostSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { content, image, _id: postId } = action.payload;
      state.postsById[postId].content = content;
      state.postsById[postId].image = image;
    },
  },
});

export default slice.reducer;

export const getPosts =
  ({
    userId,
    page = 1,
    limit = POSTS_PER_PAGE,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = { page, limit };
      const response = await apiService.get(`/posts/user/${userId}`, {
        params,
      });
      if (page === 1) dispatch(slice.actions.resetPosts());
      dispatch(slice.actions.getPostsSuccess(response.data));
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const createPost =
  ({
    userId,
    content,
    image,
  }: {
    userId: string;
    content: string;
    image?: File | string | null;
  }): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // upload image to cloudinary
      const imageUrl = await cloudinaryUpload(image as File | null);
      const response = await apiService.post("/posts", {
        content,
        image: imageUrl,
      });
      dispatch(slice.actions.createPostSuccess(response.data));
      toast.success("Post successfully");
      dispatch(getPosts({ userId }));
      dispatch(getCurrentUserProfile());
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const sendPostReaction =
  ({ postId, emoji }: { postId: string; emoji: string }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(`/reactions`, {
        targetType: "Post",
        targetId: postId,
        emoji,
      });
      dispatch(
        slice.actions.sendPostReactionSuccess({
          postId,
          reactions: response.data,
        })
      );
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const deletePost =
  ({ postId, userId }: { postId: string; userId: string }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await apiService.delete(`/posts/${postId}`);
      dispatch(slice.actions.deletePostSuccess(postId));
      toast.success("Delete post successfully");
      dispatch(getCurrentUserProfile());
      dispatch(getPosts({ userId }));
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const updatePost =
  ({
    postId,
    content,
    image,
  }: {
    postId: string;
    content: string;
    image?: File | string | null;
  }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const imageUrl = await cloudinaryUpload(image as File | null);
      const response = await apiService.put(`/posts/${postId}`, {
        content,
        image: imageUrl,
      });
      dispatch(slice.actions.updatePostSuccess(response.data));
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };
