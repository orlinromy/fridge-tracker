import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./components/Home";
// import Login from "./components/Login";
// import Registration from "./components/Registration";
import CreateItem from "./components/addItem/CreateItem";
import FridgeDetail from "./components/FridgeDetail";
import AuthContext from "./context/AuthContext";
import Welcome from "./components/Welcome";
import PersistentDrawerLeft from "./components/NavBar";

function App() {
  const [credentials, setCredentials] = useState();
  const [fridges, setFridges] = useState([]);
  return (
    <AuthContext.Provider
      value={{ credentials, setCredentials, fridges, setFridges }}
    >
      <div className="App">
        <PersistentDrawerLeft fridges={fridges}></PersistentDrawerLeft>
        <Routes>
          <Route path="/" element={<Home></Home>}></Route>
          {/* <Route
            path="/register"
            element={<Registration></Registration>}
          ></Route>
          <Route path="/login" element={<Login></Login>}></Route> */}
          <Route path="/welcome" element={<Welcome></Welcome>}></Route>
          <Route path="/create" element={<CreateItem></CreateItem>}></Route>
          <Route
            path="/fridge/:fridgeId"
            element={<FridgeDetail></FridgeDetail>}
          ></Route>
          <Route path="/test" element={<CreateItem></CreateItem>}></Route>
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
