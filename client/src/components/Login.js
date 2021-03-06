import React, { useState, useEffect, useRef, useContext } from "react";
import { Grid, Paper, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
const Login = () => {
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState();
  const authCtx = useContext(AuthContext);
  const paperStyle = {
    padding: 30,
    height: "73vh",
    width: "40vw",
    margin: "0 auto",
    // backgroundColor: "white",
  };
  const btnstyle = { margin: "45px 0" };
  const fieldstyle = {
    marginTop: "12px",
    marginBottom: "12px",
  };
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
      if (!res.ok) {
        const error = await res.json();
        setError(error);
        throw Error(error.message);
      }
      const data = await res.json();
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      authCtx.setCredentials(data);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  const handleUserLogin = (e) => {
    e.preventDefault();
    console.log(emailRef);
    console.log(passwordRef);
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const userInput = { email, password };
    login(userInput);
  };
  return (
    <Grid>
      <Paper style={paperStyle} className="bg-red-100">
        <Grid align="center">
          <p
            className="text-2xl mb-4 mt-2"
            style={{ marginBottom: "2px", marginTop: "55px" }}
          >
            Log In
          </p>
          <p className="text-md mb-4 mt-2">
            Please log in to view your fridges!
          </p>
        </Grid>
        <TextField
          label="Login Email"
          placeholder="Login Email"
          style={fieldstyle}
          inputRef={emailRef}
          fullWidth
        />
        <TextField
          label="Password"
          placeholder="Enter password"
          style={fieldstyle}
          type="password"
          inputRef={passwordRef}
          fullWidth
        />
        {error &&
          error.message.map((err) => <p className="text-red-600">{err.msg}</p>)}
        <Button
          type="submit"
          color="primary"
          variant="contained"
          style={btnstyle}
          fullWidth
          onClick={handleUserLogin}
        >
          Sign in
        </Button>
      </Paper>
    </Grid>
  );
};
export default Login;

// import React, { useState, useEffect, useRef, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import AuthContext from "../context/AuthContext";

// const Login = () => {
//   const navigate = useNavigate();
//   const emailRef = useRef();
//   const passwordRef = useRef();
//   const [error, setError] = useState();
//   // const [tokens, setTokens] = useState({});
//   const authCtx = useContext(AuthContext);

//   const login = async (userInput) => {
//     const options = {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(userInput),
//     };
//     try {
//       const res = await fetch("http://localhost:5001/api/users/login", options);
//       const data = await res.json();
//       localStorage.setItem("access", data.access);
//       localStorage.setItem("refresh", data.refresh);
//       authCtx.setCredentials(data);
//       navigate("/");
//     } catch (error) {
//       console.log(error.message);
//       setError(error);
//     }
//   };

//   const handleUserLogin = (e) => {
//     e.preventDefault();

//     const email = emailRef.current.value;
//     const password = passwordRef.current.value;

//     const userInput = { email, password };

//     login(userInput);
//   };

//   return (
//     <div>
//       <h1>Login</h1>
//       <form onSubmit={handleUserLogin}>
//         <label htmlFor="email">Email:</label>
//         <input id="email" ref={emailRef}></input>
//         <label htmlFor="password">Password:</label>
//         <input id="password" ref={passwordRef} type="password"></input>
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// };

// export default Login;
