import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Icon from "../../1-Atoms/Icon";

const Button = styled.button`
  align-items: center;
  background: none;
  border: 0;
  cursor: pointer;
  display: flex;
  margin: 0;
  padding: 0;
`;

function IconButton({ icon, onClick }) {
  return (
    <Button onClick={onClick} type="button">
      <Icon name={icon} />
    </Button>
  );
}

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

export default IconButton;
