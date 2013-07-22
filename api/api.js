var crypto = require('crypto'),
    _ = require('underscore'),
    config = require('../settings.json');

var mysql      = require('mysql');
var pool = mysql.createPool({
    host     : config.db.host,
    user     : config.db.user,
    password : config.db.password,
    database : config.db.database
});

exports.getNearbyWastePoints = function(query, callback){
    console.log('getNearbyWastePoints', query);
    // distance in meters
    var distance = parseFloat(query.distance) || 100,
        latitude = parseFloat(query.latitude),
        longitude = parseFloat(query.longitude),
        planetRadius = 6371; // earth radius

    if (distance > 400){
        distance = 400;
    }

    // convert to kilometers
    distance = distance / 1000;

    var sqlQuery = 'SELECT latitude, longitude, timestamp, uid, comment, todo FROM Wastepoint WHERE acos(sin(' + latitude + ') * sin(latitude) + cos(' + latitude + ') * cos(latitude) * cos(longitude - (' + longitude + '))) * ' + planetRadius + ' <= ' + distance + '';

    console.log('SQL: ', sqlQuery);

    
    pool.getConnection(function(err, connection){
        if (err){
            console.error(err);
            callback(null, err);
            return;
        }
        connection.query(sqlQuery, function(err, rows, fields) {
            connection.end();
            if (err){
                console.error(err);
            }
            callback(rows, err);
        });
    });
};

exports.getWastePoints = function(query, callback) {
    console.log('getWastePoints', query);

    var sqlQuery = 'SELECT id, latitude, longitude, timestamp, uid, comment, todo FROM Wastepoint WHERE todo = 1';

    console.log('SQL: ', sqlQuery);

    pool.getConnection(function(err, connection){
        if (err){
            console.error(err);
            callback(null, err);
            return;
        }
        connection.query(sqlQuery, function(err, rows, fields) {
            connection.end();
            if (err){
                console.error(err);
            }
            callback(rows, err);
        });
    });
};
exports.getWastePoint = function(query, callback) {
    console.log('getWastePoint', query);

    pool.getConnection(function(err, connection){
        if (err){
            console.error(err);
            callback(null, err);
            return;
        }
        var obj = {
            id: query.id
        };
        id = connection.escape(obj.id);
        var sqlQuery = 'SELECT id, latitude, longitude, timestamp, uid, comment, todo FROM Wastepoint WHERE id = ' + id;

        console.log('SQL: ', sqlQuery);
        connection.query(sqlQuery, function(err, rows, fields) {
            if (err){
                console.error(err);
                err({err:err});
                return;
            }
            if (!rows.length){
                err({err: 'Not found', statusCode: 404});
                return;
            }

            var point = rows[0];

            // user select
            if (point.uid){
                connection.query('SELECT login FROM User WHERE id = ' + rows[0].uid, function(err, userRows, fields){
                    connection.end();
                    if (err){
                        console.error(err);
                        callback(null, {err:err});
                        return;
                    }
                    var point = rows[0];
                    point.login = userRows[0].login;
                    callback(point, err);
                });
            }
            else{
                connection.end();
                point.login = null;
                callback(point, err);
            }
        });
    });
};
exports.getWastePointImage = function(query, callback) {
    console.log('getWasteImage', query);

    pool.getConnection(function(err, connection){
        var obj = {
            id: query.id,
        };

        id = connection.escape(obj.id);

        var sqlQuery = 'SELECT (img) FROM Wastepoint WHERE id = ' + id;
        console.log('SQL: ', sqlQuery);
        if (err){
            console.error(err);
            callback(null, err);
            return;
        }
        connection.query(sqlQuery, function(err, rows, fields) {
            connection.end();
            if (err) {
                console.error(err);
            }
            callback(rows, err);
        });
    });
};
exports.addWastePoint = function(req, user, callback){
    var query = req.body;
    console.log('addWastePoint', user);

    pool.getConnection(function(err, connection){
        var obj = {
            latitude: parseFloat(query.latitude, 10),
            longitude: parseFloat(query.longitude, 10),
            timestamp: query.timestamp,
            uid: user? user.uid : null,
            comment: query.comment,
            img : query.img,
            todo : query.todo
        };

        var values = [
            obj.latitude,
            obj.longitude,
            obj.timestamp,
            obj.uid,
            obj.comment,
            obj.img,
            obj.todo?1:0
        ];
        values = values.map(function(value) {
            return connection.escape(value)
        });

        var sqlQuery = 'INSERT INTO Wastepoint (latitude, longitude, timestamp, uid, comment, img, todo) VALUES (' + values.join(', ') + ')';

        console.log('SQL: ' + sqlQuery.substr(0, 256));
        if (err){
            console.error(err);
            callback(null, err);
            return;
        }
        connection.query(sqlQuery, function(err, rows, fields) {
            connection.end();
            if (err){
                console.error(err);
            }
            callback({success : true, id : rows.insertId});
        });
    });
};
exports.markAsDone = function(query, callback, err) {
    var spotId = parseInt(query.id, 10);
    if (!spotId){
        if (err){
            err('No id specified !');
            return;
        }
    }

    var sqlQuery = 'UPDATE Wastepoint SET todo = 0 WHERE (id = ' + spotId + ')';
    console.log('SQL: ', sqlQuery);

    pool.getConnection(function(err, connection){
        if (err){
            console.error(err);
            callback(null, err);
            return;
        }
        connection.query(sqlQuery, function(err,rows, fields) {
            connection.end();
            if (err) {
                console.error(err);
            }
            callback({success : true})
        });
    });
};
encrypt = function(login, pw) {
    var shasum = crypto.createHash('sha1'),
        SALT = 'KJAHSLKJHLAKHUIW';

    shasum.update(login + SALT + pw);
    return shasum.digest('hex');
};

exports.register = function(query, callback) {
    console.log('register', query);

    pool.getConnection(function(err, connection){
        var obj = {
            login: query.login,
            pw: query.pw
        };
        
        var values = [obj.login, encrypt(obj.pw)].map(function(value) {
            return connection.escape(value)
        });
        var sqlQuery = 'INSERT INTO User (login, pw) VALUES (' + values.join(', ') + ')';
        console.log('SQL: ', sqlQuery);
        if (err){
            console.error(err);
            callback(null, err);
            return;
        }
        connection.query(sqlQuery, function(err, rows, fields) {
            connection.end();
            if (err) {
                console.error(err);
            }
            else {
                callback({success : true, uid: rows.insertId}, err);
            }
        });
    });
};


exports.authenticate = function(query, callback) {
    console.log('authenticate', query);

    var obj = {
        login: query.login,
        pw : query.pw
    };

    pool.getConnection(function(err, connection){
        if (err){
            console.error(err);
            callback(null, err);
            return;
        }
        var login = connection.escape(obj.login);
        var safePw = encrypt(obj.pw);
        
        var sqlQuery = 'SELECT login, pw, id from User WHERE oauth_provider IS NULL AND login = ' + login
        
        connection.query(sqlQuery, function(err, rows, fields) {
            connection.end();
            if (err) {
                console.error(err);
            }
            else if (rows.length > 0) {
                var remote = rows[0]
                if (safePw === remote.pw) {
                    console.log('Passwords match');
                    var success = {
                        success : true,
                        uid : remote.id
                    };
                    callback(success);
                }
                else {
                    console.log('Wrong password');
                    var failure = {
                        success : false,
                        error : 'wrong password'
                    };
                    callback(failure);
                }
            }
            else {
                console.log('User does not exist');
                var failure = {
                    success : false,
                    error : 'unknown user'
                };
                callback(failure);
            }
        });
    });
};

exports.getUserById = function(id, callback){
    console.log('API: getUserById ', id);
    pool.getConnection(function(err, connection){
        if (err){
            console.error(err);
            callback(null, err);
            return;
        }
        var sqlQuery = 'SELECT id, login from User WHERE id = ' + connection.escape(id);
        connection.query(sqlQuery, function(err, rows){
            connection.end();
            if (rows && rows.length > 0){
                console.log('Found user: ', rows[0]);
                callback(rows[0]);
                return;
            }
            callback(null);
        });
    });
}


exports.findOrCreateUserOAuth = function(options, callback){
    console.log('Authenticating user ' + options.oauthUserId + ' with options ', options);
    pool.getConnection(function(err, connection){
        if (err){
            console.error(err);
            callback(null, err);
            return;
        }
        // TODO: update tokens first, and use update call error as sign
        // whether the use existed or not
        // The tokens might change if the user blocked the app and allowed it again
        var sqlQuery = 'SELECT id, login from User WHERE oauth_uid = ' + connection.escape(options.oauthUserId) +
            ' AND oauth_provider = ' + connection.escape(options.oauthProvider);
        console.log('SQL: ', sqlQuery);
        connection.query(sqlQuery, function(err, rows){
            if (rows && rows.length > 0){
                connection.end();
                console.log('Found user: ', rows[0]);
                callback(rows[0]);
                return;
            }

            // register user
            console.log('User not found, creating one');
            var values = _.map([
                options.login,
                options.oauthProvider,
                options.oauthUserId + '',
                options.oauthToken,
                options.oauthSecret
            ], function(value){
                return connection.escape(value);
            });

            sqlQuery = 'INSERT INTO User (login, oauth_provider, oauth_uid, oauth_token, oauth_secret)' +
                    ' VALUES (' + values.join(' ,') + ')';
            console.log('SQL: ', sqlQuery);
            connection.query(sqlQuery,
                function(err, rows){
                    connection.end();
                    if (err){
                        console.error('Insert user failed ', err);
                        callback(null, err);
                        return;
                    }
                    console.log('New user created with id: ', rows.insertId);
                    callback({uid: rows.insertId}, err);
                });
        });
    });
}

