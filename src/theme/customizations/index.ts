import Card from "./Card";
import Tabs from "./Tabs";
import Link from "./Link";
import { Theme } from "@mui/material";

function customizeComponents(theme: Theme) {
  return { ...Tabs(theme), ...Card(theme), ...Link(theme) };
}

export default customizeComponents;
