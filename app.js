const path = require("path");

const express = require("express");
const session = require("express-session");
const mongodbStore = reqiure("connect-mongodb-session");

const db = require("./data/database");
const demoRoutes = require("./routes/demo");
const { url } = require("inspector");
const database = require("./data/database");
const { Collection } = require("mongodb");

const MongoDBStore = mongodbStore(session);

const app = express();

const sessionStore = new MongoDBStore({
  url: "localhost:27017",
  databaseName: "auth",
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "super-secret", //we choose this name for testing only, in real life project we shloud use something more secure
    resave: false, //if this was true it will create new session each time the user send a request.
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use(demoRoutes);

app.use(function (error, req, res, next) {
  res.render("500");
});

db.connectToDatabase().then(function () {
  app.listen(3000);
});
