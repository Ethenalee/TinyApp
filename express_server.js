let express = require('express');
let app = express();
let PORT = 8080; // default port 8080

// require list
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');


// using require
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: 'session',
    keys: ['okdoky'],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);


// main database
var urlDatabase = {
  'b2xVn2': {longURL: 'http://www.lighthouselabs.ca', user:'asdfsdf'},
  '9sm5xK': {longURL: 'http://www.google.com', user:'asdfsdf'}
};

// user database
const users = {
  asdfsdf: {
      id: 'asdfsdf',
      email: 'test@gmail.com',
      password: bcrypt.hashSync('1234', 10)
    }

};

// random ID generate for server purpose
function generateRandomString(length) {
  let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// bring ID matching with email
function bringID(email) {
  let [userId] = Object.keys(users).filter(
    userid =>
    users[userid].email === email
  );
  return userId;
}

// matching existing ID
function userthere(email) {
  for (let userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
}

// generate object for each users urls
function urlsForUser(id) {
  let urlslist = {}
  for (let shork in urlDatabase) {
    if(urlDatabase[shork].user === id) {
      urlslist[shork] = urlDatabase[shork];
    }
  }

  return urlslist;

}

// main page
app.get('/', (req, res) => {
  let userid = req.session.userid;

  if(userid) {
    res.redirect('/urls')
  }
  else {
    res.redirect('/login');
  }

});

// hello page
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// shorturl page can redirect to long url website when they are logged in
app.get('/u/:shortURL', (req, res) => {
  let userid = req.session.userid;
  let longURL = urlDatabase[req.params.shortURL].longURL;

  if(userid) {
  res.redirect(longURL)
  }
  else {
    res.render('permission');
  }

});

// can check the main database;
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// page that can show all the urls you created
app.get('/urls', (req, res) => {
  let userid = req.session.userid;
  let templateVars = {
    urls: urlsForUser(userid),
    users,
    userid
  }

  if(userid) {
    res.render('urls_index', templateVars);
  }
  else {
    res.render('permission', templateVars);
  }
});

// page that you can create new url list
app.get('/urls/new', (req, res) => {
  let userid = req.session.userid;
  let templateVars = {
    users,
    userid
  };

  if(userid) {
  res.render('urls_new', templateVars);
  }
  else {
  res.redirect('/login');
  }
});

// generates a short URL, saves it, and associates it with the user
app.post('/urls', (req, res) => {
  let shorK = generateRandomString(6);

  urlDatabase[shorK] = {
    longURL: req.body.longURL,
    user: req.session.userid
  };

  res.redirect('/urls/'+ shorK);

});

//see owns the URL for the given ID

app.get('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  let userid = req.session.userid;
  let templateVars = { shortURL, longURL, users, userid};

  if (!(Object.keys(urlDatabase)).includes(shortURL)) {
    res.status(404).send('Page is not exist');
  }

  if(!userid) {
    res.send('You do not have a permission to access, please login');
  }

  else if(urlDatabase[shortURL].user === userid) {
    res.render('urls_show', templateVars);
  }
  else {
    res.send('You do not have a permission to edit');
  }
});

// updates the URL
app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  let userid = req.session.userid;



  res.redirect('/urls/');
});

// delete url process
app.post('/urls/:id/delete', (req, res) => {
  let shorK = req.params.id;
  let userid = req.session.userid;

  if(userid) {
      if (urlDatabase[shorK].user === userid) {
          delete urlDatabase[shorK];
          res.redirect('/urls/');
        }
      else {
        res.send('You do not have a permission to delete');
      }
  }
  else {
    res.send('You do not have a permission to delete')
  }

});



// login page
app.get('/login', (req, res) => {
  let templateVars = {
    users,
    userid: req.session.userid
  };

  res.render('login', templateVars);
});

// sets a cookie
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = bringID(email);

  if (!id) {
    res.status(403).send('Error 403: Email is not valid');
  }
  else if (!bcrypt.compareSync(password, users[id].password)) {
    res.status(403).send('Error 403: password is not valid');
  }
  else {
    req.session.userid = id;
    res.redirect('/urls');
  }

});

// delete cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//register page
app.get('/register', (req, res) => {
  let templateVars = { users, userid: req.session.userid};
  res.render('urls_email', templateVars);
});

//create new user
app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  let id = generateRandomString(10);
  const userfind = userthere(email);

  if(email === '' || password === '') {
    res.status(400).send('Error: 400');
    }
  else if (userfind) {
    res.status(400).send('Error: 400 Email already exist');
    }

  else {
    users[id] = {
      id: id,
      email: email,
      password: hashedPassword
    };
    req.session.userid = id;
    res.redirect('/urls/');
  }

});

//show which port running now
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





