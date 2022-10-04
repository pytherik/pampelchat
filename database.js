// The require('mongoose') call below returns a Singelton object.
// It means thet the first time you call require('mongoose'), it
// is creating an instanco of the Mongoose class and returning it.
// On subsequent calls, it will return the same instance that wos
// created and returned to you the first time because of how 
// module import/export works on ES6
 
const mongoose = require('mongoose');

// mongoose.set('useFindAndModify', false);
// mongoose.set('useUnifieedTopology', true);


class Database {

  constructor() {
    this.connect();
  }

  connect() {
    mongoose.connect("")
      .then(() => console.log("Datenbankverbindung hergestellt!"))
      .catch(() => console.log("DB Verbindungsfehler!"))
  }
}

module.exports = new Database();
