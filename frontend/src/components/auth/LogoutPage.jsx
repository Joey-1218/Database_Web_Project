import React, { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import LoginContext from "../contexts/LoginContext";

export default function LogoutPage() {
  // assuming context is [auth, setAuth]
  const [, setLoginStatus] = useContext(LoginContext);
  const navigate = useNavigate();
  const ran = useRef(false); // guard against double effects in StrictMode

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Client-side cleanup (JWT stateless logout)
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("token"); // if you stored it separately
    setLoginStatus(null);
    delete api.defaults.headers.common.Authorization;

    // Redirect home (or to /login)
    navigate("/", { replace: true });
  }, [navigate, setLoginStatus]);

  return (
    <>
      <h1>Logging out…</h1>
      <p>Redirecting you to the home page.</p>
    </>
  );
}
