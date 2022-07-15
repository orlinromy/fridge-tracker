import React, { useEffect, useState } from "react";
import fridgeData from "../tempData/fridgeData";
import { Button } from "@mui/material";

const Home = () => {
  const loggedInUser = "abspr28304hajbdf";
  const [itemList, setItemList] = useState([]);
  const [warnItems, setWarnItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  function getItem(loggedInUser) {
    setIsLoading(true);

    for (const fridge of fridgeData) {
      if (
        loggedInUser === fridge.admin ||
        fridge.members.includes(loggedInUser)
      ) {
        fridge.items.forEach((item) => {
          item.fridgeName = fridge.name;
        });
        setItemList((prevState) => [...prevState, ...fridge.items]);
        for (const item of fridge.items) {
          console.log(new Date(Date.now()));
          if (
            // https://stackoverflow.com/questions/7751936/javascript-date-plus-2-weeks-14-days#:~:text=12096e5%20is%20a%20magic%20number,now()%20%2B%2012096e5)%3B
            new Date([...item.expiryDate.split("-")]) <=
            new Date(Date.now() + 12096e5)
          ) {
            setWarnItems((prevState) => [...prevState, item]);
          }
        }
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    getItem(loggedInUser);
  }, []);

  return (
    !isLoading && (
      <>
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
          <p>Button 1</p>
          <p>Button 2</p>
        </div>
        {warnItems.map((item) => (
          <div key={Math.random()} className="flex flex-column justify-around">
            <p>{item.name}</p>
            <p>{item.qty}</p>
            <p>{item.expiryDate}</p>
            <p>{item.owner}</p>
            <p>{item.fridgeName}</p>
            <Button>Edit</Button>
            <Button variant="outlined" color="error">
              Delete
            </Button>
          </div>
        ))}
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
          <p>Button 1</p>
          <p>Button 2</p>
        </div>
        {itemList.map((item) => (
          <div key={Math.random()} className="flex flex-column justify-around">
            <p>{item.name}</p>
            <p>{item.qty}</p>
            <p>{item.expiryDate}</p>
            <p>{item.owner}</p>
            <p>{item.fridgeName}</p>
            <Button>Edit</Button>
            <Button variant="outlined" color="error">
              Delete
            </Button>
          </div>
        ))}
      </>
    )
  );
};

export default Home;
