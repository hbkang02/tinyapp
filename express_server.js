const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
const { urlDatabase, users } = require('./data');

const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');


app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey1', 'secretkey2']
}));
app.use(express.urlencoded({ extended: true }));


//////////////////////////////////////////////////////////////////////////

// GET /
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.redirect('/login');
})


// GET url
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send("You are not logged in. Please <a href='/login'>Login</a> or <a href='/register'>Register</a>");
  }
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

//POST /urls
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    const newURL = generateRandomString();
    urlDatabase[newURL] = {
      longURL: req.body.longURL,
      userID: userID
    }
    res.redirect(`/urls/${newURL}`);
  } else {
    return res.status(400).send('Login required');
  }
});

// GET /urls/new
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect('/login');

  }
  const templateVars = {
    user: users[userID]
  };
  res.render("urls_new", templateVars)
});

// GET /urls/:id
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urlDatabase, 
    userUrls, 
    shortURL, 
    user: users[userID]
  };

  if (!urlDatabase[shortURL]) {
    return res.status(400).send('Short url does not exist');
  } else if (!userID || !userUrls[shortURL]) {
    return res.status(400).send('Login required');
  } else {
  res.render("urls_show", templateVars);
  }
});


// POST /urls/:id
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;

  if (userID && userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
  return res.status(400).send('You cannot do that: check login or short url');
});


// POST /urls/:id/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (userID && userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  return res.status(400).send('You are not authorized');
});


// GET /u/:id
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);

  if (!urlDatabase[shortURL]) {
    return res.status(400).send('Short url does not exist!');
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


// GET /login
app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[userID] };
  res.render('urls_login', templateVars);
});


//POST login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const getExistingUser = getUserByEmail(email, users); 
  if (!email || !password) {
    return res.status(400).send("You need to provide email and password to login. Please <a href='/login'>Login</a>");
  }
  if (getExistingUser && bcrypt.compareSync(password, getExistingUser.password)) { 
    req.session.user_id = getExistingUser.id;
    return res.redirect('/urls');
  }
  return res.status(400).send("Either email or password do not exist Please <a href='/login'>Login</a>");
});


app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[userID] };
  res.render('urls_registration', templateVars);
});


// POST register
app.post('/register', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).send("empty info, cannot register <a href='/register'>Register</a>");
  }
  let userAlreadyExists = getUserByEmail(email, users);
  if (userAlreadyExists) {
    return res.status(400).send("email already registered: <a href='/register'>Register</a>");
  }
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = userID; 
  res.redirect('/urls');
});


//POST logout
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
});

///////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
