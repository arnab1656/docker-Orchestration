import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
});

const Item = mongoose.model("Item", itemSchema);

export default Item;
