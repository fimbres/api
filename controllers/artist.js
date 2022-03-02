'use strict'

let path = require('path');
let fs = require('fs');
let mongoosePaginate = require('mongoose-pagination');

let Artist = require('../models/artist');
let Album = require('../models/album');
let Song = require('../models/song');

function getArtist(req, res) {
    let artistID = req.params.id;
    Artist.findById(artistID, (err, artist) => {
        if(err) {
            res.status(404).send({message: 'Error with the petition'});
        }
        else{
            if(!artist) {
                res.status(404).send({message: 'Artist does not exist!'});
            }
            else{
                res.status(200).send({artist});
            }
        }
    });
}

function getArtists(req, res) {
    let page = req.params.page;
    if(req.params.page){
        page = req.params.page;
    }
    else{
        page = 1;
    }
    let itemsPerPage = 3;
    Artist.find().sort('name').paginate(page, itemsPerPage, function(err, artists, total){
        if(err){
            res.status(500).send({message:'An error has occurred'});
        }
        else{
            if(!artists){
                res.status(404).send({message: 'There is no Artists to show'});
            }
            else{
                return res.status(200).send({
                    pages: total, artists: artists
                });
            }

        }
    });
}

function saveArtist(req, res) {
    let artist = new Artist();
    let params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    artist.save((err, artistStored) => {
        if(err) {
            res.status(500).send({message: 'Error saving artist'});
        }
        else{
            if(!artistStored) {
                res.status(404).send({message: 'El artista no ha sido guardado'});
            }
            else{
                res.status(200).send({artist: artistStored});
            }
        }
    });
}

function updateArtist(req, res) {
    let artistID = req.params.id;
    let update = req.body;
    Artist.findByIdAndUpdate(artistID, update, (err, artistUpdated) => {
        if(err){
            res.status(500).send({message: 'An error has occurred'});
        }
        else{
            if(!artistUpdated){
                res.status(404).send({message: 'The Artist does not exist'});
            }
            else{
                res.status(200).send({artist: artistUpdated});
            }
        }
    });
}

function deleteArtist(req, res) {
    let artistID = req.params.id;
    Artist.findByIdAndDelete(artistID, (err, artistRemoved) => {
        if(err){
            res.status(500).send({message: 'Error cant remove the Artist selected'});
        }
        else{
            if(!artistRemoved){
                res.status(404).send({message: 'Error cant find the Artist to be removed'});
            }
            else{
                Album.find({artist: artistRemoved._id}).deleteMany((err, albumRemoved) => {
                    if(err){
                        res.status(500).send({message: 'Error cant remove the Artists album selected'});
                    }
                    else{
                        if(!albumRemoved){
                            res.status(404).send({message: 'Error cant find the Artists album to be removed'});
                        }
                        else{
                            Song.find({album: albumRemoved._id}).deleteMany((err, songRemoved) => {
                                if(err){
                                    res.status(500).send({message: 'Error cant remove the Albums song selected'});
                                }
                                else{
                                    if(!songRemoved){
                                        res.status(404).send({message: 'Error cant find the Albums song to be removed'});
                                    }
                                    else{
                                        res.status(200).send({artist: artistRemoved});
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req, res){
    let artistId = req.params.id;
    let file_name = 'Not uploaded...';
    if(req.files){
        let file_path = req.files.image.path;
        let file_split = file_path.split('\\');
        let file_name = file_split[2];
        let ext_split = file_name.split('\.');
        let file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif' || file_ext == 'jpeg'){
            Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdated) => {
                if(!artistUpdated){
                    res.status(404).send({message: 'The artist was not updated.'});
                }
                else{
                    res.status(200).send({user: artistUpdated});
                }
            });
        }
        else{
            res.status(200).send({message: 'Invalid images extension'});
        }
    }
    else{
        res.status(200).send({message: 'No has subido ninguna imagen...'});

    }
}

function getImageFile(req, res){
    let imageFile = req.params.imageFile;
    let path_file = './uploads/artists/'+imageFile;
    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }
        else{
            res.status(500).send({message: 'No existe la imagen'});
        }
    });
}

module.exports = {
    getArtist, saveArtist, getArtists, updateArtist, deleteArtist, uploadImage, getImageFile
};