const express = require('express');
const app = express();
const port = 3030;
const middleware = require('./middleware');
const path = require('path')
const bodyParser = require('body-parser');
const mongoose = require('./database');
const session = require('express-session');

const server = app.listen(port, () => console.log(`Server lauscht an Port ${port}`));

// Template settings
app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

// Static files path
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "harry hirsch",
  resave: true,
  saveUninitialized: false
}));

// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/reigsterRoutes');
const logoutRoute = require('./routes/logout');
const postRoute = require('./routes/postRoutes')

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/posts", postRoute);


// Api routes
const postsApiRoute = require('./routes/api/posts');

app.use("/api/posts", postsApiRoute);



app.get("/", middleware.requireLogin, (req, res, next) => {

  let payload = {
    browserTitle: "pampelchat",
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  }
  res.status(200).render("home", payload);
})
