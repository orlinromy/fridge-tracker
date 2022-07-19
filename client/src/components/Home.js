import React, { useEffect, useState, useRef, useContext } from "react";
// import fridgeData from "../tempData/fridgeData";
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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Home = () => {
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
  const authCtx = useContext(AuthContext);
  const [isCreate, setIsCreate] = useState(false);
  const [error, setError] = useState();
  const createFridgeNameRef = useRef();
  const createFridgeMembersRef = useRef();
  const createNameRef = useRef();
  const createQuantityRef = useRef();
  const createExpiryRef = useRef();
  const createBuyDateRef = useRef();
  const createOwnerRef = useRef();
  const createTagRef = useRef();

  async function getItem() {
    setIsLoading(true);
    setItemList([]);
    setWarnItems([]);

    try {
      // source: https://stackoverflow.com/questions/30203044/using-an-authorization-header-with-fetch-in-react-native
      const options = {
        method: "POST",
        headers: new Headers({
          Authorization:
            "Bearer " + localStorage.getItem("access") ||
            authCtx.credentials.access,
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      };
      const res = await fetch(
        "http://localhost:5001/api/users/fridges",
        options
      );
      console.log(res);
      if (!res.ok) throw Error();
      const data = await res.json();
      console.log(data);

      for (const fridge of data.result) {
        fridge.items.forEach((item) => {
          item.fridgeId = fridge._id;
          item.fridgeName = fridge.fridgeName;
          item.fridgeMember = [...fridge.members];
          item.fridgeAdmin = fridge.admin;
          console.log(item);
        });
        setItemList((prevState) => [...prevState, ...fridge.items]);
        for (const item of fridge.items) {
          console.log(new Date(Date.now()));
          if (
            // https://stackoverflow.com/questions/7751936/javascript-date-plus-2-weeks-14-days#:~:text=12096e5%20is%20a%20magic%20number,now()%20%2B%2012096e5)%3B
            new Date(item.expiry) <= new Date(Date.now() + 12096e5)
          ) {
            setWarnItems((prevState) => [...prevState, item]);
          }
        }
      }
      setLoggedInUser(data.userId);
    } catch (error) {
      console.log(error.message);

      navigate("/login");
    }
    setIsLoading(false);
  }

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
        getItem();
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

  async function createNewFridge(userInput) {
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
        "http://localhost:5001/api/users/fridge",
        requestOptions
      );
      if (!res.ok) throw Error();
      const data = await res.json();
      console.log(data);
      const newFridgeId = data.data._id;
      navigate(`/fridge/${newFridgeId}`);
    } catch (error) {
      console.log(error);
    }
  }

  function handleCreateSubmit() {
    const fridgeName = createFridgeNameRef.current.value;
    const fridgeMembers = createFridgeMembersRef.current.value;
    const memberEmails = fridgeMembers
      .split(/,(\s)?/)
      .filter((data) => data !== " " && data !== undefined);
    const name = createNameRef.current.value;
    const qty = parseInt(createQuantityRef.current.value);
    const expiry = new Date(createExpiryRef.current.value);
    const buyDate = new Date(createBuyDateRef.current.value);
    const ownerEmail = createOwnerRef.current.value;
    const tags = createTagRef.current.value;
    const tag = tags
      .split(/,(\s)?/)
      .filter((data) => data !== " " && data !== undefined);

    console.log({
      fridgeName,
      memberEmails,
      items: [{ name, qty, ownerEmail, tag, expiry, buyDate }],
    });
    const userInput = {
      fridgeName,
      memberEmails,
      items: [{ name, qty, ownerEmail, tag, expiry, buyDate }],
    };
    createNewFridge(userInput);
  }

  function handleCreateClose() {
    setIsCreate(false);
  }

  useEffect(() => {
    setLoggedInUser("");
    getItem();
  }, []);

  return (
    !isLoading && (
      <>
        <Button
          onClick={() => {
            setIsCreate(true);
          }}
        >
          Create a New Fridge
        </Button>
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
        <Dialog
          open={isCreate}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleCreateClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>Create New Fridge</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              id="fridgeName"
              label="Fridge name"
              fullWidth
              margin="normal"
              inputRef={createFridgeNameRef}
            />
            {/* use text input for now */}
            <TextField
              id="member"
              label="Members"
              fullWidth
              margin="normal"
              inputRef={createFridgeMembersRef}
            />
            {/* input 1 item for now  */}

            <label htmlFor="name">Item Name:</label>
            <input id="name" ref={createNameRef}></input>
            <br />
            <label htmlFor="quantity">Quantity:</label>
            <input id="quantity" type="number" ref={createQuantityRef}></input>
            <br />
            <label htmlFor="expirydate">Expiry Date:</label>
            <input id="expirydate" type="date" ref={createExpiryRef}></input>
            <br />
            <label htmlFor="buydate">Buy Date:</label>
            <input id="buydate" type="date" ref={createBuyDateRef}></input>
            <br />
            <label htmlFor="owner">Owner:</label>
            <input id="owner" ref={createOwnerRef}></input>
            <br />
            <label htmlFor="tag">Tag:</label>
            <input id="tag" ref={createTagRef}></input>
            <br />
            {/* {error && (
              <ul>
                {error.map((err) => (
                  <li key={Math.random()} style={{ color: "red" }}>
                    {err.msg}
                  </li>
                ))}
              </ul>
            )} */}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  );
};

export default Home;
