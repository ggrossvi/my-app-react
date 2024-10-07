import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
//import { auth, logInWithEmailAndPassword, signInWithGoogle } from "./firebase";
import { auth, signInWithGoogle } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./Login.css";
import { logInWithEmailAndPassword } from "./serviceRequest";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const [UserResponse, setUserResponse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (UserResponse == null || UserResponse == undefined) {
      // maybe trigger a loading screen
      return;
    }
    // passing user info to dashboard
    if (UserResponse) navigate("/dashboard", { state: { user_email: email } });
  }, [UserResponse]);

  const invokeLogin = async (email, password) => {
    const response = await logInWithEmailAndPassword(email, password);
    setUserResponse(response);
  };

  return (
    <div className="login">
      <div className="login__container">
        <input
          type="text"
          className="login__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />
        <input
          type="password"
          className="login__textBox"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          className="login__btn"
          onClick={() => invokeLogin(email, password)}
        >
          Login
        </button>
        <button className="login__btn login__google" onClick={signInWithGoogle}>
          Login with Google
        </button>
        <div>
          <Link to="/reset">Forgot Password</Link>
        </div>
        <div>
          Don't have an account? <Link to="/register">Register</Link> now.
        </div>
        <div>
          See buddies in your area without registering.{" "}
          <Link to="/dashboard">Map of Buddies</Link>.
        </div>
      </div>
    </div>
  );
}

export default Login;
