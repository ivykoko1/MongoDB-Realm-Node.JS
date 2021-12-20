var express = require('express');
var router = express.Router();

/*MongoDB Realm Initialization*/
const Realm = require("realm");
const realmApp = new Realm.App({ id: "myfirstapp-dctbd" });

async function logToRealm(){
  const credentials = Realm.Credentials.anonymous();
  // You can log in with any set of credentials using `app.logIn()`
  const user = await realmApp.logIn(credentials);
  console.log(`Logged in with the user id: ${user.id}`);
}
/* GET users listing. */
router.get('/', function(req, res, next) {
  logToRealm();

  res.send('respond with a resource');
});

module.exports = router;
