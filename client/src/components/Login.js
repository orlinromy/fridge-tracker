import React, { useState, useEffect, useRef } from "react";
import { ReactDOM } from "react-dom";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();

  const login = async (userInput) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInput),
    };
    try {
      const res = await fetch("http://localhost:5001/api/users/login", options);
    } catch {
      console.log(error.mesasge);
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
      </form>
    </div>
  );
};

export default Login;
