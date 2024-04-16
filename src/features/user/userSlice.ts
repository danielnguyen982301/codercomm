import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";
import { cloudinaryUpload } from "../../utils/cloudinary";
import { User } from "../../contexts/AuthContext";
import { AppThunk } from "../../app/store";

export type UpdatedProfile = {
  name: string;
  avatarUrl: string;
  coverUrl: string;
  aboutMe: string;
  city: string;
  country: string;
  company: string;
  jobTitle: string;
  facebookLink: string;
  instagramLink: string;
  linkedinLink: string;
  twitterLink: string;
};

type UserState = {
  isLoading: boolean;
  error: null | Error;
  updatedProfile: UpdatedProfile | null;
  selectedUser: User | null;
};

const initialState: UserState = {
  isLoading: false,
  error: null,
  updatedProfile: null,
  selectedUser: null,
};

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    updateUserProfileSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      const updatedUser = action.payload;
      state.updatedProfile = updatedUser;
    },

    getUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      state.selectedUser = action.payload;
    },
  },
});

export default slice.reducer;

type UpdateParams = { userId: string } & Partial<
  Omit<UpdatedProfile, "avatarUrl"> & {
    avatarUrl: Record<string, any> | string;
  }
>;

export const updateUserProfile =
  ({
    userId,
    name,
    avatarUrl,
    coverUrl,
    aboutMe,
    city,
    country,
    company,
    jobTitle,
    facebookLink,
    instagramLink,
    linkedinLink,
    twitterLink,
  }: UpdateParams): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const data: Partial<UpdatedProfile> = {
        name,
        coverUrl,
        aboutMe,
        city,
        country,
        company,
        jobTitle,
        facebookLink,
        instagramLink,
        linkedinLink,
        twitterLink,
      };
      if (avatarUrl instanceof File) {
        const imageUrl = await cloudinaryUpload(avatarUrl);
        data.avatarUrl = imageUrl;
      }
      const response = await apiService.put(`/users/${userId}`, data);
      dispatch(slice.actions.updateUserProfileSuccess(response.data));
      toast.success("Update Profile successfully");
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const getUser =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.get(`/users/${id}`);
      dispatch(slice.actions.getUserSuccess(response.data));
    } catch (error) {
      const err = error as Error;
      dispatch(slice.actions.hasError(err.message));
      toast.error(err.message);
    }
  };

export const getCurrentUserProfile = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/users/me");
    dispatch(slice.actions.updateUserProfileSuccess(response.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error));
  }
};
