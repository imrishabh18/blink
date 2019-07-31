import React from "react";

import { ReactComponent as Logo } from "../../assets/images/agenda.svg";
import { ReactComponent as LogOut } from "../../assets/images/log-out.svg";

export default function Header({ handleSignOut }) {
  return (
    <nav className="navigation">
      <a className="navigation-title-link" href="/">
        <Logo className="logo header-icon" />
        <h1 className="logo-title">Blink</h1>
      </a>

      <ul className="navigation-list">
        <li className="navigation-item">
          <LogOut className="logout header-icon" onClick={handleSignOut} />
        </li>
      </ul>
    </nav>
  );
}
