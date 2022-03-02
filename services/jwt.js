'use strict'

let jwt = require('jwt-simple');
let moment = require('moment');
let secret = 'secret_key';

exports.createToken = function(user){
    var payload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix
    };
    return jwt.encode(payload, secret);
}