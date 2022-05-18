const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");// Express app use EJS as template
app.use(cookieParser());

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
}

app.post("/register", (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send("Invalid Email or Password."); // error 400 if empty password or email
  };

  if (emailChecker(users, req.body.email) === true) {
    res.status(400).send("Email address is already in use."); //error 400 if email already exists
  }

  const id = generateRandomString (); // random Id for registeration
  users[id] = {
    "id": id, 
    "email": req.body.email,
    "password": req.body.password // add the new id to the database
  };
  res.cookie("user_id", id); //Sets cookie user to inputted value
  res.redirect("/urls");
})


app.get("/urls/new", (req, res) => { // When the user inputs new url

  if(req.cookies["user_id"] === undefined) {
    res.redirect("/urls"); //only logged in users can go make new
  }

  const userId = req.cookies["user_id"];
  const templateVars = {
    userId : users[userId]
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => { // When the user wants to register

  const userId = req.cookies["user_id"];
  const templateVars = {
    userId : users[userId]
  };
  res.render("urls_register", templateVars);
});


app.post("/urls", (req, res) => { // AFter input of new URL, server sends back okay

  if(req.cookies["user_id"] === undefined) {
    res.status(400).send("Log in to post new URL.");   // cant post on url if not logged in
  }
  const address = generateRandomString();
  urlDatabase[address] = {};
  urlDatabase[address]["longURL"] = "http://" + req.body.longURL; 
  urlDatabase[address]["userID"] = req.cookies["user_id"];
  // recieves long URL and makes it a value matching the key made by the random string generator
  res.redirect(`/urls/${address}`); // redirects to the urls/shortURL page
});

app.get("/urls", (req, res) => { // Able to see the list of URLs posted
  const userId = req.cookies["user_id"];
  const corrUrls = urlsForUser(userId);
  const templateVars = {
    urls: corrUrls,
    userId : users[userId]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    shortURL : req.params.shortURL,
    longURL : urlDatabase[req.params.shortURL]["longURL"],
    userId : users[userId]["id"],
    ownerId : urlDatabase[req.params.shortURL]["userID"] // send both Id to see if they match
  };
  res.render("urls_show", templateVars); // Able to see the shorten URLs
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];// get longURL from the short URL
  res.redirect(longURL); // redirection to long URLs
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);// When the button for edit is clicked, redirect to the url page to edit 
});

app.post("/u/:shortURL/editURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined ||req.body.userId !== urlDatabase[shortURL]["userID"]) {
    res.status(400).send("You are not the owner."); // cannot delete when logged in user isnt owner
  } else {
    const shortURL = req.params.shortURL; // get shortURL that corresponds
    urlDatabase[shortURL]["longURL"] = "http://" + req.body.longURL; //change corresponding URL with the longURL we recieved
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL] === undefined ||req.body.userId !== urlDatabase[shortURL]["userID"]) {
    res.status(400).send("You are not the owner."); // cannot delete when logged in user isnt owner
  } else {
    delete urlDatabase[req.params.shortURL];//deletes the url that is recieved
    res.redirect("/urls");//redirected to the url page
  }
 
});

app.post("/login", (req, res) => {

  if (emailChecker(users, req.body.email) === false) {
    res.status(400).send("Email address does not exist.");; // error if email dosent exist
  } else if(emailChecker(users, req.body.email) === true) {
      if (req.body.password === paramTo(req.body.email, "password")) {
        res.cookie("user_id", paramTo(req.body.email, "id"));  //Sets cookie id to inputted email if it all passess
        res.redirect("/urls");//redirected to the url page
      } else {
        res.status(400).send("Password does not match."); // error if password dosent match
      }
    }
});

app.get("/login", (req, res) => { // show login page format at urls_login.ejs
  const userId = req.cookies["user_id"];
  const templateVars = {
    userId : users[userId]
  };
  res.render("urls_login", templateVars);
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); //Clears user cookie to be logged out
  res.redirect("/urls");//redirected to the url page
});

app.get("/", (req, res) => {
  res.redirect("/urls");//redirected to the url page
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`); // print out port number on console
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // Convert the URL data base into JSON
});


const generateRandomString = () => { // generate random 6 number character string
  let string = '';
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return string;
};

const emailChecker = (obj, email) => { //function to check if email and any id are same
  let keys = Object.keys(obj);
  for (let key of keys) {
    if (obj[key].email === email) {
      return true; 
    }
  }
  return false;
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

const urlsForUser = (id) => { // will return an object, key being the short ID and the value being the corresponding longURL
  let urls = {};
  let keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if (urlDatabase[key]["userID"] === id) {
      urls[key] = urlDatabase[key]["longURL"];
    }
  }
  return urls;
}