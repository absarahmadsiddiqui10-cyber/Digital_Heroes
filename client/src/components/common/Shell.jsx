import React from "react";
import { Link } from "react-router-dom";
import { getUser, clearSession } from "../../services/api.js";

export default function Shell({ children }) {
  let user = getUser();
  return (
    <>
      <header>
        <Link className="logo" to="/">
          ◉ DIGITAL<span>HEROES</span>
          <small>PLAY WITH PURPOSE</small>
        </Link>
        <nav>
          <Link to="/charities">Charities</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
          {user ? (
            <button
              onClick={() => {
                clearSession();
                location.href = "/";
              }}
            >
              Log out
            </button>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link className="btn mini" to="/signup">
                Join now ↗
              </Link>
            </>
          )}
        </nav>
      </header>
      {children}
      <footer>Digital Heroes · Better scores. Bigger impact.</footer>
    </>
  );
}
