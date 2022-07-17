import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateItem = () => {
  const navigate = useNavigate();
  const nameRef = useRef();
  const quantityRef = useRef();
  const expiryRef = useRef();
  const ownerRef = useRef();
  const tagRef = useRef([]);
  const buyDateRef = useRef();
  const [error, setError] = useState();
  //   const createDateRef = useRef();

  const createItem = async (userInput) => {
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInput),
    };
    try {
      const res = await fetch(
        "http://localhost:5001/api/fridge/items",
        options
      );
      const data = await res.json();
      console.log(data);
    } catch {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = nameRef.current.value;
    const qty = quantityRef.current.value;
    const expiry = expiryRef.current.value;
    const owner = ownerRef.current.value;
    const tags = tagRef.current.value;
    const tag = tags
      .split(/,(\s)?/)
      .filter((data) => data !== " " && data != undefined);
    const buyDate = buyDateRef.current.value;

    const userInput = { name, qty, expiry, owner, tag, buyDate };
    console.log(userInput);
    // createItem(userInput);
  };

  return (
    <div>
      <h1>Create Item</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Item Name:</label>
        <input id="name" ref={nameRef}></input>
        <br />
        <label htmlFor="quantity">Quantity:</label>
        <input id="quantity" type="number" ref={quantityRef}></input>
        <br />
        <label htmlFor="expirydate">Expiry Date:</label>
        <input id="expirydate" type="date" ref={expiryRef}></input>
        <br />
        <label htmlFor="buydate">Buy Date:</label>
        <input id="buydate" type="date" ref={buyDateRef}></input>
        <br />
        <label htmlFor="owner">Owner:</label>
        <input id="owner" ref={ownerRef}></input>
        <br />
        <label htmlFor="tag">Tag:</label>
        <input id="tag" ref={tagRef}></input>
        <br />
        <button>Submit</button>
      </form>
    </div>
  );
};

export default CreateItem;
