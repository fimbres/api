'use strict'

let express = require('express');
let ArtistController = require('../controllers/artist');
let api = express.Router();
let md_auth = require('../middlewares/authenticated');
let multipart = require('connect-multiparty');
let md_upload = multipart({uploadDir: './uploads/artists'});

api.get('/artist/:id', md_auth.ensureAuth, ArtistController.getArtist);
api.post('/artist', md_auth.ensureAuth, ArtistController.saveArtist);
api.get('/artists/:page', md_auth.ensureAuth, ArtistController.getArtists);
api.put('/update-artist/:id', md_auth.ensureAuth, ArtistController.updateArtist);
api.delete('/delete-artist/:id', md_auth.ensureAuth, ArtistController.deleteArtist);
api.post('/upload-image-artist/:id', [md_auth.ensureAuth, md_upload], ArtistController.uploadImage);
api.get('/get-image-artist/:imageFile', ArtistController.getImageFile);

module.exports = api;