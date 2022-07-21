import React, { useEffect, useState, useRef, useContext } from "react";
import FridgeComp from "./fridge/FridgeComp";
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
import CreateItem from "./addItem/CreateItem";
import PersistentDrawerLeft from "./NavBar.js";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Home = () => {
  const navigate = useNavigate();
  const [fridgeData, setFridgeData] = useState([]);
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
  const [fields, setFields] = useState([]);
  const [createFridgeError, setCreateFridgeError] = useState();

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

      for (const fridge of data.fridge) {
        authCtx.setFridges((prevState) => [
          ...prevState,
          { id: fridge._id, fridgeName: fridge.fridgeName },
        ]);

        fridge.items.forEach((item) => {
          item.fridgeId = fridge._id;
          item.fridgeName = fridge.fridgeName;
          item.fridgeMember = [...fridge.members];
          item.fridgeAdmin = fridge.admin;
          console.log(item);
        });
        // setItemList((prevState) => [...prevState, [...fridge.items]]);
        // setItemList((prevState) => [...prevState, ...fridge.items]);
        const warnItemList = [];
        const allItems = [];
        for (const item of fridge.items) {
          if (new Date(item.expiry) <= new Date(Date.now() + 604800000)) {
            if (new Date(Date.now()) <= new Date(new Date(item.expiry))) {
              item.warn = "expiring";
            } else {
              item.warn = "expired";
            }
            warnItemList.push(JSON.parse(JSON.stringify(item)));
          }
          allItems.push(JSON.parse(JSON.stringify(item)));
          // setItemList((prevState) => {
          //   const items = prevState[prevState.length - 1];
          //   items.push(item);
          //   return [...prevState, items];
          // });
          // setWarnItems((prevState) => [...prevState, []]);
          // console.log(item);

          // console.log(new Date(Date.now()));
          // if (
          //   // https://stackoverflow.com/questions/7751936/javascript-date-plus-2-weeks-14-days#:~:text=12096e5%20is%20a%20magic%20number,now()%20%2B%2012096e5)%3B
          //   new Date(item.expiry) <= new Date(Date.now() + 12096e5)
          // ) {
          //   // setWarnItems((prevState) => {
          //   //   const items = prevState[prevState.length - 1];
          //   //   return [...prevState, [...items]];
          //   // });
          //   setWarnItems((prevState) => [...prevState, item]);
          // }
        }
        console.log("warn item list", warnItemList);
        console.log("all items", allItems);
        setItemList((prevState) => [
          ...prevState,
          JSON.parse(JSON.stringify(allItems)),
        ]);
        setWarnItems((prevState) => [
          ...prevState,
          JSON.parse(JSON.stringify(warnItemList)),
        ]);
        setFridgeData((prevState) => [...prevState, fridge]);
      }
      setLoggedInUser(data.userId);
    } catch (error) {
      console.log(error.message);
      navigate("/welcome");
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
      if (!res.ok) {
        const err = await res.json();
        console.log(err);
        setCreateFridgeError(err);
        throw Error(err);
      } else {
        const data = await res.json();
        console.log(data);
        const newFridgeId = data.data._id;
        navigate(`/fridge/${newFridgeId}`);
      }
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
    const addedItems = JSON.parse(JSON.stringify(fields)); // [...fields];

    addedItems.forEach((item) => {
      if (typeof item.tag === "string") {
        console.log("item.tag is string");
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
      console.log(addedItems);
    });
    const userInput = {
      fridgeName,
      memberEmails,
      items: addedItems,
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
      <div className="mt-[80px] mb-[40px] mx-[20px] bg-transparent">
        <Button
          onClick={() => {
            setIsCreate(true);
          }}
          variant="contained"
          className="justify-center"
        >
          Create a New Fridge
        </Button>
        <div className="flex flex-row overflow-x-scroll">
          {warnItems.map((item, idx) => {
            return (
              <div className="flex flex-col w-[50%]">
                <FridgeComp
                  type="view warn"
                  fridgeData={{ fridge: fridgeData[idx] }}
                  itemList={item}
                  loggedInUser={loggedInUser}
                ></FridgeComp>
                <FridgeComp
                  type="view normal"
                  fridgeData={{ fridge: fridgeData[idx] }}
                  itemList={itemList[idx]}
                  loggedInUser={loggedInUser}
                ></FridgeComp>
              </div>
            );
          })}

          {/* {itemList.map((item, idx) => {
            return (
              <FridgeComp
                type="view normal"
                fridgeData={{ fridge: fridgeData[idx] }}
                itemList={item}
                loggedInUser={loggedInUser}
              ></FridgeComp>
            );
          })} */}
        </div>
        {/* </div> */}
        <Dialog
          open={isCreate}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleCreateClose}
          aria-describedby="alert-dialog-slide-description"
          fullWidth
          maxWidth="lg"
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

            <TextField
              id="member"
              label="Members"
              fullWidth
              margin="normal"
              inputRef={createFridgeMembersRef}
            />

            <CreateItem
              fields={fields}
              setFields={setFields}
              mode="create"
              isAdmin={true}
            ></CreateItem>
            {createFridgeError &&
              createFridgeError.message.map((err) => (
                <p className="text-red-600">{err.msg}</p>
              ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  );
};

export default Home;
