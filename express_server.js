const cookieSession = require('cookie-session');
const express = require("express");
const methodOverride = require('method-override');
const app = express();
const PORT = 8080; // default port 8080
const {
  getUserByEmail,
  generateRandomString
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

const urlsForUser = (id) => {
  const urlsForUser = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urlsForUser[url] = urlDatabase[url];
    }
  }

  return urlsForUser;
};

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
  res.redirect('/login');
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
  const userID = req.session.user_id;
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
  const userID = req.session.user_id;
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
  const userID = req.session.user_id;
  const user = users[userID];

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    viewCount: urlDatabase[req.params.shortURL].viewCount,
    uniqueCount: urlDatabase[req.params.shortURL].uniqueCount,
    visitorDetails: urlDatabase[req.params.shortURL].visitorDetails,
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
    userID: req.session.user_id,
    viewCount: 0,
    uniqueCount: 0,
    visitorDetails: {
      visitorID: [],
      timeStamp: []
    }
  };

  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  urlDatabase[req.params.shortURL].viewCount++;

  // if a session cookie uniqueID doesn't exist yet, create one
  if (!req.session.uniqueID) {
    req.session.uniqueID = generateRandomString();

    //add to unique user count
    urlDatabase[req.params.shortURL].uniqueCount++;
  }

  if ((longURL.slice(0, 7)) === 'http://') {
    urlDatabase.viewCount++;

    //data for the time stamps stretch work
    urlDatabase[req.params.shortURL].visitorDetails.visitorID.push(req.session.uniqueID);
    urlDatabase[req.params.shortURL].visitorDetails.timeStamp.push(Date());

    res.redirect(longURL);
  } else {
    urlDatabase.viewCount++;

    //data for the time stamps stretch work
    urlDatabase[req.params.shortURL].visitorDetails.visitorID.push(req.session.uniqueID);
    urlDatabase[req.params.shortURL].visitorDetails.timeStamp.push(Date());

      if ((longURL.slice(0, 8)) === 'https://') {
        res.redirect(longURL)
      }

    res.redirect('http://' + longURL);
  }
});

app.delete("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    res.redirect('/login');
  }

  if (userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }

  res.redirect('/urls');
});

app.put("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.input;
  urlDatabase[req.params.shortURL].uniqueCount = 0;

  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const {
    email,
    password
  } = req.body;
  const user = getUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect email or password!");
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  let templateVars = {
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
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  let templateVars = {
    user
  };

  res.render("urls_login", templateVars);
});