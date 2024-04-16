import { createContext, useReducer, useEffect, ReactNode } from "react";
import apiService from "../app/apiService";
import { isValidToken } from "../utils/jwt";
import { useAppSelector } from "../app/hooks";

export type User = {
  _id: string;
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
  friendCount: number;
  postCount: number;
  [key: string]: any;
};

type AuthState = {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
};

const initialState: AuthState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

enum AuthReducerTypes {
  INITIALIZE = "AUTH.INITIALIZE",
  LOGIN_SUCCESS = "AUTH.LOGIN_SUCCESS",
  REGISTER_SUCCESS = "AUTH.REGISTER_SUCCESS",
  LOGOUT = "AUTH.LOGOUT",
  UPDATE_PROFILE = "AUTH.UPDATE_PROFILE",
}

const INITIALIZE = "AUTH.INITIALIZE";
const LOGIN_SUCCESS = "AUTH.LOGIN_SUCCESS";
const REGISTER_SUCCESS = "AUTH.REGISTER_SUCCESS";
const LOGOUT = "AUTH.LOGOUT";
const UPDATE_PROFILE = "AUTH.UPDATE_PROFILE";

const reducer = (
  state: AuthState,
  action: { type: AuthReducerTypes; payload?: any }
) => {
  switch (action.type) {
    case INITIALIZE:
      const { isAuthenticated, user } = action.payload;
      return {
        ...state,
        isInitialized: true,
        isAuthenticated,
        user,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case UPDATE_PROFILE:
      const {
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
        friendCount,
        postCount,
      } = action.payload;
      return {
        ...state,
        user: {
          ...state.user,
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
          friendCount,
          postCount,
        },
      };
    default:
      return state;
  }
};

const setSession = (accessToken: string | null) => {
  if (accessToken) {
    window.localStorage.setItem("accessToken", accessToken);
    apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    window.localStorage.removeItem("accessToken");
    delete apiService.defaults.headers.common.Authorization;
  }
};

type AuthContextType = AuthState & {
  login: (
    { email, password }: Record<string, string>,
    callback: () => void
  ) => void;
  register: (
    { name, email, password }: Record<string, string>,
    callback: () => void
  ) => void;
  logout: (callback: () => void) => void;
};

const AuthContext = createContext<AuthContextType>(null!);

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const updatedProfile = useAppSelector((state) => state.user.updatedProfile);

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);

          const response = await apiService.get("/users/me");
          const user = response.data;

          dispatch({
            type: AuthReducerTypes.INITIALIZE,
            payload: { isAuthenticated: true, user },
          });
        } else {
          setSession(null);

          dispatch({
            type: AuthReducerTypes.INITIALIZE,
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (err) {
        console.error(err);

        setSession(null);
        dispatch({
          type: AuthReducerTypes.INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (updatedProfile)
      dispatch({
        type: AuthReducerTypes.UPDATE_PROFILE,
        payload: updatedProfile,
      });
  }, [updatedProfile]);

  const login = async (
    { email, password }: Record<string, string>,
    callback: () => void
  ) => {
    const response = await apiService.post("/auth/login", { email, password });
    const { user, accessToken } = response.data;

    setSession(accessToken);
    dispatch({
      type: AuthReducerTypes.LOGIN_SUCCESS,
      payload: { user },
    });

    callback();
  };

  const register = async (
    { name, email, password }: Record<string, string>,
    callback: () => void
  ) => {
    const response = await apiService.post("/users", {
      name,
      email,
      password,
    });

    const { user, accessToken } = response.data;
    setSession(accessToken);
    dispatch({
      type: AuthReducerTypes.REGISTER_SUCCESS,
      payload: { user },
    });

    callback();
  };

  const logout = async (callback: () => void) => {
    setSession(null);
    dispatch({ type: AuthReducerTypes.LOGOUT });
    callback();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
