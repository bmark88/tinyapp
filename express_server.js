const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// const users = {
//   "hello": {
//     username: 'hello',
//     password: 'password'
//   }
// };

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let random = '';

  for (let i = 0; i < chars.length; i++) {
    if (random.length < 6) {
      random += chars[(Math.random() * chars.length).toFixed(0)]
    }
  }
  return random;
}
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));


app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username ? req.cookies.username : null
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies.username ? req.cookies.username : null
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL],
    username: req.cookies.username ? req.cookies.username : null
  };
  res.render("urls_show", templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.input;
  res.redirect('/urls')
});

app.post("/login", (req, res) => {
  let username = req.body.username;

  if (username) {
    res.cookie('username', username);
    res.redirect('/urls');
  } else {
    res.send('There is no username');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = {
    username: req.cookies.username ? req.cookies.username : null
  };
  res.render("urls_register", templateVars);
});

// app.post('/register', (req, res) => {
//   res.redirect('/register');
// });