import React from "react";
import PropTypes from "prop-types";

import { StyledMain } from "./styles";

function Main({ children }) {
  return <StyledMain>{children}</StyledMain>;
}

Main.propTypes = {
  children: PropTypes.node.isRequired
};

export default Main;
