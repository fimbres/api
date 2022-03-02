'use strict'

let path = require('path');
let fs = require('fs');
let mongoosePaginate = require('mongoose-pagination');

let Artist = require('../models/artist');
let Album = require('../models/album');
let Song = require('../models/song');

function getSong(req, res) {
    let songID = req.params.id;
    Song.findById(songID).populate({path:'album'}).exec((err,song) => {
        if(err) {
            res.status(500).send({message: 'Error retrieving the song'});
        }
        else{
            if(!song) {
                res.status(500).send({message: 'The song does not exists'});
            }
            else{
                res.status(200).send({song});
            }
        }
    });
}

function saveSong(req, res) {
    let song = new Song();
    let params = req.body;

    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = null;
    song.album = params.album;

    song.save((err, songStored) => {
        if(err){
            res.status(500).send({message:'Error in the server'});
        }
        else{
            if(!songStored){
                res.status(500).send({message: 'Error can not save the song'});
            }
            else{
                res.status(200).send({song: songStored});
            }
        }
    })
}

function getSongs(req, res) {
    let albumID = req.params.album;
    let find;
    if(!albumID){
        find = Song.find({}).sort('number');
    }
    else{
        find = Song.find({album: albumID}).sort('number');
    }
    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec(function(err, songs){
        if(err){
            res.status(500).send({message: 'Error finding the songs'});
        }
        else{
            if(!songs){
                res.status(500).send({message: 'The songs does not exists'});
            }
            else{
                res.status(200).send({songs});
            }
        }
    });
}

function updateSong(req, res) {
    let songID = req.params.id;
    let update = req.body;

    Song.findByIdAndUpdate(songID, update, (err, songUpdated) => {
        if(err){
            res.status(500).send({message: 'Error can not update the song'});
        }
        else{
            if(!songUpdated){
                res.status(500).send({message: 'The song does not exist'});
            }
            else{
                res.status(200).send({song: songUpdated});
            }
        }
    });
}

function deleteSong(req, res) {
    let songID = req.params.id;

    Song.findByIdAndRemove(songID, (err, songDeleted) => {
        if(err){
            res.status(500).send({message: 'Error can not update the song'});
        }
        else{
            if(!songDeleted){
                res.status(500).send({message: 'The song does not exist'});
            }
            else{
                res.status(200).send({song: songDeleted});
            }
        }
    })
}

function uploadFile(req, res){
    let songId = req.params.id;
    let file_name = 'Not uploaded...';
    if(req.files){
        let file_path = req.files.file.path;
        let file_split = file_path.split('\\');
        let file_name = file_split[2];
        let ext_split = file_name.split('\.');
        let file_ext = ext_split[1];

        if(file_ext == 'mp3' || file_ext == 'ogg'){
            Song.findByIdAndUpdate(songId, {file: file_name}, (err, songUpdated) => {
                if(!songUpdated){
                    res.status(404).send({message: 'The song was not updated.'});
                }
                else{
                    res.status(200).send({user: songUpdated});
                }
            });
        }
        else{
            res.status(200).send({message: 'Invalid song extension'});
        }
    }
    else{
        res.status(200).send({message: 'No has subido ninguna cancion...'});

    }
}

function getSongFile(req, res){
    let songFile = req.params.songFile;
    let path_file = './uploads/songs/'+songFile;
    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }
        else{
            res.status(500).send({message: 'No existe la cancion'});
        }
    });
}

module.exports = {
    getSong, saveSong, getSongs, updateSong, deleteSong, uploadFile, getSongFile
};