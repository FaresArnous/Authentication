const express = require("express");

const bcrypt = require("bcryptjs");

const db = require("../data/database");

const router = express.Router();

router.get("/", function (req, res) {
  res.render("welcome");
});

router.get("/signup", function (req, res) {
  res.render("signup");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/signup", async function (req, res) {
  const userData = req.body;
  const enteredemail = userData.email;
  const enterdConfEmail = userData["confirm-email"];
  const enterdpassword = userData.password;

  if (
    !enteredemail ||
    !enterdConfEmail ||
    !enterdpassword ||
    enterdpassword.trim() < 6 ||
    enteredemail !== enterdConfEmail ||
    !enteredemail.includes("@")
  ) {
    console.log("invalid data");
    return res.redirect("/signup");
  }

  const existingUser = await db.getDb().collection("users").findOne({
    email: enteredemail,
  });

  if (existingUser) {
    console.log("user already exists");
    return res.redirect("/signup");
  }

  const hashedPassword = await bcrypt.hash(enterdpassword, 12);

  const user = {
    email: enteredemail,
    password: hashedPassword,
  };

  await db.getDb().collection("users").insertOne(user);

  res.redirect("/login");
});

router.post("/login", async function (req, res) {
  const userData = req.body;
  const enteredemail = userData.email;
  const enterdpassword = userData.password;

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredemail }); //checking if e have a user in this email or not

  if (!existingUser) {
    console.log("there is a problem");
    return res.redirect("/login");
  }

  const passwordsAreEqual = await bcrypt.compare(
    enterdpassword,
    existingUser.password
  ); //here we are checking if the user enterd the correct password.

  if (!passwordsAreEqual) {
    console.log("incorrect password");
    return res.redirect("/login");
  }

  req.session.user = {
    id: existingUser._id.toString(),
    email: existingUser.email,
  };

  req.session.save(function () {
    console.log("user is authenticated!");
    res.redirect("/admin");
  });
});

router.get("/admin", function (req, res) {
  res.render("admin");
});

router.post("/logout", function (req, res) {});

module.exports = router;
