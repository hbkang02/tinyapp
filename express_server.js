const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


//data
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

function generateRandomString() {
  let r = (Math.random() + 1).toString(36).substring(7);
  return r;
};


//////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.send("Hello!");
});



app.get("/urls/new", (req, res) => {
  res.render("urls_new")
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const templateVars = { id: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(urlDatabase);
  console.log(req.params.id);
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log('req.body', req.body);
  const newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/urls/${newID}`);
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

