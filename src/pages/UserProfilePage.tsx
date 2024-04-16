import React, { useEffect } from "react";
import { Card, Container } from "@mui/material";
import Profile from "../features/user/Profile";
import ProfileCover from "../features/user/ProfileCover";
import { useParams } from "react-router-dom";
import { shallowEqual } from "react-redux";
import { getUser } from "../features/user/userSlice";
import LoadingScreen from "../components/LoadingScreen";
import { useAppDispatch, useAppSelector } from "../app/hooks";

function UserProfilePage() {
  const params = useParams();
  const userId = params.userId;
  const dispatch = useAppDispatch();
  const { selectedUser, isLoading } = useAppSelector(
    (state) => state.user,
    shallowEqual
  );

  useEffect(() => {
    if (userId) {
      dispatch(getUser(userId));
    }
  }, [dispatch, userId]);

  return (
    <Container>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Card
            sx={{
              mb: 3,
              height: 280,
              position: "relative",
            }}
          >
            {selectedUser && <ProfileCover profile={selectedUser} />}
          </Card>
          {selectedUser && <Profile profile={selectedUser} />}
        </>
      )}
    </Container>
  );
}

export default UserProfilePage;
