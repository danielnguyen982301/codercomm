import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Card,
  Box,
  Pagination,
  Grid,
  Container,
} from "@mui/material";
import { getFriends } from "./friendSlice";
import UserCard from "./UserCard";
import SearchInput from "../../components/SearchInput";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

function FriendList() {
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = React.useState(1);

  const { currentPageUsers, usersById, totalUsers, totalPages } =
    useAppSelector((state) => state.friend);
  const users = currentPageUsers.map((userId) => usersById[userId]);
  const dispatch = useAppDispatch();

  const handleSubmit = (searchQuery: string) => {
    setFilterName(searchQuery);
  };

  useEffect(() => {
    dispatch(getFriends({ filterName, page }));
  }, [filterName, page, dispatch]);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Friends
      </Typography>
      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems="center">
            <SearchInput handleSubmit={handleSubmit} />

            <Box sx={{ flexGrow: 1 }} />

            <Typography
              variant="subtitle1"
              sx={{ color: "text.secondary", ml: 1 }}
            >
              {totalUsers > 1
                ? `${totalUsers} friends found`
                : totalUsers === 1
                ? `${totalUsers} friend found`
                : "No friend found"}
            </Typography>

            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, page) => setPage(page)}
            />
          </Stack>
        </Stack>

        <Grid container spacing={3} my={1}>
          {users.map((user) => (
            <Grid key={user._id} item xs={12} md={4}>
              <UserCard profile={user} />
            </Grid>
          ))}
        </Grid>
      </Card>
    </Container>
  );
}

export default FriendList;
