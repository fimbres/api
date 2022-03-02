'use strict'

let jwt = require('jwt-simple');
let moment = require('moment');
let secret = 'secret_key';

exports.ensureAuth = function (req, res, next) {
    if(!req.headers.authorization){
        return res.status(403).send({ message: 'The petition has not been authorized.'});
    }
    var token = req.headers.authorization.replace(/['"]+/g, '');
    try{
        var payload = jwt.decode(token, secret);
        if(payload.exp <= moment().unix()) {
            return res.status(403).send({ message: 'El token ya ha expirado'});
        }
    }catch(e){
        console.log(e);
        return res.status(403).send({ message: 'El token no es válido.'});
    }
    req.user = payload;
    next();
}