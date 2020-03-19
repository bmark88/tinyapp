const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ481W"} ,
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ481W" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let random = '';

  for (let i = 0; i < chars.length; i++) {
    if (random.length < 6) {
      random += chars[(Math.random() * chars.length).toFixed(0)];
    }
  }
  return random;
};

const uselessEmailChecker = (expectedEmail, actualEmail) => {
  if (expectedEmail === actualEmail) {
    return true;
  }
};

const urlsForUser = (id) => {
  const urlsForUser = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urlsForUser[url] = urlDatabase[url];    
    }
  }

  return urlsForUser;
};

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
  const userID = req.cookies.user_id;
  const user = users[userID];

  if (!user) {
    res.redirect('/login');
  }
  const checkURLS = urlsForUser(user.id);

  let templateVars = {
    urls: checkURLS,
    urlDatabase,
    user
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  let templateVars = {
    user
  };

  if (!user) {
    res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_id;
  const user = users[userID];

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user
  };

  if (!user) {
    res.redirect('/login');
  }

  res.render("urls_show", templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };

  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  if (!user) {
    res.redirect('/login');
  }

  if (userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  } 

  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.input;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  for (let id in users) {
    if (uselessEmailChecker(users[id].email, req.body.email) && users[id].password === req.body.password) {
      res.cookie('user_id', users[id].id);
      res.redirect('/urls');
    }
  }

  res.sendStatus(403);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  let templateVars = {
    user
  };

  res.render("urls_register", templateVars);
});

app.post('/register', (req, res) => {
  const randomID = generateRandomString();
  const user = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  };

  for (let id in users) {
    if (req.body.email === "") {
      res.sendStatus(400);
      return;
    } else if (uselessEmailChecker(users[id].email, req.body.email)) {
      res.sendStatus(400);
      return;
    }
  }

  users[randomID] = user;
  res.cookie('user_id', randomID);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  let templateVars = {
    user
  };

  res.render("urls_login", templateVars);
});