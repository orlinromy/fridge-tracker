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
import CreateItem from "./addItem/CreateItem";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FridgeDetail = () => {
  const inputFormat = {
    name: null,
    qty: null,
    expiry: null,
    ownerEmail: null,
    tag: null,
    buyDate: null,
  };

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
  const newMemberEmailRef = useRef();
  const [fields, setFields] = useState([{ ...inputFormat }]);
  const [isCreate, setIsCreate] = useState(false);
  const [isAddMember, setAddMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState();

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
    setItemList([]);
    setWarnItems([]);
    setAddMemberError();
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
      });
      setItemList((prevState) => [...prevState, ...data.fridge.items]);
      for (const item of data.fridge.items) {
        if (
          // https://stackoverflow.com/questions/7751936/javascript-date-plus-2-weeks-14-days#:~:text=12096e5%20is%20a%20magic%20number,now()%20%2B%2012096e5)%3B
          new Date(item.expiry) <= new Date(Date.now() + 12096e5)
        ) {
          setWarnItems((prevState) => [...prevState, item]);
        }
      }
      setLoggedInUser(data.userId);
      setFridgeData(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }
  function handleCreateClose() {
    setIsCreate(false);
  }

  async function addNewItem(userInput) {
    try {
      const requestOptions = {
        method: "PUT",
        headers: new Headers({
          Authorization:
            "Bearer " + localStorage.getItem("access") ||
            authCtx.credentials.access,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(userInput),
      };

      const res = await fetch(
        "http://localhost:5001/api/users/items",
        requestOptions
      );
      if (res.ok) {
        setIsCreate(false);
        getFridgeData(params.fridgeId);
      } else {
        throw Error();
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleCreateSubmit() {
    const addedItems = [...fields];
    console.log(addedItems);
    addedItems.forEach((item) => {
      if (typeof item.tag === "string") {
        const tags = item.tag
          .split(/,(\s)?/)
          .filter((data) => data !== " " && data !== undefined);
        item.tag = tags;
      }
      const date = new Date(item.buyDate);
      item.buyDate = date;
      const expiryDate = new Date(item.expiry);
      item.expiry = expiryDate;
      const qty = parseInt(item.qty);
      item.qty = qty;
      const ownerEmail = item.ownerEmail || fridgeData.fridge.adminEmail;
      item.ownerEmail = ownerEmail;
    });

    const userInput = {
      fridgeId: params.fridgeId,
      items: addedItems,
    };
    console.log(userInput);
    addNewItem(userInput);
  }

  async function addNewMember(newMemberEmail) {
    try {
      const requestOptions = {
        method: "PATCH",
        headers: new Headers({
          Authorization:
            "Bearer " + localStorage.getItem("access") ||
            authCtx.credentials.access,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          fridgeId: fridgeData.fridge._id,
          email: newMemberEmail,
        }),
      };

      const res = await fetch(
        "http://localhost:5001/api/users/member",
        requestOptions
      );
      if (res.ok) {
        setAddMember(false);
        getFridgeData(params.fridgeId);
      } else {
        // setAddMemberError(res.text());
        const text = await res.json();
        console.log(text);
        throw Error(text);
      }
    } catch (error) {
      console.log(error);
      setAddMemberError(error);
    }
  }

  function handleAddNewMember() {
    const newMemberEmail = newMemberEmailRef.current.value;
    addNewMember(newMemberEmail);
  }
  function handleAddMemberClose() {
    setAddMember(false);
  }

  useEffect(() => {
    setItemList([]);
    setWarnItems([]);
    getFridgeData(params.fridgeId);
  }, []);

  return (
    !isLoading && (
      <>
        <Button
          onClick={() => {
            setIsCreate(true);
          }}
        >
          Add New Item
        </Button>
        <Button
          disabled={loggedInUser === fridgeData.admin}
          onClick={() => {
            setAddMember(true);
          }}
        >
          Add Member
        </Button>
        <p className="text-2xl">Members</p>
        <p className="text-lg">{fridgeData.fridge.adminName}</p>
        {fridgeData.fridge.memberNames.map((member) => (
          <p>{member}</p>
        ))}
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
            <p>{item.ownerName}</p>
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
                <p>{item.ownerName}</p>
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
                  {item.fridgeMember.map((member, idx) => {
                    return (
                      <option value={member}>
                        {fridgeData.fridge.memberNames[idx]}
                      </option>
                    );
                  })}
                  <option value={item.fridgeAdmin}>
                    {fridgeData.fridge.adminName}
                  </option>
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
        <Dialog
          open={isCreate}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleCreateClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>Add New Item</DialogTitle>
          <DialogContent>
            <CreateItem
              fields={fields}
              setFields={setFields}
              data={fridgeData.fridge}
            ></CreateItem>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={isAddMember}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleAddMemberClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>Add Member</DialogTitle>
          <DialogContent>
            <input
              type="email"
              ref={newMemberEmailRef}
              placeholder="Enter member's email"
            ></input>
            <p className="text-red-600">
              {addMemberError && addMemberError.message}
            </p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddNewMember}>Submit</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  );
};

export default FridgeDetail;
