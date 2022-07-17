import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/Login";
import Registration from "./components/Registration";
import CreateItem from "./components/CreateItem";
import AuthContext from "./context/AuthContext";

function App() {
  const [credentials, setCredentials] = useState();
  return (
    <AuthContext.Provider value={{ credentials, setCredentials }}>
      <div className="App bg-slate-200">
        <Routes>
          <Route path="/" element={<Home></Home>}></Route>
          <Route
            path="/register"
            element={<Registration></Registration>}
          ></Route>
          <Route path="/login" element={<Login></Login>}></Route>
          <Route path="/create" element={<CreateItem></CreateItem>}></Route>
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
