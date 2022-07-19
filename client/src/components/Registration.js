import React, { useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Registration = () => {
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef();
  const authCtx = useContext(AuthContext);
  const [error, setError] = useState();

  const register = async (userInput) => {
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInput),
    };
    try {
      const res = await fetch("http://localhost:5001/api/users/user", options);
      if (!res.ok) {
        console.log(res);
        throw new Error(res.statusText);
      }
      const data = await res.json();
      console.log("registration: " + JSON.stringify(data));

      // login the user after registration
      const loginOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInput),
      };

      const loginRes = await fetch(
        "http://localhost:5001/api/users/login",
        loginOptions
      );
      if (!loginRes.ok) {
        console.log(loginRes);
        throw new Error(loginRes.statusText);
      }
      const loginData = await loginRes.json();
      localStorage.setItem("access", loginData.access);
      localStorage.setItem("refresh", loginData.refresh);
      authCtx.setCredentials(loginData);
      navigate("/");
    } catch {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(emailRef);
    console.log(passwordRef);
    console.log(nameRef);
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const name = nameRef.current.value;

    const userInput = { email, password, name };
    register(userInput);
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input id="email" ref={emailRef}></input>
        <br />
        <label htmlFor="password">Password:</label>
        <input id="password" ref={passwordRef} type="password"></input>
        <br />
        <label htmlFor="name">Name:</label>
        <input id="name" ref={nameRef}></input>
        <br />
        <button>Submit</button>
      </form>
    </div>
  );
};

export default Registration;
