import React, { Dispatch, SetStateAction, useCallback } from "react";
import { Box, Card, alpha, Stack, Button } from "@mui/material";

import { FormProvider, FTextField, FUploadImage } from "../../components/form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { createPost, updatePost } from "./postSlice";
import { LoadingButton } from "@mui/lab";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import useAuth from "../../hooks/useAuth";
import { User } from "../../contexts/AuthContext";

const yupSchema = Yup.object().shape({
  content: Yup.string().required("Content is required"),
});

type PostFormData = {
  content: string;
  image?: File | string | null;
};

const defaultValues: PostFormData = {
  content: "",
  image: null,
};

function PostForm({
  postData,
  isEditing,
  setIsEditing,
  postId,
}: {
  postData?: PostFormData;
  isEditing?: boolean;
  setIsEditing?: Dispatch<SetStateAction<boolean>>;
  postId?: string;
}) {
  const { user } = useAuth() as { user: User };
  const { isLoading } = useAppSelector((state) => state.post);

  const methods = useForm<PostFormData>({
    resolver: yupResolver(yupSchema),
    defaultValues: postData ? postData : defaultValues,
  });
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;
  const dispatch = useAppDispatch();

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          "image",
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      }
    },
    [setValue]
  );

  const onSubmit = (data: PostFormData) => {
    if (isEditing && setIsEditing) {
      dispatch(updatePost({ postId: postId as string, ...data }));
      setIsEditing(false);
    } else {
      dispatch(createPost({ userId: user._id, ...data })).then(() => reset());
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <FTextField
            name="content"
            multiline
            fullWidth
            rows={4}
            placeholder="Share what you are thinking here..."
            sx={{
              "& fieldset": {
                borderWidth: `1px !important`,
                borderColor: alpha("#919EAB", 0.32),
              },
            }}
          />

          <FUploadImage
            name="image"
            accept={{
              "image/*": [".jpeg", ".jpg", ".png"],
            }}
            maxSize={3145728}
            onDrop={handleDrop}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            {isEditing && setIsEditing ? (
              <>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="small"
                  loading={isSubmitting || isLoading}
                >
                  Save
                </LoadingButton>
                <Button
                  sx={{ ml: 3 }}
                  variant="contained"
                  size="small"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <LoadingButton
                type="submit"
                variant="contained"
                size="small"
                loading={isSubmitting || isLoading}
              >
                Post
              </LoadingButton>
            )}
          </Box>
        </Stack>
      </FormProvider>
    </Card>
  );
}

export default PostForm;
