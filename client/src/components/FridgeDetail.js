import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Slide,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const FridgeDetail = () => {
  const params = useParams();
  const [fridgeData, setFridgeData] = useState({});
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();
  const [itemList, setItemList] = useState([]);
  const [warnItems, setWarnItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editedItem, setEditedItem] = useState({});
  const [loggedInUser, setLoggedInUser] = useState("");
  const nameRef = useRef();
  const qtyRef = useRef();
  const expiryRef = useRef();
  const ownerRef = useRef();

  async function updateItem(updatedData) {
    try {
      const options = {
        method: "PATCH",
        headers: new Headers({
          authorization:
            "Bearer " + localStorage.getItem("access") ||
            authCtx.credentials.access,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(updatedData),
      };
      console.log(options);
      //   console.log(authCtx.credentials.access);
      const res = await fetch("http://localhost:5001/api/users/item", options);
      console.log(res);
      if (res.ok) {
        getFridgeData(params.fridgeId);
        setEditedItem({});
      } else {
        throw Error();
      }
    } catch (err) {
      console.log(err);
    }
  }

  function handleEditSubmit() {
    const name = nameRef.current.value;
    const qty = qtyRef.current.value;
    const expiry = new Date(expiryRef.current.value);
    const owner = ownerRef.current.value;
    const itemId = editedItem._id;
    const fridgeId = editedItem.fridgeId;

    const updatedData = { itemId, fridgeId, name, qty, expiry, owner };
    console.log(updatedData);
    updateItem(updatedData);
  }

  async function getFridgeData(fridgeId) {
    setIsLoading(true);
    try {
      const options = {
        method: "GET",
        headers: new Headers({
          authorization:
            "Bearer " + localStorage.getItem("access") ||
            authCtx.credentials.access,
          "Content-Type": "application/json",
        }),
      };
      const res = await fetch(
        `http://localhost:5001/api/users/fridge/${fridgeId}`,
        options
      );
      console.log(res);
      if (!res.ok) throw Error();
      const data = await res.json();
      data.fridge.items.forEach((item) => {
        item.fridgeId = data.fridge._id;
        item.fridgeName = data.fridge.fridgeName;
        item.fridgeMember = [...data.fridge.members];
        item.fridgeAdmin = data.fridge.admin;
        console.log(item);
      });
      setItemList((prevState) => [...prevState, ...data.fridge.items]);
      for (const item of data.fridge.items) {
        console.log(new Date(Date.now()));
        if (
          // https://stackoverflow.com/questions/7751936/javascript-date-plus-2-weeks-14-days#:~:text=12096e5%20is%20a%20magic%20number,now()%20%2B%2012096e5)%3B
          new Date(item.expiry) <= new Date(Date.now() + 12096e5)
        ) {
          setWarnItems((prevState) => [...prevState, item]);
        }
      }
      //   console.log(data);
      //   setFridgeData(data);
      setLoggedInUser(data.userId);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    console.log(params.fridgeId);
    getFridgeData(params.fridgeId);
  }, []);

  return (
    !isLoading && (
      <>
        {/* <Button
          onClick={() => {
            setIsCreate(true);
          }}
        >
          Create a New Fridge
        </Button> */}
        <p className="text-2xl">Expiring and Low-in-Stock items</p>
        <div
          key={Math.random()}
          className="tableHeader flex flex-column justify-around"
        >
          <p>Item Name</p>
          <p>Quantity</p>
          <p>Expiry Date</p>
          <p>Owner</p>
          <p>Fridge Name</p>
          <p className="text-slate-200">Button 1</p>
          <p className="text-slate-200">Button 2</p>
        </div>
        {warnItems.map((item) => (
          <div key={Math.random()} className="flex flex-column justify-around">
            <p>{item.name}</p>
            <p>{item.qty}</p>
            <p>{item.expiry.split("T")[0]}</p>
            <p>{item.owner}</p>
            <p>{item.fridgeName}</p>
            <button
              onClick={() => {
                setEditedItem(item);
              }}
              disabled={item.owner !== loggedInUser}
            >
              {item.owner === loggedInUser ? "✏️" : "❌"}
            </button>
            <Button variant="outlined" color="error">
              Delete
            </Button>
          </div>
        ))}
        {/* start fridge module*/}
        <p className="text-2xl">User: {loggedInUser}</p>
        <div
          key={Math.random()}
          className="tableHeader flex flex-column justify-around"
        >
          <p>Item Name</p>
          <p>Quantity</p>
          <p>Expiry Date</p>
          <p>Owner</p>
          <p>Fridge Name</p>
          <p className="text-slate-200">Button 1</p>
          <p className="text-slate-200">Button 2</p>
        </div>
        {itemList.map((item) => (
          <div key={Math.random()} className="flex flex-column justify-around">
            {!editedItem || editedItem._id !== item._id ? (
              <>
                <p>{item.name}</p>
                <p>{item.qty}</p>
                <p>{item.expiry.split("T")[0]}</p>
                <p>{item.owner}</p>
                <p>{item.fridgeName}</p>
                <button
                  onClick={() => {
                    setEditedItem(item);
                  }}
                  disabled={
                    item.owner !== loggedInUser &&
                    loggedInUser !== item.fridgeAdmin
                  }
                >
                  {item.owner === loggedInUser ||
                  loggedInUser === item.fridgeAdmin
                    ? "✏️"
                    : "❌"}
                </button>
                <Button variant="outlined" color="error">
                  Delete
                </Button>
              </>
            ) : (
              <>
                <input ref={nameRef} defaultValue={item.name}></input>
                <input
                  ref={qtyRef}
                  type="number"
                  defaultValue={item.qty}
                ></input>
                <input
                  ref={expiryRef}
                  type="date"
                  defaultValue={item.expiry.split("T")[0]}
                ></input>
                <select id="item-owner" ref={ownerRef}>
                  {item.fridgeMember.map((member) => {
                    return <option value={member}>{member}</option>;
                  })}
                  <option value={item.fridgeAdmin}>{item.fridgeAdmin}</option>
                </select>
                <p>{item.fridgeName}</p>
                <button onClick={handleEditSubmit}>✅</button>
                <Button variant="outlined" color="error">
                  Delete
                </Button>
              </>
            )}
          </div>
        ))}
      </>
    )
  );
};

export default FridgeDetail;
