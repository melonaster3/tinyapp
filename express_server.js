const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const functions = require("./helpers");
const { addListener } = require("nodemon");
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");// Express app use EJS as template

app.use(cookieSession({
  name: 'sdasdasdasdas',
  keys: ["hello"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ481W"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ481W"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "whateveryouwant"
  },
  "userRandomID2": {
    id: "userRandomID2",
    email: "user2@example.com",
    password: "whateveryouwant2"
  },
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`); // print out port number on console
});

app.get("/", (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");//redirected to the url page
});

app.get("/urls", (req, res) => { // Able to see the list of URLs posted
  const userId = req.session.user_id;
  const corrUrls = urlsForUser(userId);
  const templateVars = {
    urls: corrUrls,
    userId : users[userId]
  };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // When the user inputs new url

  if (req.session.user_id === undefined) {
    return res.redirect("/login"); //only logged in users can go make new
  }

  const userId = req.session.user_id;
  const templateVars = {
    userId : users[userId]
  };
  return res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let userId = req.session.user_id;
  const shortURL = req.params.id;

  if (urlDatabase[shortURL] === undefined) {
    return res.status(400).send("Unexisting URL");   // cant post on url if not logged in
  }

  if (userId === undefined) {
    userId = "NOPE";
  }

  const templateVars = {
    shortURL : req.params.id,
    longURL : urlDatabase[req.params.id]["longURL"],
    userId : users[userId],
    ownerId : urlDatabase[req.params.id]["userID"] // send both Id to see if they match
  };
  
  return res.render("urls_show", templateVars); // Able to see the shorten URLs
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    return res.status(400).send("Unexisting URL");
  }
  const longURL = urlDatabase[req.params.id]["longURL"];// get longURL from the short URL
  return res.redirect(longURL); // redirection to long URLs
});

app.post("/urls", (req, res) => { // AFter input of new URL, server sends back okay

  const userid = req.session.user_id;

  if (userid === undefined) {
    return res.status(400).send("Log in to post new URL.");   // cant post on url if not logged in
  }

  const address = functions.generateRandomString();
  urlDatabase[address] = {};
  urlDatabase[address]["longURL"] = "http://" + req.body.longURL;
  urlDatabase[address]["userID"] = req.session.user_id;
  // recieves long URL and makes it a value matching the key made by the random string generator
  return res.redirect(`/urls/${address}`); // redirects to the urls/shortURL page
  
});

app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  return res.redirect(`/urls/${shortURL}`);// When the button for edit is clicked, redirect to the url page to edit
});


app.post("/u/:id/editURL", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session.user_id;

  if (urlDatabase[shortURL] === undefined || userId !== urlDatabase[shortURL]["userID"]) {
    return res.status(400).send("You are not the owner."); // cannot delete when logged in user isnt owner
  } else {
    const shortURL = req.params.id; // get shortURL that corresponds
    urlDatabase[shortURL]["longURL"] = "http://" + req.body.longURL; //change corresponding URL with the longURL we recieved
    return res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session.user_id;
  if (userId !== urlDatabase[shortURL]["userID"]) {
    return res.status(400).send(`You are not the owner. ${userId}`); // cannot delete when logged in user isnt owner
  } else {
    delete urlDatabase[req.params.id];//deletes the url that is recieved
    return res.redirect("/urls");//redirected to the url page
  }
 
});

app.get("/login", (req, res) => { // show login page format at urls_login.ejs

  const userId = req.session.user_id;
  if (userId !== undefined) {
    return res.redirect("/urls");
  }
  const templateVars = {
    userId : users[userId]
  };
  return res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => { // When the user wants to register

  const userId = req.session.user_id;
  if (userId !== undefined) {
    return res.redirect("/urls");
  }

  const templateVars = {
    userId : users[userId]
  };
  return res.render("urls_register", templateVars);
});

app.post("/login", (req, res) => {

  if (functions.checkUserByEmail(users, req.body.email) === false) {
    return res.status(400).send("Email address does not exist.");// error if email dosent exist
  } else if (functions.checkUserByEmail(users, req.body.email) === true) {
    if (bcrypt.compareSync(req.body.password, paramTo(req.body.email, "password")) === true) {
      req.session.user_id = paramTo(req.body.email, "id"); //Sets cookie id to inputted email if it all passess
      return res.redirect("/urls");//redirected to the url page
    } else {
      return res.status(400).send("Password does not match."); // error if password dosent match
    }
  }
});

app.post("/register", (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send("Invalid Email or Password."); // error 400 if empty password or email
  }

  if (functions.checkUserByEmail(users, req.body.email) === true) {
    return res.status(400).send("Email address is already in use."); //error 400 if email already exists
  }

  const id = functions.generateRandomString(); // random Id for registeration
  users[id] = {
    "id": id,
    "email": req.body.email,
    "password": bcrypt.hashSync(req.body.password,10) // add the new id to the database
  };
  //res.cookie("user_id", id); //Sets cookie user to inputted value
  req.session.user_id = id;
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {

  req.session = null; //Clears user cookie to be logged out
  return res.redirect("/urls");//redirected to the url page
});


app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase); // Convert the URL data base into JSON
});

const urlsForUser = (id) => { // will return an object, key being the short ID and the value being the corresponding longURL
  let urls = {};
  let keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if (urlDatabase[key]["userID"] === id) {
      urls[key] = urlDatabase[key]["longURL"];
    }
  }
  return urls;
};

const paramTo = (emailInput, string) => { // takes in the email and finds the parameter corresponding to the string input. If the string was a password or id, it would check the users object, find the same email and return the password or id
  let keys = Object.keys(users);
  for (let key of keys) {
    if (users[key]["email"] === emailInput) {
      const variable = users[key][string];
      return variable;
    }
  }
  return undefined;
};

module.exports = {
  urlDatabase,
  users
};

