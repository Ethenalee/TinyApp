let express = require('express');
let app = express();
let PORT = 8080; // default port 8080

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {};

function generateRandomString(length) {
  let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});



app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase,
  users, user_id: req.cookies['user_id']}
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { users, user_id: req.cookies['user_id']};
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let shorK = generateRandomString(6);
  urlDatabase[shorK] = req.body.longURL;
  res.redirect('/urls/'+ shorK);
});

app.get('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  let user_id = req.cookies['user_id'];
  let templateVars = { shortURL, longURL, user, user_id};
  res.render('urls_show', templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  let shorK = req.params.id;
  delete urlDatabase[shorK];
  res.redirect('/urls/');
});

app.post('/urls/:id', (req, res) => {
  let shorK = req.params.id;
  urlDatabase[shorK] = req.body.longurl;
  res.redirect('/urls/');
});


app.post('/login', (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls/');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});

app.get('/register', (req, res) => {
  let templateVars = { users, user_id: req.cookies['user_id']};
  res.render('urls_email', templateVars);
});

app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = generateRandomString(10);


  if(email === '' || password === '') {
    res.send('Error: 400');
    }
  else if (Object.values(users).some( x => email === email)) {
    res.send('Error: 400');
    }
  else {
    users[id] = {id: id,
    email: email,
    password: password};
    res.cookie('user_id', id);
    res.redirect('/urls/');
  }
console.log(users);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL)
});