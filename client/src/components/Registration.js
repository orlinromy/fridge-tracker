import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  // const someRef = useRef();
  const nameRef = useRef();
  const [error, setError] = useState();
  const [tokens, setTokens] = useState();

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
      const data = await res.json();
      console.log(data);
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
