const express = require('express');
const mysql2 = require('mysql2');
const dbconfig = require('./config/db.js');
const connection =  mysql2.createConnection(dbconfig);

const app = express();

app.set('port', process.env.PORT || 3000);

app.get('/', (req, res) => {
    res.send('root');
})

app.get('/users', (req, res) => {
    connection.query('SELECT * FROM user', (error, rows) => {
        if (error) throw error;
        console.log('User info is: ', rows);
        res.send(rows);
    });
});

app.listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
})