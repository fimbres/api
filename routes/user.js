'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

let multipart = require('connect-multiparty');
let md_upload = multipart({uploadDir: './uploads/users'});

api.get('/prueba-controlador', md_auth.ensureAuth ,UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-user-image/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);

module.exports = api;