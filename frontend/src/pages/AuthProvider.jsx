import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks/useStorage";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { APP_URL, DISCORD_AUTH_URL, getOAuthUrl as getDiscordAuthUrl } from "../util/constants";
import { set } from "react-hook-form";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();

  const loginWithEmail = async (email, password, redirect) => {
    const data = new FormData();
    data.append("email", email);
    data.append("password", password);
    try {
      const response = await axios.post("/auth/login.php", data);
      const user = await response.data;
      setUser(user);
      if (redirect) {
        navigate(redirect);
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const loginWithDiscord = async (url) => {
    let redirect = url ? encodeURIComponent("/" + url) : "";
    let postOAuthLogin = APP_URL + "/post-oauth" + redirect;
    window.location.href = DISCORD_AUTH_URL + "?redirect=" + postOAuthLogin;
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout.php");
      setUser(null);
      toast.success("Logged out successfully.");
    } catch (err) {
      if (err.response.status === 401) {
        // Reachable, but wasn't logged in
        setUser(null);
        toast.error("You weren't logged in.");
      } else {
        toast.error(err.message);
      }
    }
  };

  const checkSession = async () => {
    try {
      const response = await axios.get("/auth/check_session.php");
      const user = await response.data;
      setUser(user);
    } catch (err) {
      if (err.response.status === 401) {
        // Unauthorized, but check succeeded
        setUser(null);
      } else {
        console.log("Failed session check", err);
      }
    }
  };

  // Call once per page load
  useEffect(() => {
    checkSession();
  }, []);

  const isLoggedIn = user !== null;
  const isVerifier = user !== null && user.is_verifier === true;
  const isAdmin = user !== null && user.is_admin === true;
  const hasVerifierPriv = isVerifier || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isVerifier,
        isAdmin,
        loginWithEmail,
        loginWithDiscord,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
