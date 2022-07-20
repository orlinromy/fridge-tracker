import React, { useRef } from "react";
import { Button } from "@mui/material";
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
    <div>
      <p className="text-2xl">
        {props.type === "warn"
          ? "Expiring and Expired Items"
          : `Items in ${props.fridgeData.fridge.fridgeName}`}
      </p>
      <div
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
            <p className="text-slate-200">Button 1</p>
            <p className="text-slate-200">Button 2</p>
          </>
        )}
      </div>
      {props.itemList.map((item) => (
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
          {!props.editedItem || props.editedItem._id !== item._id ? (
            <>
              <p>{item.name}</p>
              <p>{item.qty}</p>
              <p>{item.expiry.split("T")[0]}</p>
              <p>{item.ownerName}</p>
              <p>{item.fridgeName}</p>
              {props.type === "normal" && (
                <>
                  <button
                    onClick={() => {
                      props.setEditedItem(item);
                    }}
                    disabled={
                      item.owner !== props.loggedInUser.userId &&
                      props.loggedInUser.userId !== item.fridgeAdmin
                    }
                  >
                    {item.owner === props.loggedInUser.userId ||
                    props.loggedInUser.userId === item.fridgeAdmin ? (
                      <EditIcon></EditIcon>
                    ) : (
                      <EditOffOutlinedIcon></EditOffOutlinedIcon>
                    )}
                  </button>
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
                  >
                    Delete
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <input ref={nameRef} defaultValue={item.name}></input>
              <input ref={qtyRef} type="number" defaultValue={item.qty}></input>
              <input
                ref={expiryRef}
                type="date"
                defaultValue={item.expiry.split("T")[0]}
              ></input>
              <select id="item-owner" ref={ownerRef}>
                {item.fridgeMember.map((member, idx) => {
                  return (
                    <option value={member}>
                      {props.fridgeData.fridge.memberNames[idx]}
                    </option>
                  );
                })}
                <option value={item.fridgeAdmin}>
                  {props.fridgeData.fridge.adminName}
                </option>
              </select>
              <p>{item.fridgeName}</p>
              <button onClick={handleEditSubmit}>✅</button>
              <button
                onClick={() => {
                  props.setEditedItem({});
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default FridgeComp;
