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
  res.status(200).render("login"); 
})
router.post("/", async (req, res, next) => {

  const payload = req.body;

  if (req.body.logUsername && req.body.logPassword) {
    const user = await User.findOne({
      $or: [
        { username: req.body.logUsername },
        { email: req.body.email }
      ]
    })
      .catch((error) => {
        console.log(error);
        payload.errorMessage = "Irgendwas stimmt hier nicht!";
        res.status(200).render("login", payload);
      });
    
    if (user != null) {
      const result = await bcrypt.compare(req.body.logPassword, user.password);
      
      if (result === true) {
        req.session.user = user;
        return res.redirect("/");
      }
    }
  
    payload.errorMessage = "Das haut nicht hin!";
    return res.status(200).render("login", payload);
  }

  payload.errorMessage = "Fülle bitte beide Felder aus!";

  res.status(200).render("login"); 
})

module.exports = router;