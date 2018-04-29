var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');



router.get('/', verifyToken, function(req, res, next) {
  jwt.verify(req.token, 'secretsuper', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
        console.log('xx');
        res.locals.connection.query('SELECT * from users', function (error, results, fields) {
    		if (error) throw error;
    		res.json({status: 200, error: null, data: results});
    	});
    }
  })

});

//verify verifyToken
function verifyToken(req, res, next) {
  // get auth header
  const bearerHeader = req.headers['authorization'];
  console.log(bearerHeader);
  if(typeof bearerHeader !== 'undefined') {
     const bearerToken = bearerHeader.split(' ')[1];
     req.token = bearerToken;
     next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = router;
