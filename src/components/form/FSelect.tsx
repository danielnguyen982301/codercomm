import { useFormContext, Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import { ReactNode } from "react";

interface SelectProps extends Record<string, any> {
  children: ReactNode;
}

function FSelect({ name, children, ...other }: SelectProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          select
          fullWidth
          SelectProps={{ native: true }}
          error={!!error}
          helperText={error?.message}
          {...other}
        >
          {children}
        </TextField>
      )}
    />
  );
}

export default FSelect;
