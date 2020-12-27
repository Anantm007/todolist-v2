//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

// Config variables
require("dotenv").config();

//Connecting to the database
mongoose.promise = global.Promise;
mongoose.connect(
  process.env.MongoURI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  (err, db) => {
    if (err) console.log(err);
    else console.log("Database Connected...");
  }
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Mounting the routes
app.use("/", require("./routes/index"));

const PORT = process.env.PORT || 3008;
app.listen(PORT, function () {
  console.log(`Server started on ${PORT}`);
});
