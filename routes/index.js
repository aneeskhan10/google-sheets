const express = require('express');
const router = express.Router();
const {google} = require('googleapis');
const credentials = {
    "private_key": "PUT YOUR PRIVATE KEY HERE",
    "client_email": "PUT YOUR SERVICE ACCOUNT EMAIL ACCOUNT HERE"
}
router.get('/', async (req, res, next) => {
    const sheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
    const range = 'Class Data!A1:F';
    const query = {header: "Student Name", values: ["Alexandra", "Andrew"]};

    let authClient = await authorize(credentials);
    let response = await getData(authClient, query, sheetId, range);
    res.send(response);

});

// get some data
async function getData(authClient, query, sheetId, range) {

    let data = await getDataFromSheet(authClient, sheetId, range);
    // based on the query, filter the data
    const headings = data.headings;
    const sheetValues = data.values;

    // find row id of the header
    const headingIndex = headings.indexOf(query.header);
    console.log(headings);
    console.log(headingIndex);
    let foundRecords = [];
    for (let filterValue of query.values) {
        for (let index in sheetValues) {
            console.log(`field being searched="${sheetValues[index][headingIndex]}" and filter="${filterValue}"`)
            if (sheetValues[index][headingIndex] === filterValue) {
                foundRecords.push(sheetValues[index]);
            }
        }
    }
    return foundRecords;

}

async function getDataFromSheet(auth, sheetId, range) {
    const sheets = google.sheets({version: 'v4', auth});

    return await new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: range,
        }, (err, res) => {
            if (err) {
                console.log(err);
                throw err
            }
            const rows = res.data.values;
            if (rows.length) {
                console.log(JSON.stringify(rows));
                // Print the headings
                const headings = rows.slice(0, 1);
                const values = rows.slice(1);
                resolve({headings: headings[0], values});
            } else {
                resolve({headings: [], values: []});
            }
        });
    });

}

async function authorize(credentials) {
    let jwtClient = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']);

    return await new Promise((resolve, reject) => {
        //authenticate request
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                console.log(err);
                throw err;

            } else {
                console.log("Successfully connected!");
                // do something with the auth
                resolve(jwtClient);
            }
        });
    });
}

module.exports = router;
