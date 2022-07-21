import React, { useState, useEffect, useRef, useContext } from "react";
import { Grid, Paper, Typography, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
const Registration = () => {
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef();
  const authCtx = useContext(AuthContext);
  const [error, setError] = useState();
  const paperStyle = {
    padding: 30,
    height: "73vh",
    width: "40vw",
    margin: "0 auto",
    backgroundColor: "white",
    backdropFilter: "blur(26px)",
  };
  const btnstyle = { margin: "30px 0" };
  const headerStyle = { marginTop: "35px", marginBottom: "10px" };
  const fieldstyle = {
    marginTop: "12px",
    marginBottom: "12px",
  };
  const register = async (userInput) => {
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInput),
    };
    try {
      const res = await fetch(
        "http://localhost:5001/api/users/register",
        options
      );
      if (!res.ok) {
        // console.log(res.text());
        const err = await res.json();
        console.log(err);
        setError(err);
        throw new Error(err.message);
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
    console.log(nameRef.current.value);
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const name = nameRef.current.value;
    const userInput = { email, password, name };
    console.log(userInput);
    register(userInput);
  };
  return (
    <Grid>
      <Paper style={paperStyle}>
        <Grid align="center">
          <p className="text-2xl mb-4 mt-2" style={headerStyle}>
            Register
          </p>
          <p className="text-md mb-4 mt-2">
            Please fill this form to create an account!
          </p>
        </Grid>
        <form>
          <TextField
            fullWidth
            label="Name"
            placeholder="Enter your name"
            style={fieldstyle}
            inputRef={nameRef}
            required
          />
          <TextField
            fullWidth
            label="Login Email"
            placeholder="Enter your login email"
            style={fieldstyle}
            inputRef={emailRef}
            required
          />
          <TextField
            fullWidth
            label="Password"
            placeholder="Enter your password"
            type="password"
            style={fieldstyle}
            inputRef={passwordRef}
            required
          />
          {error &&
            error.message.map((err) => (
              <p className="text-red-600">{err.msg}</p>
            ))}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={btnstyle}
            onClick={handleSubmit}
            fullWidth
          >
            Register
          </Button>
        </form>
      </Paper>
    </Grid>
  );
};
export default Registration;

// import React, { useRef, useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import AuthContext from "../context/AuthContext";

// const Registration = () => {
//   const navigate = useNavigate();
//   const emailRef = useRef();
//   const passwordRef = useRef();
//   const nameRef = useRef();
//   const authCtx = useContext(AuthContext);
//   const [error, setError] = useState();

//   const register = async (userInput) => {
//     const options = {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(userInput),
//     };
//     try {
//       const res = await fetch(
//         "http://localhost:5001/api/users/register",
//         options
//       );
//       if (!res.ok) {
//         console.log(res);
//         throw new Error(res.statusText);
//       }
//       const data = await res.json();
//       console.log("registration: " + JSON.stringify(data));

//       // login the user after registration
//       const loginOptions = {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userInput),
//       };

//       const loginRes = await fetch(
//         "http://localhost:5001/api/users/login",
//         loginOptions
//       );
//       if (!loginRes.ok) {
//         console.log(loginRes);
//         throw new Error(loginRes.statusText);
//       }
//       const loginData = await loginRes.json();
//       localStorage.setItem("access", loginData.access);
//       localStorage.setItem("refresh", loginData.refresh);
//       authCtx.setCredentials(loginData);
//       navigate("/");
//     } catch {
//       console.log(error);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log(emailRef);
//     console.log(passwordRef);
//     console.log(nameRef);
//     const email = emailRef.current.value;
//     const password = passwordRef.current.value;
//     const name = nameRef.current.value;

//     const userInput = { email, password, name };
//     register(userInput);
//   };

//   return (
//     <div>
//       <h1>Register</h1>
//       <form onSubmit={handleSubmit}>
//         <label htmlFor="email">Email:</label>
//         <input id="email" ref={emailRef}></input>
//         <br />
//         <label htmlFor="password">Password:</label>
//         <input id="password" ref={passwordRef} type="password"></input>
//         <br />
//         <label htmlFor="name">Name:</label>
//         <input id="name" ref={nameRef}></input>
//         <br />
//         <button>Submit</button>
//       </form>
//     </div>
//   );
// };

// export default Registration;
