var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passwordHash = require('password-hash');



// console.log(passwordHash.verify('password123', hashedPassword)); // true
// console.log(passwordHash.verify('Password0', hashedPassword)); 

router.post('/login', (req, res) => {
    //console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;

    res.locals.connection.query('SELECT * from users where username = ?', [username], function (error, results, fields) {
        if(!error) {
            //console.log(results);
            let hashedPassword = '';
            if(results.length == 1) {
                hashedPassword = results[0]['password'];
            }
            const verified = passwordHash.verify(password, hashedPassword);
            if(verified) {
                const user = {
                    id: results[0]['id'],
                    name: results[0]['name'],
                    username: results[0]['username'],
                    roles: results[0]['roles']
                }
                jwt.sign({user}, 'secretsuper', { expiresIn: '600s' }, (err, token) => {
                    if(err) throw err;
                    res.send(JSON.stringify({ status: 200, error: null, response: "ok", token: token}))
                });
                
            } else {
                res.send(JSON.stringify({ status: 200, error: "Invalid Credentials. Please Try Again.", response: null}))
            }
        } else {
            res.send(JSON.stringify({ status: 500, error: error, response: null}));
        }
    });
});


router.post('/register', (req, res) => {
    //console.log(req.body);
    const user = {
        username: req.body.username,
        password: passwordHash.generate(req.body.password),
        name: req.body.name,
        roles: req.body.roles
    }
    res.locals.connection.query('SELECT id FROM users where username = ?', [user.username], (error, rows, fileds) => {
        if(!error) {
            if(rows.length >= 1) {
                res.send(JSON.stringify({status: 200, error: "Username already exists.", response: null}));
            } else {
                res.locals.connection.query('INSERT INTO users SET ?', user, (error, rows, fileds) => {
                    if(error) {
                        res.send(JSON.stringify({ status: 500, error: error, response: null}));
                    } else {
                        res.send(JSON.stringify({"status": 200, error: null, response: "ok"}));
                    }
                });
            }
        } else {
            res.send(JSON.stringify({ status: 500, error: error, response: null}));
        }
    });
    
});


router.get('/', verifyToken, function(req, res) {
    res.sendStatus(403);
});


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
