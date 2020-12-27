const express = require("express");
const router = express.Router();

// Utility
const mongoose = require("mongoose");
const _ = require("lodash");

const itemsSchema = {
  name: String,
  completed: Boolean,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
  completed: false,
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
  completed: false,
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
  completed: false,
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

router.get("/", function (req, res) {
  try {
    Item.find({}, function (err, foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully savevd default items to DB.");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Matato", newListItems: foundItems });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.get("/:customListName", function (req, res) {
  try {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
      if (!err) {
        if (!foundList) {
          //Create a new list
          const list = new List({
            name: customListName,
            items: defaultItems,
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          //Show an existing list
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items,
          });
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.post("/", function (req, res) {
  try {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName,
      completed: false,
    });

    if (listName === "Matato") {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({ name: listName }, function (err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.get("/api/delete/:id", async (req, res) => {
  try {
    await Item.findByIdAndRemove(req.params.id);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

router.post("/mark", async (req, res) => {
  try {
    const checkedItemId = req.body.itemId;
    const listName = req.body.listName;

    if (listName === "Matato") {
      const item = await Item.findById(checkedItemId).select("completed");

      Item.findByIdAndUpdate(
        checkedItemId,
        { completed: !item.completed },
        function (err) {
          if (!err) {
            res.redirect("/");
          }
        }
      );
    } else {
      List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } },
        function (err, foundList) {
          if (!err) {
            res.redirect("/" + listName);
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

module.exports = router;
