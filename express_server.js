const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");// Express app use EJS as template
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    res.status(400).end(); // error 400 if empty password or email
  };

  if (emailChecker(users, req.body.email) === true) {
    res.status(400).end(); //error 400 if email already exists
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
  let address = generateRandomString();
  urlDatabase[address] = "http://" + req.body["longURL"]; // recieves long URL and makes it a value matching the key made by the random string generator
  res.redirect(`/urls/${address}`); // redirects to the urls/shortURL page
});

app.get("/urls", (req, res) => { // Able to see the list of URLs posted
  const userId = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    userId : users[userId]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {
    shortURL : req.params.shortURL,
    longURL : req.params.longURL,
    userId : users[userId]
  };
  res.render("urls_show", templateVars); // Able to see the shorten URLs
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];// get longURL from the short URL
  res.redirect(longURL); // redirection to long URLs
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);// When the button for edit is clicked, redirect to the url page to edit 
});

app.post("/u/:shortURL/editURL", (req, res) => {
  const shortURL = req.params.shortURL; // get shortURL that corresponds
  urlDatabase[shortURL] = "http://" + req.body.longURL; //change corresponding URL with the longURL we recieved
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];//deletes the url that is recieved
  res.redirect("/urls");//redirected to the url page
});

app.post("/login", (req, res) => {

  if (emailChecker(users, req.body.email) === false) {
    res.status(403).end(); // error if email dosent exist
  } else if(emailChecker(users, req.body.email) === true) {
      if (req.body.password === paramTo(req.body.email, "password")) {
        res.cookie("user_id", paramTo(req.body.email, "id"));  //Sets cookie id to inputted email if it all passess
        res.redirect("/urls");//redirected to the url page
      } else {
        res.status(403).end(); // error if password dosent match
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
  res.send("Hello");// Will show Hello for root path
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`); // print out port number on console
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // Convert the URL data base into JSON
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); //Example of Express format
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
