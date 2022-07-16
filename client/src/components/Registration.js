import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef();

  const register = async () => {
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
        <input id="password" type="password" ref={passwordRef}></input>
        <br />
        <label htmlFor="name">Name:</label>
        <br />
        <button>Submit</button>
      </form>
    </div>
  );
};

export default Registration;
