var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
  username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  var shorK = generateRandomString(6);
  urlDatabase[shorK] = req.body.longURL;
  res.redirect('/urls/'+ shorK);
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  let username = req.cookies["username"];
  let templateVars = { shortURL, longURL, username};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  var shorK = req.params.id;
  delete urlDatabase[shorK];
  res.redirect('/urls/');
});

app.post("/urls/:id/", (req, res) => {
  var shorK = req.params.id;
  urlDatabase[shorK] = req.body.longurl;
  res.redirect('/urls/');
});


app.post("/login", (req, res) => {
  var username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls/');
});

app.post("/logout", (req, res) => {
  let username = req.cookies["username"];
  res.clearCookie('username');
  res.redirect('/urls/');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(length) {
  var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
});