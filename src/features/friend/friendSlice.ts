import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";
import { AppThunk } from "../../app/store";

export type Friendship = {
  from: string;
  to: string;
  status: string;
} | null;

export type Friend = {
  _id: string;
  name: string;
  avatarUrl: string;
  email: string;
  friendship: Friendship;
  [key: string]: any;
};

type FriendState = {
  isLoading: boolean;
  error: null | Error;
  currentPageUsers: string[];
  usersById: Record<string, Friend>;
  totalPages: number;
  totalUsers: number;
};

const initialState: FriendState = {
  isLoading: false,
  error: null,
  currentPageUsers: [],
  usersById: {},
  totalUsers: 1,
  totalPages: 1,
};

const slice = createSlice({
  name: "friend",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getUsersSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      const { users, count, totalPages } = action.payload;
      users.forEach((user: Friend) => (state.usersById[user._id] = user));
      state.currentPageUsers = users.map((user: Friend) => user._id);
      state.totalUsers = count;
      state.totalPages = totalPages;
    },

    getFriendsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      const { users, count, totalPages } = action.payload;
      users.forEach((user: Friend) => (state.usersById[user._id] = user));
      state.currentPageUsers = users.map((user: Friend) => user._id);
      state.totalUsers = count;
      state.totalPages = totalPages;
    },

    getFriendRequestsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      const { users, count, totalPages } = action.payload;
      users.forEach((user: Friend) => (state.usersById[user._id] = user));
      state.currentPageUsers = users.map((user: Friend) => user._id);
      state.totalUsers = count;
      state.totalPages = totalPages;
    },

    sendFriendRequestSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { targetUserId, ...friendship } = action.payload;
      state.usersById[targetUserId].friendship = friendship;
    },

    declineRequestSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { targetUserId, ...friendship } = action.payload;
      state.usersById[targetUserId].friendship = friendship;
    },

    acceptRequestSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { targetUserId, ...friendship } = action.payload;
      state.usersById[targetUserId].friendship = friendship;
    },

    cancelRequestSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { targetUserId } = action.payload;
      state.usersById[targetUserId].friendship = null;
    },

    removeFriendSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { targetUserId } = action.payload;
      state.usersById[targetUserId].friendship = null;
    },
  },
});

export default slice.reducer;

export const getUsers =
  ({
    filterName,
    page = 1,
    limit = 12,
  }: {
    filterName?: string;
    page: number;
    limit: number;
  }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params: { name?: string; page: number; limit: number } = {
        page,
        limit,
      };
      if (filterName) params.name = filterName;
      const response = await apiService.get("/users", { params });
      dispatch(slice.actions.getUsersSuccess(response.data));
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const getFriends =
  ({
    filterName,
    page = 1,
    limit = 12,
  }: {
    filterName?: string;
    page: number;
    limit?: number;
  }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params: { name?: string; page: number; limit: number } = {
        page,
        limit,
      };
      if (filterName) params.name = filterName;
      const response = await apiService.get("/friends", { params });
      dispatch(slice.actions.getFriendsSuccess(response.data));
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const getFriendRequests =
  ({
    filterName,
    page = 1,
    limit = 12,
  }: {
    filterName?: string;
    page: number;
    limit?: number;
  }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params: { name?: string; page: number; limit: number } = {
        page,
        limit,
      };
      if (filterName) params.name = filterName;
      const response = await apiService.get("/friends/requests/incoming", {
        params,
      });
      dispatch(slice.actions.getFriendRequestsSuccess(response.data));
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const sendFriendRequest =
  (targetUserId: string): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(`/friends/requests`, {
        to: targetUserId,
      });
      dispatch(
        slice.actions.sendFriendRequestSuccess({
          ...response.data,
          targetUserId,
        })
      );
      toast.success("Request sent");
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const declineRequest =
  (targetUserId: string): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.put(
        `/friends/requests/${targetUserId}`,
        {
          status: "declined",
        }
      );
      dispatch(
        slice.actions.declineRequestSuccess({ ...response.data, targetUserId })
      );
      toast.success("Request declined");
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const acceptRequest =
  (targetUserId: string): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.put(
        `/friends/requests/${targetUserId}`,
        {
          status: "accepted",
        }
      );
      dispatch(
        slice.actions.acceptRequestSuccess({ ...response.data, targetUserId })
      );
      toast.success("Request accepted");
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const cancelRequest =
  (targetUserId: string): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.delete(
        `/friends/requests/${targetUserId}`
      );
      dispatch(
        slice.actions.cancelRequestSuccess({ ...response.data, targetUserId })
      );
      toast.success("Request cancelled");
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const removeFriend =
  (targetUserId: string): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.delete(`/friends/${targetUserId}`);
      dispatch(
        slice.actions.removeFriendSuccess({ ...response.data, targetUserId })
      );
      toast.success("Friend removed");
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const getSentFriendRequests =
  ({
    filterName,
    page = 1,
    limit = 12,
  }: {
    filterName?: string;
    page: number;
    limit?: number;
  }): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params: { name?: string; page: number; limit: number } = {
        page,
        limit,
      };
      if (filterName) params.name = filterName;
      const response = await apiService.get("/friends/requests/outgoing", {
        params,
      });
      dispatch(slice.actions.getFriendRequestsSuccess(response.data));
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };
