const express = require('express');
const { reset } = require('nodemon');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//data
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = { 
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2example.com',
    password: 'dishwasher-funk',
  },
};

function generateRandomString() {
  let r = (Math.random() + 1).toString(36).substring(7);
  return r;
};



//////////////////////////////////////////////////////////////////////////



// renders urls_new page


app.get("/urls/new", (req, res) => {
  const username = req.body.user; 
  const templateVars = { 
    // urls: urlDatabase, 
    username
  };
  res.render("urls_new", templateVars)
});

// brings id = shortUrl, longurl = longurl

app.get("/urls/:id", (req, res) => {
  const users = req.body.user;
  const shortURL = req.params.id;
  const templateVars = { id: shortURL, longURL: urlDatabase[shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

// brings in the template from urls index

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
    };
  res.render("urls_index", templateVars);
});

// redirect to website of longURL

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//delete urls data

app.post("/urls/:id/delete", (req, res) => {
  console.log(urlDatabase);
  console.log(req.params.id);
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// updates current long url to assigned long url

app.post('/urls/:id', (req, res) => {
  console.log('req.body', req.body);
  const value = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = value;
  // const longURL = urlDatabase[req.params.id];
  res.redirect('/urls');
});

// redirection to newly created ID (shorturl) route

app.post("/urls", (req, res) => {
  // console.log('req.body', req.body);
  const newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;
  res.redirect(`/urls/${newURL}`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//create login 

app.post('/login', (req, res) => {
  const users = req.body.user;
  res.cookie('user_id', users);
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
  // console.log('req.cookies:', req.cookies);
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  res.render('urls_registration')
});

app.post('/register', (req, res) => {
  console.log('req.body', req.body);
  // const user = ( users );
const { email, password } = req.body
const newID = generateRandomString();
users[newID] = {
  id: newID,
  email,
  password
};
  res.cookie('user_id', newID);
  res.redirect('/urls');
});



///////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

