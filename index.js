const express = require('express')
const path = require('path')
const url = require('url');
const dt = require('./constantFunc');

const PORT = process.env.PORT || 5000
const app = express()


app.listen(PORT, (err) => {
    if (err) {
        console.error(err)
    }
    console.log('port is listening to: ', PORT)
})

app.get('/app', (request, response) => {

    // response.writeHead(200, {
    //     'Content-Type': 'text/html'
    // });
    response.json(getObj())
})


function getObj() {
    var obj = {
        'statusCode': 200,
        'data': {
            'key': 'key',
            'value': 'value'
        }
    }
    return obj
  }