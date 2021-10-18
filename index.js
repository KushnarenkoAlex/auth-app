const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const app = express();
const port = 3000;
const https = require('https');
const fs = require('fs');

const rawJWK = fs.readFileSync("jwks.json");
const jwk = JSON.parse(rawJWK);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/sendUserInfo', (req, res) => {

    console.log("1 REQUEST AUTH TOKEN: " + req.headers["authorization"])
    console.log("2 REQUEST AUTH HEADERS: " + JSON.stringify(req.headers))
    console.log("2 REQUEST AUTH BODY: " + JSON.stringify(req.body))
    console.log("2 REQUEST AUTH BODY TOKEN: " + req.body.token)

    var options = {
        host: 'kush.auth.us-east-2.amazoncognito.com',
        path: '/oauth2/userInfo',
        headers: { 'Authorization': "Bearer " + req.body.token }
    };

    https.request(options, function (response) {
        console.log("3 AUTH RESPONSE STATUS: " + response.statusCode);

        response.on("data", function (chunk) {
            console.log("4 AUTH RESPONSE BODY: " + chunk);
        })
    }).on('error', function (e) {
        console.log("5 AUTH RESPONSE ERROR: " + e.message);
    }).end();


    res.json({
        message: 'Token is valid'
    });
});

app.post('/validateJWT', (req, res) => {

    console.log("1 REQUEST AUTH TOKEN: " + req.headers["authorization"])
    console.log("2 REQUEST AUTH HEADERS: " + JSON.stringify(req.headers))
    console.log("2 REQUEST AUTH BODY: " + JSON.stringify(req.body))
    console.log("2 REQUEST AUTH BODY TOKEN: " + req.body.token)

    var pem = jwkToPem(jwk.keys[0]);

    jwt.verify(req.body.token, pem, { algorithms: ['RS256'] }, function (err, decodedToken) {
        if (err) {
            console.log("err: " + err)
            res.send(401, err)
        }
        res.set('active', 'true');
        console.log("decodedToken: " + JSON.stringify(decodedToken))
        res.send(200, decodedToken)
    });

    res.json({
        message: 'Token is valid'
    });
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));