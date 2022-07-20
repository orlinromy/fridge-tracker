import React from "react";
import { TextField, Button } from "@mui/material";
// source: https://codesandbox.io/s/q555kp8jj?fontsize=14&file=/src/index.js
const CreateItem = (props) => {
  // console.log(props.data);
  // const inputFormat = {
  //   name: null,
  //   qty: null,
  //   expiry: null,
  //   ownerEmail: null,
  //   tag: null,
  //   buyDate: null,
  // };

  // const [fields, setFields] = useState([{ ...inputFormat }]);
  // console.log(props.fields);
  console.log(props);

  function handleAddField() {
    const values = [...props.fields];
    values.push({ ...props.inputFormat });
    props.setFields(values);
  }
  function handleChange(idx, e) {
    props.setFields((prevState) => {
      if (e.target.id === "expiry" || e.target.id === "buyDate") {
        prevState[idx][e.target.id] = new Date(e.target.value)
          .toISOString()
          .split("T")[0];
      } else {
        prevState[idx][e.target.id] = e.target.value;
      }
      return prevState;
    });
  }
  function handleRemove(idx, e) {
    const values = [...props.fields];
    values.splice(idx, 1);
    props.setFields(values);
  }

  return (
    <>
      <Button
        variant="outlined"
        className="border border-solid"
        onClick={handleAddField}
      >
        Add new item
      </Button>
      {props.fields.map((field, idx) => {
        return (
          <div key={Math.random()} className="mt-4 mb-4">
            {props.isAdmin && props.mode !== "create" && (
              <div className="float-left">
                <label className="text-xs block" htmlFor="ownerEmail">
                  Owner's Email
                </label>
                <select
                  className="block"
                  id="ownerEmail"
                  label="Owner's email"
                  onChange={(e) => {
                    handleChange(idx, e);
                  }}
                  value={field.ownerEmail}
                >
                  <option value={props.data.adminEmail}>
                    {props.data.adminName + " (" + props.data.adminEmail + ")"}
                  </option>
                  {props.data.memberEmails.length !== 0 &&
                    props.data.memberEmails.map((memberEmail, idx) => {
                      return (
                        <option value={memberEmail}>
                          {props.data.memberNames[idx] +
                            " (" +
                            memberEmail +
                            ")"}
                        </option>
                      );
                    })}
                </select>
              </div>
            )}
            {props.mode === "create" && (
              <TextField
                id="ownerEmail"
                type="text"
                label="Owner's Email"
                InputLabelProps={{
                  shrink: true,
                }}
                placeholder="Enter owner's email"
                value={field.ownerEmail}
                onChange={(e) => {
                  handleChange(idx, e);
                }}
                className="mx-4"
                size="small"
              ></TextField>
            )}
            <TextField
              id="name"
              type="text"
              label="Item Name"
              placeholder="Enter Item Name"
              value={field.name}
              onChange={(e) => {
                handleChange(idx, e);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
              className="ml-4 mr-4"
            ></TextField>
            <TextField
              id="qty"
              type="number"
              label="Quantity"
              placeholder="Enter Item Quantity"
              value={field.qty}
              onChange={(e) => {
                handleChange(idx, e);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
              className="mr-4"
            ></TextField>

            <TextField
              id="tag"
              type="tag"
              label="Tags (separated by comma)"
              placeholder="Tags (separated by comma)"
              value={field.tag}
              onChange={(e) => {
                handleChange(idx, e);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
              className="mr-4"
            ></TextField>
            <TextField
              id="expiry"
              type="date"
              label="Expiry Date"
              value={field.expiry}
              onChange={(e) => {
                handleChange(idx, e);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
              className="mr-4"
            ></TextField>
            <TextField
              id="buyDate"
              type="date"
              label="Buy Date"
              value={field.buyDate}
              onChange={(e) => {
                handleChange(idx, e);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
              className="mr-4"
            ></TextField>
            <button
              type="button"
              onClick={(e) => {
                handleRemove(idx, e);
              }}
              className="ml-4"
            >
              ❌
            </button>
          </div>
        );
      })}
    </>
  );
};

export default CreateItem;
