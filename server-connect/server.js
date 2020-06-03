"use strict"
const express = require("express"),
    app = express(),
    port = process.env.PORT || 5000,
    cors = require("cors");
const axios = require("axios");
const queryString = require('query-string');
require('dotenv').config()

app.use(cors());
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.listen(port, () => console.log("Backend server live on " + port));



//Google API

const Bearer = require('@bearer/node')('FUFbE-aEBIbyWN5aVuX3wpWVp5pMOL8C')
const gsheet = Bearer.integration('google_sheets')


app.post('/', (req, res) => {
    // récupère la reponse coté front 
    console.log('demande reçu !', req.body.data)

    // 3. Define spreadsheet and values to append
    const spreadsheetId = '1fDDccNM-8kFfWvUmKcViJEkOfyq3uqPGOlTq2azVclY'
    const data = req.body.data


    // 4. Send data with a POST request
    gsheet.auth('ae8c3120-9510-11ea-b789-e3992aebbe8b')
        .post(`${spreadsheetId}/values/A2:append`, {
            body: { values: data },
            query: { valueInputOption: 'RAW' }
        }).then(() => {
            console.log('Saved!')
            const responseObj = {
                statutCode: 200,
                body: req.body.data,
                message: "ok c'est transmis"
            }
            res.send(responseObj);
        }).catch((error) => {
            console.log(error);
        })
})

// SPOTIFY API
app.get("/", (req, res) => {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
    };
    axios.post('https://accounts.spotify.com/api/token?grant_type=client_credentials', queryString.stringify({}), {
        headers
    })
        .then(apiResponse => {
            const responseObject = {
                statusCode: 200,
                body: (apiResponse.data.access_token),
                message: "we dit it "
            };
            res.send(responseObject);
        })
        .catch(err => {
            console.error("Error: " + err);
        });
});





