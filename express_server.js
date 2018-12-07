let express = require('express');
let app = express();
let PORT = 8080; // default port 8080

const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');



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



var urlDatabase = {
  'b2xVn2': {longURL: 'http://www.lighthouselabs.ca', user:'asdfsdf'},
  '9sm5xK': {longURL: 'http://www.google.com', user:'asdfsdf'}
};

const users = {
  asdfsdf: {
      id: 'asdfsdf',
      email: 'test@gmail.com',
      password: bcrypt.hashSync('1234', 10)
    }

};

function generateRandomString(length) {
  let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function bringID(email) {
  let [userId] = Object.keys(users).filter(
    userid =>
    users[userid].email === email
  );
  return userId;
}


function userthere(email) {
  for (let userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
}

function urlsForUser(id) {
  let urlslist = {}
  for (let shork in urlDatabase) {
    if(urlDatabase[shork].user === id) {
      urlslist[shork] = urlDatabase[shork];
    }
  }

  return urlslist;

}


app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL)
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let user_id = req.session.user_id;
  let templateVars = {
    urls: urlsForUser(user_id),
    users,
    user_id
  }

  if(user_id) {
    res.render('urls_index', templateVars);
  }
  else {
    res.render('permission', templateVars);
  }
});

app.get('/urls/new', (req, res) => {
  let user_id = req.session.user_id;
  let templateVars = {
    users,
    user_id: req.session.user_id
  };

  if(user_id) {
  res.render('urls_new', templateVars);
  }
  else {
  res.redirect('/login');
  }
});

app.post('/urls', (req, res) => {
  let shorK = generateRandomString(6);

  urlDatabase[shorK] = {
    longURL: req.body.longURL,
    user: req.session.user_id
  };

  res.redirect('/urls/'+ shorK);

});

app.get('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  let user_id = req.session.user_id;
  let templateVars = { shortURL, longURL, users, user_id};
  if(urlDatabase[shortURL].user === user_id){
    res.render('urls_show', templateVars);
  }
  else {
    res.send('You do not have a permission to edit');
  }
});

app.post('/urls/:id/delete', (req, res) => {
  let shorK = req.params.id;
  let user_id = req.session.user_id;
  if(urlDatabase[shorK].user === user_id) {
    delete urlDatabase[shorK];
    res.redirect('/urls/');
  }
  else {
    res.send('You do not have a permission to delete');
  }
});

app.post('/urls/:id', (req, res) => {
  let shorK = req.params.id;

  res.redirect('/urls/');
});

app.get('/login', (req, res) => {
  let templateVars = {
    users,
    user_id: req.session.user_id
  };

  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = bringID(email);
  ;


  if (!id) {
    res.status(403).send('Error 403: Email is not valid');
  }

  else if (!bcrypt.compareSync(password, users[id].password)) {
    res.status(403).send('Error 403: password is not valid');
  }
  else {
    req.session.user_id = id;
    res.redirect('/');
  }

});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls/');
});

app.get('/register', (req, res) => {
  let templateVars = { users, user_id: req.session.user_id};
  res.render('urls_email', templateVars);
});

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

    req.session.user_id = id;
    res.redirect('/urls/');
  }

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





