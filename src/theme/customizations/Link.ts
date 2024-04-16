import { Theme } from "@mui/material";

function Link(theme: Theme) {
  return {
    MuiLink: {
      defaultProps: {
        underline: "hover",
      },
    },
  };
}

export default Link;
