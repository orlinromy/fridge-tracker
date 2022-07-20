import React, { useRef } from "react";
import { Button, Card, CardContent } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EditOffOutlinedIcon from "@mui/icons-material/EditOffOutlined";

const FridgeComp = (props) => {
  const nameRef = useRef();
  const qtyRef = useRef();
  const expiryRef = useRef();
  const ownerRef = useRef();
  console.log(props);

  function handleEditSubmit() {
    const name = nameRef.current.value;
    const qty = qtyRef.current.value;
    const expiry = new Date(expiryRef.current.value);
    const owner = ownerRef.current.value;
    const itemId = props.editedItem._id;
    const fridgeId = props.editedItem.fridgeId;

    const updatedData = { itemId, fridgeId, name, qty, expiry, owner };
    console.log(updatedData);
    props.updateItem(updatedData);
  }
  return (
    // <div className="">
    <div className="mt-8 drop-shadow-xl h-[50vh] w-[40vw] overflow-y-scroll justify-center">
      <p className="text-2xl">
        {props.type === "warn" || props.type === "view warn"
          ? "Expiring and Expired Items"
          : `Items in ${props.fridgeData.fridge.fridgeName}`}
      </p>
      {/* <div
        key={Math.random()}
        className="tableHeader flex flex-column justify-around"
      >
        <p>Item Name</p>
        <p>Quantity</p>
        <p>Expiry Date</p>
        <p>Owner</p>
        <p>Fridge Name</p>
        {props.type === "normal" && (
          <>
            <p>Button 1</p>
            <p>Button 2</p>
          </>
        )}
      </div> */}
      {props.itemList.map((item) => (
        <div
          key={Math.random()}
          className={
            "rounded-md mb-4 " +
            (item.warn === "expiring"
              ? "bg-orange-300"
              : item.warn === "expired"
              ? "bg-red-300"
              : "bg-white")
          }
        >
          {!props.editedItem || props.editedItem._id !== item._id ? (
            <div className="flex flex-row justify-between">
              <div className="flex flex-col">
                <p className="text-lg px-2 pt-2">{item.name}</p>
                <p className="text-sm px-2">Quantity: {item.qty}</p>
                <p className="text-sm px-2">
                  Exp. Date: {item.expiry.split("T")[0]}
                </p>
                <p className="text-sm px-2">Owner: {item.ownerName}</p>
                <p className="text-sm px-2 pb-2">Location: {item.fridgeName}</p>
              </div>
              {props.type === "normal" && (
                <div className="flex flex-row">
                  <Button
                    onClick={() => {
                      props.setEditedItem(item);
                    }}
                    disabled={
                      item.owner !== props.loggedInUser.userId &&
                      props.loggedInUser.userId !== item.fridgeAdmin
                    }
                    variant="contained"
                    className="w-[90px]"
                  >
                    Edit
                    {/* {item.owner === props.loggedInUser.userId ||
                    props.loggedInUser.userId === item.fridgeAdmin ? (
                      <EditIcon></EditIcon>
                    ) : (
                      <EditOffOutlinedIcon></EditOffOutlinedIcon>
                    )} */}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    disabled={
                      item.owner !== props.loggedInUser.userId &&
                      props.loggedInUser.userId !== item.fridgeAdmin
                    }
                    onClick={() => {
                      props.setOpenDelete(true);
                      console.log(item._id);
                      props.setDeleteItem(item._id);
                    }}
                    className="w-[90px]"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-row">
              <div className="flex flex-col justify-around">
                <div className="flex flex-row">
                  <label htmlFor="name" className="w-[200px]">
                    Item Name
                  </label>
                  <input
                    id="name"
                    ref={nameRef}
                    defaultValue={item.name}
                  ></input>
                </div>
                <div className="flex flex-row">
                  <label htmlFor="qty" className="w-[200px]">
                    Quantity
                  </label>
                  <input
                    id="qty"
                    ref={qtyRef}
                    type="number"
                    defaultValue={item.qty}
                  ></input>
                </div>
                <div className="flex flex-row">
                  <label htmlFor="expiry" className="w-[200px]">
                    Expiry Date
                  </label>
                  <input
                    id="expiry"
                    ref={expiryRef}
                    type="date"
                    defaultValue={item.expiry.split("T")[0]}
                  ></input>
                </div>
                <div className="flex flex-row">
                  <label htmlFor="item-owner" className="w-[200px]">
                    Item Owner
                  </label>
                  <select id="item-owner" ref={ownerRef}>
                    {item.fridgeMember.map((member, idx) => {
                      return (
                        <option value={member} selected={member === item.owner}>
                          {props.fridgeData.fridge.memberNames[idx]}
                        </option>
                      );
                    })}

                    <option value={item.fridgeAdmin}>
                      {props.fridgeData.fridge.adminName}
                    </option>
                  </select>
                </div>
                <p>{item.fridgeName}</p>
                <div className="flex flex-row">
                  <Button onClick={handleEditSubmit} className="mx-2">
                    Save
                  </Button>
                  <Button
                    className="mx-2"
                    onClick={() => {
                      props.setEditedItem({});
                      props.setEditItemError();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              {props.editItemError &&
                props.editItemError.message.map((err) => (
                  <p className="text-red-600">{err.msg}</p>
                ))}
            </div>
          )}
        </div>
      ))}
      {/* </div> */}
    </div>
  );
};

export default FridgeComp;
