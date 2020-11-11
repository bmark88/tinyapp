const cookieSession = require('cookie-session');
const express = require("express");
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 3000; // default port 3000
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  checkForHTTP
} = require('./helpers');

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ481W",
    viewCount: 0,
    uniqueCount: 0
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ481W",
    viewCount: 0,
    uniqueCount: 0
  }
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
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: "session",
  keys: ["user_id"]
}));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  return res.redirect('/login');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    return res.redirect('/login');
  }
  const checkURLS = urlsForUser(user.id, urlDatabase);

  const templateVars = {
    urls: checkURLS,
    urlDatabase,
    user
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  const templateVars = {
    user
  };

  if (!user) {
    return res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    viewCount: 0,
    uniqueCount: 0,
    visitorDetails: {
      visitorID: [],
      timeStamp: []
    }
  };

  return res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const shortURL = urlDatabase[req.params.shortURL];
  const visitorID = shortURL.visitorDetails.visitorID;
  const timeStamp = shortURL.visitorDetails.timeStamp;
  shortURL.viewCount++;

  // add +1 to unique count if a new unique user visits the url
  if(!shortURL.visitorDetails.visitorID.includes(req.session.uniqueID)) {
    shortURL.uniqueCount++;
  }

  // if a session cookie uniqueID doesn't exist yet, create one
  if (!req.session.uniqueID) {
    req.session.uniqueID = generateRandomString();
  }

  // checks if url has http:// or https://
  if (checkForHTTP(longURL, urlDatabase, req.session.uniqueID, visitorID, timeStamp)) {
    return res.redirect(longURL);
  }

  return res.redirect('http://' + longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = urlDatabase[req.params.shortURL];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: shortURL.longURL,
    viewCount: shortURL.viewCount,
    uniqueCount: shortURL.uniqueCount,
    visitorDetails: shortURL.visitorDetails,
    user
  };

  if (!user) {
    return res.redirect('/login');

    // validates userID authority to access a given shortURL
  } else if (userID !== shortURL.userID) {
    return res.status(403).send("You do not have access to this!");
  }

  res.render("urls_show", templateVars);
});

app.delete("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    return res.redirect('/login');
  }

  if (userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }

  return res.redirect('/urls');
});

app.put("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.input;
  urlDatabase[req.params.shortURL].uniqueCount = 0;

  return res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect email or password!");
  }

  req.session.user_id = user.id;
  return res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('session');
  return res.redirect('/login');
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    user
  };

  res.render("urls_register", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please enter both the email and password!");
  }

  // check to see if the email is already in use
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("Email is already in use!");
  }

  const user_id = generateRandomString();

  const user = {
    id: user_id,
    email,
    password: bcrypt.hashSync(req.body.password, 10)
  };

  users[user_id] = user;
  req.session.user_id = user_id;
  return res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  const templateVars = {
    user
  };

  res.render("urls_login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});