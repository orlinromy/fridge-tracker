import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState();
  const [tokens, setTokens] = useState({});
  const authCtx = useContext(AuthContext);

  const login = async (userInput) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInput),
    };
    try {
      setTokens();
      const res = await fetch("http://localhost:5001/api/users/login", options);
      const data = await res.json();
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      authCtx.setCredentials(data);
      navigate("/");
    } catch (error) {
      console.log(error.message);
      setError(error);
    }
  };

  const handleUserLogin = (e) => {
    e.preventDefault();

    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    const userInput = { email, password };

    login(userInput);
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleUserLogin}>
        <label htmlFor="email">Email:</label>
        <input id="email" ref={emailRef}></input>
        <label htmlFor="password">Password:</label>
        <input id="password" ref={passwordRef} type="password"></input>
        <button type="submit">Login</button>
        <p>{tokens && JSON.stringify(tokens)}</p>
      </form>
    </div>
  );
};

export default Login;
