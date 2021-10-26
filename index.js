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
    console.log("3 REQUEST AUTH BODY: " + JSON.stringify(req.body))

    var pem = jwkToPem(jwk.keys[0]);

    jwt.verify(req.body.token, pem, { algorithms: ['RS256'] }, function (err, decodedToken) {
        if (err) {
            console.log("err: " + err);
            res.status(401).send(err);
        }
        console.log("decodedToken: " + JSON.stringify(decodedToken));
        var customerIDs = decodedToken.customerIDs.split(",")
        var ctManageMyOrdersScopes = customerIDs.map(function (soldToId) {
            return "manage_my_orders:daria-selling-plants:" + soldToId
        })
        var ctManageOrdersScopes = customerIDs.map(function (soldToId) {
            return "manage_orders:daria-selling-plants:" + soldToId
        })
        ctScopes
        var responseBody = new Object();
        responseBody.active = true;
        responseBody.scope = ctManageMyOrdersScopes.join(" ") + " " + ctManageOrdersScopes.join(" ") + " customer_id:eeb6a896-3fc9-467e-9c0d-ff85692a1aa5";
        res.status(200).send(responseBody);
    });

});

app.post('/okPost', (req, res) => {
    res.status(200).send("OK");
});
app.get('/okGet', (req, res) => {
    res.status(200).send("OK");
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));