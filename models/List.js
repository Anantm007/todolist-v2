const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  { timestamps: true }
);

module.exports = List = mongoose.model("List", ListSchema);
