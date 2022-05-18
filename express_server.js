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

app.get("/urls/new", (req, res) => { // When the user inputs new url
  
  res.render("urls_new");
});

app.post("/urls", (req, res) => { // AFter input of new URL, server sends back okay
  let address = generateRandomString();
  urlDatabase[address] = "http://" + req.body["longURL"]; // recieves long URL and makes it a value matching the key made by the random string generator
  res.redirect(`/urls/${address}`); // redirects to the urls/shortURL page
});

app.get("/urls", (req, res) => { // Able to see the list of URLs posted
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL : req.params.shortURL,
    longURL : req.params.longURL,
    username: req.cookies["username"],
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
  res.cookie("username", req.body.username); //Sets cookie username to inputted value
  res.redirect("/urls");//redirected to the url page
});

app.post("/logout", (req, res) => {
  res.clearCookie("username"); //Clears user cookie to be logged out
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

let generateRandomString = () => { // generate random 6 number character string
  let string = '';
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return string;
};