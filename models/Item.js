const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    completed: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = Item = mongoose.model("Item", ItemSchema);
