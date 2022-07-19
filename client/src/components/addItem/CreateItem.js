import React, { useState } from "react";

// source: https://codesandbox.io/s/q555kp8jj?fontsize=14&file=/src/index.js
const CreateItem = () => {
  const inputFormat = {
    name: null,
    quantity: null,
    expiry: new Date(Date.now()).toISOString().split("T")[0],
    ownerEmail: null,
    tag: null,
    buyDate: new Date(Date.now()).toISOString().split("T")[0],
  };
  const [fields, setFields] = useState([{ ...inputFormat }]);

  function handleAddField() {
    const values = [...fields];
    values.push(inputFormat);
    setFields(values);
  }
  function handleChange(idx, e) {
    setFields((prevState) => {
      if (e.target.id === "expiry" || e.target.id === "buyDate") {
        prevState[idx][e.target.id] = new Date(e.target.value);
      }
      prevState[idx][e.target.id] = e.target.value;
      return prevState;
    });
  }

  return (
    <>
      <button className="border border-solid" onClick={handleAddField}>
        Add field
      </button>
      {fields.map((field, idx) => {
        return (
          <div key={Math.random()}>
            <input
              key={"name" + idx}
              id="name"
              type="text"
              placeholder="Enter Item Name"
              value={field.name}
              onChange={(e) => {
                handleChange(idx, e);
              }}
            ></input>
            <input
              key={"quantity" + idx}
              id="quantity"
              type="number"
              placeholder="Enter Item Quantity"
              value={field.quantity}
              onChange={(e) => {
                handleChange(idx, e);
              }}
            ></input>
            <input
              key={"expiry" + idx}
              id="expiry"
              type="date"
              value={field.expiry}
              onChange={(e) => {
                handleChange(idx, e);
              }}
            ></input>
            <input
              key={"ownerEmail" + idx}
              id="ownerEmail"
              type="email"
              placeholder="Enter owner's email"
              value={field.ownerEmail}
              onChange={(e) => {
                handleChange(idx, e);
              }}
            ></input>
            <input
              key={"tag" + idx}
              id="tag"
              type="tag"
              placeholder="Tags (separated by comma)"
              value={field.tag}
              onChange={(e) => {
                handleChange(idx, e);
              }}
            ></input>
            <input
              key={"buyDate" + idx}
              id="buyDate"
              type="date"
              value={field.buyDate}
              onChange={(e) => {
                handleChange(idx, e);
              }}
            ></input>
            <button type="button"></button>
          </div>
        );
      })}
    </>
  );
};

export default CreateItem;
