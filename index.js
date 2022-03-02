'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3977;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/Proyecto', (err, res) => {
    if (err) {
        throw err;
    }
    else{
        console.log('Connected to Mongodb');
        app.listen(port, function(){
            console.log("Server listening in port "+port);
        })
    }
});