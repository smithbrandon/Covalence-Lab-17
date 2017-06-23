var path = require('path');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

console.log("Starting web server at localhost:3000");

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'chirper-admin',
    password: 'passwordChirper',
    database: 'Chirper'
});

var clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));
app.use(bodyParser.json());

// //update page
app.get('/chirps/*/update',function(req,res){
    res.sendFile(path.join(clientPath,'update_view.html'))
});

//serve the main page
app.get('/chirp/*', function(req, res){
    res.sendFile(path.join(clientPath,'single_view.html'));
});

app.get('/chirps',function(req,res){
    res.sendFile(path.join(clientPath,'list.html'));
});



//api routes for get and post
app.get('/api/users',function(req, res){
    getUsers()
    .then(function(users){
        res.send(users);
    },function(err){
        console.log(err);
        res.sendStatus(500);
    })
});
app.get('/api/chirps', function (req, res) {
    getChirps()
        .then(function (chirps) {
            res.send(chirps);
        }, function (err) {
            console.log(err);
            res.sendStatus(500);
        });
});
app.route('/api/chirps/:id')
    .get(function (req, res) {
        getChirp(req.params.id)
            .then(function (chirp) {
                res.send(chirp);
            }, function (err) {
                res.sendStatus(500);
            });
    }).delete(function (req, res) {
        deleteChirp(req.params.id)
        .then(function(chirp){
            res.sendStatus(204);
        },function(err){
            res.sendStatus(500);
        })
    }).put(function (req, res) {
        updateChirp(req.body.user, req.body.message)
        .then(function(chirp){
            res.status(204).send(chirp);
        },function(err){
            console.log(err);
            res.sendStatus(500);
        });
    });

app.post('/api/chirps/', function (req, res) {
    insertChirp(req.body.user, req.body.message)
        .then(function (chirp) {
            res.status(201).send(chirp);
        }, function (err) {
            console.log(err);
            res.sendStatus(500);
        });
});

app.listen(3000);

function getChirps() {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                connection.release();
                reject(err);
            } else {
                connection.query("CALL GetChirps();", function (err, resultSets) {
                    if (err) {
                        console.log(err);
                        connection.release();
                        reject(err);
                    } else {
                        connection.release();
                        resolve(resultSets[0]);
                    }
                });
            }
        });
    });
}
function getChirp(id) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                reject(err);
            } else {
                connection.query("CALL getChirp(?);", [id], function (err, resultSets) {
                    if (err) {
                        connection.release();
                        reject(err);
                    } else {
                        connection.release();
                        resolve(resultSets[0]);
                    }
                });
            }
        });
    });
}
function insertChirp(usr, msg) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                reject('first error: ' + err);
            } else {
                connection.query("CALL insertChirp(?,?);", [usr, msg], function (err, resultSets) {
                    if (err) {
                        connection.release();
                        reject('second error: ' + err);
                    } else {
                        connection.release();
                        resolve(resultSets[0]);
                    }
                })
            }
        })
    })
}
function updateChirp(id, msg) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err, connection){
            if(err){
                connection.release();
                reject(err);
            }else{
                connection.query("CALL updateChirp(?,?);",[id,msg],function(err, resultSets){
                    if(err){
                        connection.release();
                        reject(err);
                    }else{
                        connection.release();
                        resolve();
                    }
                })
            }
        })
    })
}
function deleteChirp(id) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err, connection){
            if(err){
                connection.release();
                reject(err);
            }else{
                connection.query("CALL deleteChirp(?);",[id],function(err, resultSets){
                    if(err){
                        connection.release();
                        reject(err);
                    }else{
                        connection.release();
                        resolve();
                    }
                })
            }
        })
    })
}
function getUsers(){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err, connection){
            if(err){
                connection.release();
                reject(err);
            }else{
                connection.query("CALL getUsers()", function(err,resultSets){
                    if(err){
                        connection.release();
                        reject(err);
                    }else{
                        connection.release();
                        resolve(resultSets[0]);
                    }
                });
            }
        });
    });
}