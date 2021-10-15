const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const https = require('https');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post('/example', (req, res) => {

    console.log("REQUEST AUTH TOKEN: " + req.headers["authorization"])
    console.log("REQUEST: " + req)

    var options = {
        host: 'kush.auth.us-east-2.amazoncognito.com',
        path: '/oauth2/userInfo',
        headers: { 'Authorization': req.headers["authorization"] }
    };

    https.request(options, function (response) {
        console.log("AUTH RESPONSE STATUS: " + response.statusCode);

        response.on("data", function (chunk) {
            console.log("AUTH RESPONSE BODY: " + chunk);
        })
    }).on('error', function (e) {
        console.log("AUTH RESPONSE ERROR: " + e.message);
    }).end();


    res.json({
        message: 'Token is valid'
    });
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));