const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('../schemas/UserSchema');


app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
  res.status(200).render("register"); 
})

router.post("/", async (req, res, next) => {

  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const username = req.body.username.trim();
  const email = req.body.email.trim();
  const password = req.body.password;

  const payload = req.body;

  if (firstName && lastName && username && email && password) {
    
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    })
      .catch((error) => {
        console.log(error);
        payload.errorMessage = "Irgendwas stimmt hier nicht!";
        res.status(200).render("register", payload);
      });
    
    if (user == null) {
      // no user found
      const data = req.body;
      
      data.password = await bcrypt.hash(password, 10);

      User.create(data)
        .then((user) => {
          req.session.user = user;
          return res.redirect("/");
        });
    }
    else {
      // user already exists
      if (email == user.email) {
        payload.errorMessage = "Email schon registriert!";

      }
      else {
        payload.errorMessage = "Benutzername ist schon vergeben!";
      }
      res.status(200).render("register", payload);  
    }
  }
  else {
    payload.errorMessage = "Überprüfe deine Eingabe noch einmal!";
    res.status(200).render("register", payload);
  }
})

module.exports = router;