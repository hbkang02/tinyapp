const express = require('express');
const { reset } = require('nodemon');
const cookieSession = require('cookie-session');
const { get } = require('request-promise-native');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

const { generateRandomString, getUserByEmail, urlsForUser } = require('./functions');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: 'pink-dinosaur'
}));

//data
const urlDatabase = {
  b6UTxQ: {
    longURL: 'http://www.lighthouselabs.ca',
    userID : 'aJ481W',
  },
  i3BoGr: {
    longURL: 'http://www.google.ca',
    userID: 'aJ481W',
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
};
//////////////////////////////////////////////////////////////////////////

// GET /
app.get('/', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  }
    res.redirect('/login');
  })
  
  // GET urls
  // brings in the template from urls index
  app.get("/urls", (req, res) => {
    const userID = req.session.userID;
    const user = user[userID];
    const userUrls = urlsForUser(userID, urlDatabase);
   
    if (!user) {
      return res.status(400).send("You are not looged in. Please <a href='/login'>Login</a>");
    }
    const urls = urlsForUser(id);
    const templateVars = {
      urls,
      user
    };
    res.render("urls_index", templateVars);
  });

  // GET /urls/new
  // renders urls_new page
  //CHECK LATER FOR FIX/////////////
  app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect('/login');
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.userID]
  };
  res.render("urls_new", templateVars)
});

// GET /urls/:id
// brings id = shortUrl, longurl = longurl
app.get("/urls/:id", (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.id;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { 
    id: shortURL, 
    longURL: urlDatabase[shortURL].longURL, 
    user: users[userID] };

  if (!userID || !userUrls[shortURL]) {
    return res.status(400).send('Login required');
  } else if (!urlDatabase[shortURL]) {
    return res.status(400).send('Short url does not exist');
  }
    res.render("urls_show", templateVars);
  
});

// GET /u/:id
// redirect to website of longURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.body.shortURL;
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  // try{
  //   urlDatabase[req.param.id]
  //   //logic
  //   } catch {
  //     // Render error msg
  //   }
  if (!urlDatabase[shortURL]) {
    return res.status(400).send('Short url does not exist!');
  } 
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//POST /urls
app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    const newURL = generateRandomString();
    urlDatabase[newURL] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    }
    // urlDatabase[newURL] = req.body.longURL;
    res.redirect(`/urls/${newURL}`);
  };
  res.redirect('/urls'); 
  // res.status(400).send('Login required!');
});

// POST /urls/:id
// Edit updates current long url to assigned long url
app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = longURL;
  const userID = req.session.user_id;

  if(!userID && !userID === urlDatabase[shortURL].userID) {
    return res.status(400).send('You cannot do that: check login or short url');
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

// POST /urls/:id/delete
// delete urls data
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  if (!userID && userID !== urlDatabase[shortURL].userID) {
    // const errorMessage = 'You cannot do that';
    // res.status(404).render('urls_error', { errorMessage });
    return res.status(400).send('You are not authorized');
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});






// redirection to newly created ID (shorturl) route




// GET /login
//create login 
app.get('/login', (req, res) => {
  const userID = req.session.userID;
  if (userID) {
  return  res.redirect('/login');
  }
  res.render('urls_login', { user: null });
});

app.get('/register', (req, res) => {
  const userID = req.session.userID;
  // const id = req.cookies.user_id;
  // const user = user[id]
  if (userID) {
  return res.redirect('/urls')
  }
  res.redirect('/register');
  res.render('urls_registration', { user: null});
});

//POST login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // req.session.userID = getUser.userID
  const getUser = getUserByEmail(email); //check if my email exists

  if (!getUser &&  bcrypt.compareSync(req.body.password, getUser.password !== password)) { // if my userID exists and if saved password === password input
    return res.status(400).send("Either email or password do not exist <a href='/login'>Login</a>");
  } 

  const userID = res.session.userID // ********
  res.redirect('/urls');
});

// POST register
// add user
app.post('/register', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).send("empty info, cannot register <a href='/register'>Register</a>");
  }
  let userAlreadyExists = getUserByEmail(email);
  if (userAlreadyExists) {
    return res.status(400).send("email already registered: <a href='/register'>Register</a>");
  }
  const newID = generateRandomString();
  users[newID] = { //happy :)
    id: newID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  user[newID] = user;
  req.session.userID = userID // get cookie res.cookie('user_id', id) ********************
  res.redirect('/urls');
});

//POST logout
app.post('/logout', (req, res) => {
  res.clearCookie(session);
  res.redirect('/login');
});








///////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

