import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Container = styled.section`
  margin-top: 65px;
  padding: 30px;
`;

function Content({ children }) {
  return <Container>{children}</Container>;
}

Content.propTypes = {
  children: PropTypes.node.isRequired
};

export default Content;
