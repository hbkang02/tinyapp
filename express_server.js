const express = require('express');
const { reset } = require('nodemon');
const cookieSession = require('cookie-session');
const { get } = require('request-promise-native');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey1', 'secretkey2']
}));
app.use(express.urlencoded({ extended: true }));

//data
const urlDatabase = {
  b6UTxQ: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'user3RandomID',
  },
  i3BoGr: {
    longURL: 'http://www.google.ca',
    userID: 'user3RandomID',
  },
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: '123',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2example.com',
    password: 'dishwasher-funk',
  },
  user3RandomID: {
    id: 'user3RandomID',
    email: '2@2',
    password: '$2a$10$d/uKNCoKbcSAWoxL5aW/dObBFds1Mmy/O9PHAaVfaXNat7Tto8cSO',
  },
};


//////////////////////////////////////////////////////////////////////////

// GET /
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.redirect('/login');
})


// GET url
// brings in the template from urls index
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
// renders urls_new page
//CHECK LATER FOR FIX/////////////
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
// brings id = shortUrl, longurl = longurl
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

  // console.log('asdgf', shortURL);
  // for (let e in urlDatabase) {
  //   console.log("id: " + e + " URL: " + urlDatabase[e].longURL);
  // }

  if (!urlDatabase[shortURL]) {
    return res.status(400).send('Short url does not exist');
  } else if (!userID || !userUrls[shortURL]) {
    return res.status(400).send('Login required');
  } else {
  res.render("urls_show", templateVars);
  }
});

// POST /urls/:id
// Edit updates current long url to assigned long url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // const longURL = req.body.longURL;
  const userID = req.session.user_id;

  if (userID && userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
  return res.status(400).send('You cannot do that: check login or short url');
});

// POST /urls/:id/delete
// delete urls data
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
// redirect to website of longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);

  // console.log('asdgf', shortURL);
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('Short url does not exist!');
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// redirection to newly created ID (shorturl) route



// GET /login
//create login 
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
  console.log('ladf');
  const { email, password } = req.body;

  const getUser = getUserByEmail(email, users); //check if my email exists
  if (!email || !password) {
    return res.status(400).send("You need to provide email and password to login. Please <a href='/login'>Login</a>");
  }
  if (getUser && bcrypt.compareSync(password, getUser.password)) { // if my userID exists and if saved password === password input
    req.session.user_id = getUser.id;
    return res.redirect('/urls');
    // log("stored: " + req.session.user_id);
  }
  return res.status(400).send("Either email or password do not exist Please <a href='/login'>Login</a>");
  // const userID = res.session.user_id // ********
});


app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  console.log('userid: ', userID);
  // const id = req.cookies.user_id;
  // const user = user[id]
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[userID] };
  res.render('urls_registration', templateVars);
});

// POST register
// add user
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
  users[userID] = { //happy :)
    userID,
    email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  // users.push(userID);
  req.session.user_id = userID; // get cookie res.cookie('user_id', id) ********************
  res.redirect('/urls');
});

//POST logout
app.post('/logout', (req, res) => {
  // console.log('adsf');
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
});
///////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
