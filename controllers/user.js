'use strict'

let fs = require('fs');
let path = require('path');
var bcrypt = require('bcrypt-nodejs');
let res = require('express/lib/response');
var User = require('../models/user');
let jwt = require('../services/jwt');

function pruebas(req, res) {
    res.status(200).send({message: 'probando controlador de usuario'});
}

function saveUser(req, res) {
    var user = new User();
    var params = req.body;

    user.name = params.name;
    user.username = params.username;
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.image = 'null';

    User.findOne({email: user.email }, (err, userFound) => {
        if(err){
            res.status(404).send({message: 'Error in the petition'});
        }
        else{
            if(!userFound){
                if(params.password){
                    bcrypt.hash(params.password, null, null, function(err,hash) {
                        user.password = hash;
                        if(user.name != null &&user.username != null && user.email!=null){
                            user.save((err, userStored) => {
                                if(err){
                                    console.log("aqui");
                                    res.status(500).send({message:'The user has not been saved.'});
                                }
                                else{
                                    if(!userStored){
                                        console.log("aqui tambien");
                                        res.status(500).send({message: 'The user has not been saved.'});
                                    }
                                    else{
                                        res.status(200).send({user: userStored});
                                    }
                                }
                            });
                        }
                        else{
                            res.status(500).send({message: 'All the data is required'});
                        }
                    });
                }
                else{
                    res.status(500).send({message: 'Introduce la contraseña'});
                }
            }
            else{
                res.status(404).send({message: 'The Email is already in use'});
            }
        }
    });
}

function loginUser(req, res){
    let params = req.body;
    let email = params.email;
    let password = params.password;
    User.findOne({email: email }, (err, user) => {
        if(err){
            res.status(404).send({message: 'Error in the petition'});
        }
        else{
            if(!user){
                res.status(404).send({message: 'The User doesnt exist'});
            }
            else{
                bcrypt.compare(password, user.password, function(err, check){
                    if(check && !err){
                        if(true){ //params.gethash
                            res.status(200).send({ token: jwt.createToken(user), user: user});
                        }
                        else{
                            res.status(500).send({user});
                        }
                    }
                    else{
                        res.status(500).send({message: 'Impossible to log in.'});
                    }
                });
            }
        }
    });
}

function updateUser(req, res){
    let userID = req.params.id;
    let update = req.body;

    if(userID != req.user.sub){
        res.status(404).send({message: 'You are not allowed to update this user.'});
    }
    if(update.password){
        bcrypt.hash(update.password, null, null, function(err,hash) {
            update.password = hash;
            if(update.name != null &&update.username != null && update.email!=null){
                User.findByIdAndUpdate(userID, update, (err, userUpdated) => {
                    if(err){
                        res.status(500).send({message: 'Error'});
                    }
                    else{
                        if(!userUpdated){
                            res.status(404).send({message: 'The user was not updated.'});
                        }
                        else{
                            res.status(200).send({user: userUpdated});
                        }
                    }
                });
            }
            else{
                res.status(500).send({message: 'All the data is required'});
            }
        });
    }
    else{
        res.status(500).send({message: 'Password is required'});
    }
}

function uploadImage(req, res){
    let userID = req.params.id;
    let file_name = 'No Subido...';
    if(req.files){
        let file_path = req.files.image.path;
        let file_split = file_path.split('\\');
        let file_name = file_split[2];
        let ext_split = file_name.split('\.');
        let file_ext = ext_split[1];
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif' || file_ext == 'jpeg'){
            User.findByIdAndUpdate(userID, {image: file_name}, (err, userUpdated) => {
                if(!userUpdated){
                    res.status(404).send({message: 'The user was not updated.'});
                }
                else{
                    res.status(200).send({image: file_name, user: userUpdated});
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
    let path_file = './uploads/users/'+imageFile;
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
    pruebas, saveUser, loginUser, updateUser, uploadImage, getImageFile
};