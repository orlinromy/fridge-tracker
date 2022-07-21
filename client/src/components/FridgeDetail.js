import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CreateItem from "./addItem/CreateItem";
import FridgeComp from "./fridge/FridgeComp";
import PersistentDrawerLeft from "./NavBar";

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
  const [loggedInUser, setLoggedInUser] = useState({});
  const nameRef = useRef();
  const qtyRef = useRef();
  const expiryRef = useRef();
  const ownerRef = useRef();
  const newMemberEmailRef = useRef();
  const [fields, setFields] = useState([{ ...inputFormat }]);
  const [isCreate, setIsCreate] = useState(false);
  const [isAddMember, setAddMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState();
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteItem, setDeleteItem] = useState("");
  const [addItemError, setAddItemError] = useState();
  const [editItemError, setEditItemError] = useState();

  async function updateItem(updatedData) {
    try {
      console.log(updatedData);
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
        setEditItemError();
        setEditedItem({});
        getFridgeData(params.fridgeId);
      } else {
        const err = await res.json();
        console.log(err);
        setEditItemError(err);
        throw Error(err);
      }
    } catch (err) {
      console.log(err);
      if (err.message === "jwt expired") {
        navigate("/welcome");
      }
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
      if (!res.ok) {
        const err = await res.json();
        throw Error(err.message);
      }
      const data = await res.json();

      data.fridge.items.forEach((item) => {
        item.fridgeId = data.fridge._id;
        item.fridgeName = data.fridge.fridgeName;
        item.fridgeMember = [...data.fridge.members];
        item.fridgeAdmin = data.fridge.admin;
      });
      for (const item of data.fridge.items) {
        // https://stackoverflow.com/questions/7751936/javascript-date-plus-2-weeks-14-days#:~:text=12096e5%20is%20a%20magic%20number,now()%20%2B%2012096e5)%3B
        if (new Date(item.expiry) <= new Date(Date.now() + 604800000)) {
          if (new Date(Date.now()) <= new Date(new Date(item.expiry))) {
            item.warn = "expiring";
          } else {
            item.warn = "expired";
          }
          setWarnItems((prevState) => [...prevState, item]);
        }
        setItemList((prevState) => [...prevState, item]);
        console.log(item);
      }
      setLoggedInUser({ userId: data.userId, userEmail: data.userEmail });
      setFridgeData(data);
      inputFormat.ownerEmail = loggedInUser.userEmail;
      setIsLoading(false);
    } catch (error) {
      console.log(error.message);
      if (error.message === "jwt expired") {
        navigate("/welcome");
      }
    }
  }

  function handleCreateClose() {
    setIsCreate(false);
  }

  async function addNewItem(userInput) {
    setAddItemError();
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
        setFields([{ ...inputFormat }]);
        getFridgeData(params.fridgeId);
      } else {
        const error = await res.json();
        console.log(error);
        setAddItemError(error);
        throw Error();
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleCreateSubmit() {
    const addedItems = JSON.parse(JSON.stringify(fields));
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

      if (loggedInUser.userId === fridgeData.fridge.admin) {
        const ownerEmail = item.ownerEmail || fridgeData.fridge.adminEmail;
        item.ownerEmail = ownerEmail;
      } else {
        const ownerEmail = loggedInUser.userEmail;
        item.ownerEmail = ownerEmail;
      }
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
        setAddMemberError(text);
        throw Error(text);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleAddNewMember() {
    const newMemberEmail = newMemberEmailRef.current.value;
    addNewMember(newMemberEmail);
  }

  function handleAddMemberClose() {
    setAddMember(false);
  }

  function handleDeleteClose() {
    setOpenDelete(false);
  }

  async function handleDeleteConfirm() {
    const userInput = {
      fridgeId: fridgeData.fridge._id,
      itemId: deleteItem,
    };
    try {
      const requestOptions = {
        method: "DELETE",
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
        setOpenDelete(false);
        getFridgeData(params.fridgeId);
      } else {
        const deleted = await res.json();
        console.log(deleted);
        throw Error();
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setItemList([]);
    setWarnItems([]);
    setAddMemberError();
    setAddItemError();
    setEditItemError();
    setFields([{ ...inputFormat }]);
    getFridgeData(params.fridgeId);
  }, []);

  return (
    !isLoading && (
      <div className="mt-[80px] mx-[30px]">
        <p className="text-xl">Admin: {fridgeData.fridge.adminName}</p>
        <p className="text-lg">Members:</p>
        {fridgeData.fridge.memberNames.map((member) => (
          <p>{member}</p>
        ))}
        <Button
          onClick={() => {
            setIsCreate(true);
          }}
          variant="outlined"
        >
          Add New Item
        </Button>
        <Button
          disabled={loggedInUser.userId !== fridgeData.fridge.admin}
          onClick={() => {
            setAddMember(true);
          }}
          variant="outlined"
        >
          Add Member
        </Button>
        <div className="flex flex-row justify-around">
          <FridgeComp
            type="warn"
            fridgeData={fridgeData}
            itemList={warnItems}
            loggedInUser={loggedInUser}
          ></FridgeComp>
          <FridgeComp
            type="normal"
            fridgeData={fridgeData}
            itemList={itemList}
            editedItem={editedItem}
            setEditedItem={setEditedItem}
            loggedInUser={loggedInUser}
            setOpenDelete={setOpenDelete}
            setDeleteItem={setDeleteItem}
            handleEditSubmit={handleEditSubmit}
            updateItem={updateItem}
            editItemError={editItemError}
            setEditItemError={setEditItemError}
          ></FridgeComp>
        </div>

        <Dialog
          open={isCreate}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleCreateClose}
          aria-describedby="alert-dialog-slide-description"
          fullWidth
          maxWidth="xl"
        >
          <DialogTitle>Add New Item</DialogTitle>
          <DialogContent>
            <CreateItem
              fields={fields}
              setFields={setFields}
              data={fridgeData.fridge}
              inputFormat={inputFormat}
              isAdmin={loggedInUser.userId === fridgeData.fridge.admin}
              loggedInUser={loggedInUser}
            ></CreateItem>
            {addItemError &&
              addItemError.message.map((err) => (
                <p className="text-red-600">{err.msg}</p>
              ))}
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

        <Dialog
          open={openDelete}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleDeleteClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>Are you sure you want to delete this item?</DialogTitle>
          <DialogContent>
            <p>Item will not be recoverable</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteConfirm}>Yes</Button>
            <Button onClick={handleDeleteClose}>No</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  );
};

export default FridgeDetail;

{
  /* old fridge code */
}
{
  /* <p className="text-2xl">Items in {fridgeData.fridge.fridgeName}</p>
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
          <div
            key={Math.random()}
            className={
              "flex flex-column justify-around " +
              (item.warn === "expiring"
                ? "bg-orange-300"
                : item.warn === "expired"
                ? "bg-red-300"
                : "")
            }
          >
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
                    item.owner !== loggedInUser.userId &&
                    loggedInUser.userId !== item.fridgeAdmin
                  }
                >
                  {item.owner === loggedInUser.userId ||
                  loggedInUser.userId === item.fridgeAdmin
                    ? "✏️"
                    : "❌"}
                </button>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={
                    item.owner !== loggedInUser.userId &&
                    loggedInUser.userId !== item.fridgeAdmin
                  }
                  onClick={() => {
                    setOpenDelete(true);
                    setDeleteItem(item._id);
                  }}
                >
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
                <button
                  onClick={() => {
                    setEditedItem({});
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        ))} */
}
{
  /* <p className="text-2xl">Expiring and Low-in-Stock items</p>
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
          <div
            key={Math.random()}
            className={
              "flex flex-column justify-around " +
              (item.warn === "expiring"
                ? "bg-orange-300"
                : item.warn === "expired"
                ? "bg-red-300"
                : "")
            }
          >
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
                item.owner !== loggedInUser.userId &&
                loggedInUser.userId !== item.fridgeAdmin
              }
            >
              {item.owner !== loggedInUser.userId &&
              loggedInUser.userId !== item.fridgeAdmin
                ? "✏️"
                : "❌"}
            </button>
            <Button
              variant="outlined"
              color="error"
              disabled={
                item.owner !== loggedInUser.userId &&
                loggedInUser.userId !== item.fridgeAdmin
              }
              onClick={() => {
                setOpenDelete(true);
                setDeleteItem(item._id);
              }}
            >
              Delete
            </Button>
          </div>
        ))} */
}
