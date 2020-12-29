const Item = require("../models/Item");

// Default items
const item1 = new Item({
  name: "Welcome to your todolist!",
  completed: false,
});

const defaultItems = [item1];

module.exports = defaultItems;
