'use strict'

let path = require('path');
let fs = require('fs');
let mongoosePaginate = require('mongoose-pagination');

let Artist = require('../models/artist');
let Album = require('../models/album');
let Song = require('../models/song');
const album = require('../models/album');

function getAlbum(req, res){
    let albumID = req.params.id;

    Album.findById(albumID).populate({path: 'artist'}).exec((err, album) => {
        if(err){
            res.status(500).send({message: 'Error getting album'});
        }
        else{
            if(!album) {
                res.status(404).send({message: 'The album does not exist'});
            }
            else{
                res.status(200).send({album});
            }
        }
    });
}

function getAlbums(req, res){
    let artistID = req.params.artist;
    let find;
    console.log(artistID);
    if(!artistID){
        find = Album.find({}).sort('title');
    }
    else{
        find = Album.find({artist: artistID}).sort('year');
    }
    find.populate({path: 'artist'}).exec((err, albums) => {
        if(err){
            res.status(500).send({message: 'Error getting albums'});
        }
        else{
            res.status(200).send({albums});
        }
    });
}

function updateAlbum(req, res){
    let albumID = req.params.id;
    let update = req.body;
    album.findByIdAndUpdate(albumID, update, (err, albumUpdated)=>{
        if(err){
            res.status(500).send({message: 'Error can not find the album'});
        }
        else{
            if(!albumUpdated){
                res.status(404).send({message: 'The album does not exist'});
            }
            else{
                res.status(200).send({album: albumUpdated});
            }
        }
    });
}

function saveAlbum(req, res){
    let album = new Album();
    let params = req.body;
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;

    album.save((err, albumStored) => {
        if(err){
            
            res.status(500).send({message: 'Error saving album'});
        }
        else{
            if(!albumStored){
                res.status(500).send({message: 'Error saving album'});
            }
            else{
                res.status(200).send({album: albumStored});
            }
        }
    });
}

function deleteAlbum(req, res){
    let albumID = req.params.id;
    Album.findByIdAndDelete(albumID,(err, albumRemoved) => {
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
                            res.status(200).send({album: albumRemoved});
                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req, res){
    let albumId = req.params.id;
    let file_name = 'Not uploaded...';
    if(req.files){
        let file_path = req.files.image.path;
        let file_split = file_path.split('\\');
        let file_name = file_split[2];
        let ext_split = file_name.split('\.');
        let file_ext = ext_split[1];
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif' || file_ext == 'jpeg'){
            Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdated) => {
                if(!albumUpdated){
                    res.status(404).send({message: 'The album was not updated.'});
                }
                else{
                    res.status(200).send({album: albumUpdated});
                }
            });
        }
        else{
            res.status(200).send({message: 'Invalid image extension'});
        }
    }
    else{
        res.status(200).send({message: 'No has subido ninguna imagen...'});

    }
}

function getImageFile(req, res){
    let imageFile = req.params.imageFile;
    let path_file = './uploads/albums/'+imageFile;
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
    getAlbum, saveAlbum, getAlbums, updateAlbum, deleteAlbum, uploadImage, getImageFile
};