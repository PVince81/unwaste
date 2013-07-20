var crypto = require('crypto'),
     _ = require('underscore');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'unwaste',
  password : 'un3W4$13',
  database : 'unwaste'
});

/*
  CREATE DATABASE unwaste;
  CREATE USER 'unwaste'@'localhost' IDENTIFIED BY 'un3W4$13';
  GRANT ALL PRIVILEGES ON unwaste.* TO 'unwaste'@'localhost';

  USE unwaste;

  CREATE TABLE User (
    id int NOT NULL AUTO_INCREMENT,
    login VARCHAR(64) NOT NULL,
    pw VARCHAR(64),
    PRIMARY KEY (id)
  );

  CREATE TABLE Wastepoint (
    id int NOT NULL AUTO_INCREMENT,
    latitude FLOAT(12, 10) NOT NULL,
    longitude FLOAT(12, 10) NOT NULL,
    timestamp datetime NOT NULL,
    uid int NOT NULL,
    comment VARCHAR(140),
    img LONGBLOB,
    todo BIT,
    PRIMARY KEY (id),
    FOREIGN KEY (uid) REFERENCES User(id)
  );
*/
connection.connect();

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

    var sqlQuery = 'SELECT * FROM Wastepoint WHERE acos(sin(' + latitude + ') * sin(latitude) + cos(' + latitude + ') * cos(latitude) * cos(longitude - (' + longitude + '))) * ' + planetRadius + ' <= ' + distance + '';

    console.log('SQL: ', sqlQuery);

    connection.query(sqlQuery, function(err, rows, fields) {
        if (err){
            console.error(err);
        }
        callback(rows, err);
    });
};

exports.getWastePoints = function(query, callback) {
    console.log('getWastePoints', query);

    var sqlQuery = 'SELECT latitude, longitude, timestamp, uid, comment, todo FROM Wastepoint';

    console.log('SQL: ', sqlQuery);

    connection.query(sqlQuery, function(err, rows, fields) {
        if (err){
            console.error(err);
        }
        callback(rows, err);
    });
};
exports.getWasteImage = function(query, callback) {
    console.log('getWasteImage', query);
    var obj = {
        uid: query.uid,
        timestamp: query.timestamp
    };

    var values = [obj.uid, obj.timestamp].map(function(value) {
            return connection.escape(value);
    });

    var sqlQuery = 'SELECT (image) FROM Wastepoint WHERE (uid = ' + values[0] + ' AND timestamp = ' + values[1] + ')';
    console.log('SQL: ', sqlQuery);

    connection.query(sqlQuery, function(err, rows, fields) {
        if (err) {
            console.error(err);
        }
        callback(rows, err);
    });
};
exports.addWastePoint = function(query, user, callback){
    console.log('addWastePoint', user, query);
    var obj = {
        latitude: parseFloat(query.latitude, 10),
        longitude: parseFloat(query.longitude, 10),
        timestamp: query.timestamp,
        uid: user.uid,
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
        obj.todo || 'b0'
    ];
    var values = values.map(function(value) {
        return connection.escape(value)
    });
    var sqlQuery = 'INSERT INTO Wastepoint (latitude, longitude, timestamp, uid, comment, img, todo) VALUES (' + values.join(', ') + ')';

    console.log('SQL: ', sqlQuery);

    connection.query(sqlQuery, function(err, rows, fields) {
        if (err){
            console.error(err);
        }
        callback({success : true, id : rows.insertId});
    });
};
exports.markAsDone = function(query, err) {
    var obj = {
        uid : query.uid,
        timestamp : query.timestamp
    };

    var id = connection.escape(obj.id);
    var timestamp = connection.escape(obj.id);

    var sqlQuery = 'UPDATE Wastepoint SET todo = b' + 1 + ' WHERE (uid = ' + uid + ' AND timestamp = ' + timestamp + ')';
    console.log('SQL: ', sqlQuery);

    connection.query(sqlQuery, function(err,rows, fields) {
        if (err) {
            console.error(err);
        }
        callback({success : true})
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
    
    var obj = {
        login: query.login,
        pw: query.pw
    };
    
    var values = [obj.login, encrypt(obj.pw)].map(function(value) {
        return connection.escape(value)
    });
    var sqlQuery = 'INSERT INTO User (login, pw) VALUES (' + values.join(', ') + ')';
    console.log('SQL: ', sqlQuery);

    connection.query(sqlQuery, function(err, rows, fields) {
        if (err) {
            console.error(err);
        }
        else {
            callback({success : true, uid: rows.insertId}, err);
        }
    });
};


exports.authenticate = function(query, callback) {
    console.log('authenticate', query);

    var obj = {
        login: query.login,
        pw : query.pw
    };

    var login = connection.escape(obj.login);
    var safePw = encrypt(obj.pw);
    
    var sqlQuery = 'SELECT login, pw, id from User WHERE login = ' + login
    
    connection.query(sqlQuery, function(err, rows, fields) {
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
};
