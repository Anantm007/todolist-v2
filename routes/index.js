const express = require("express");
const router = express.Router();

// Utility
const _ = require("lodash");

// Mongoose Schema
const Item = require("../models/Item");
const List = require("../models/List");

// Default items for a new list
const defaultItems = require("./utility");

// Show the main list
router.get("/", async (req, res) => {
  try {
    const listTitle = "Matato";
    const list = await List.findOne({ name: listTitle }).populate("items");

    if (list.items.length === 0) {
      await Item.insertMany(defaultItems, async (err) => {
        if (err) {
          console.log(err);
        } else {
          list.items.push(defaultItems[0]);
          await list.save();
        }
      });
      return res.redirect("/");
    } else {
      return res.render("list", {
        listTitle,
        newListItems: list.items,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// Create a new list
router.get("/:customListName", async (req, res) => {
  try {
    const customListName = _.capitalize(req.params.customListName);

    const foundList = await List.findOne({ name: customListName }).populate(
      "items"
    );

    // Create a new list
    if (!foundList) {
      defaultItems.map(async (itemCheck) => {
        const x = new Item(itemCheck);
        await x.save();
      });

      const list = new List({
        name: customListName,
        items: defaultItems,
      });

      await list.save();

      return res.redirect("/" + customListName);
    } else {
      // Show an existing list
      return res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// Add a new item
router.post("/", async (req, res) => {
  try {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName,
      completed: false,
    });

    await List.findOne({ name: listName }, async (err, foundList) => {
      if (!err) {
        foundList.items.push(item);
        await foundList.save();
        await item.save();
      }
    });

    if (listName === "Matato") {
      return res.redirect("/");
    } else {
      res.redirect("/" + listName);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// Delete an item
router.get("/api/delete/:id/:listName", async (req, res) => {
  try {
    const id = req.params.id;
    const listName = req.params.listName;

    const itemCheck = await Item.findById(id).select("_id");

    if (!itemCheck) {
      return res
        .status(404)
        .json({ success: false, message: "Item not Found" });
    }

    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: id } },
      { new: true }
    );

    await Item.findByIdAndRemove(id);

    if (listName === "Matato") {
      return res.redirect("/");
    } else {
      res.redirect("/" + listName);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// Mark a task as pending/finished
router.post("/mark", async (req, res) => {
  try {
    const checkedItemId = req.body.itemId;
    const listName = req.body.listName;
    const item = await Item.findById(checkedItemId).select("name completed");

    await Item.findByIdAndUpdate(
      checkedItemId,
      {
        completed: !item.completed,
      },
      { new: true }
    );

    if (listName === "Matato") {
      return res.redirect("/");
    } else {
      res.redirect("/" + listName);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

module.exports = router;
