var  _ = require('underscore');
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
    PRIMARY KEY (id)
  );

  CREATE TABLE Wastepoint (
    id int NOT NULL AUTO_INCREMENT,
    latitude FLOAT(12, 10) NOT NULL,
    longitude FLOAT(12, 10) NOT NULL,
    timestamp datetime NOT NULL,
    uid int,
    PRIMARY KEY (id),
    FOREIGN KEY (uid) REFERENCES User(id)
  );
*/
connection.connect();

exports.getNearbyWastePoints = function(query, callback){
    console.log('getNearbyWastePoints', query);

    var q = {
        latitude: parseFloat(query.latitude),
        longitude: parseFloat(query.longitude)
    };

    var sqlQuery = 'SELECT * FROM Wastepoint';

    console.log('SQL: ', sqlQuery);

    connection.query(sqlQuery, function(err, rows, fields) {
        if (err){
            console.error(err);
        }
        callback(rows, err);
    });
};

exports.getWastePoints = function(query, callback){
    console.log('getWastePoints', query);

    var sqlQuery = 'SELECT * FROM Wastepoint';

    console.log('SQL: ', sqlQuery);

    connection.query(sqlQuery, function(err, rows, fields) {
        if (err){
            console.error(err);
        }
        callback(rows, err);
    });
};

exports.addWastePoint = function(query, callback){
    console.log('addWastePoint', query);

    var obj = {
        latitude: parseFloat(query.latitude, 10),
        longitude: parseFloat(query.longitude, 10),
        timestamp: query.timestamp,
        uid: parseInt(query.uid, 10)
    };

    var values = [
        obj.latitude,
        obj.longitude,
        obj.timestamp,
        obj.uid || 'NULL'
    ];
    values.map(function(value) {
        return connection.escape(value)
    });
    var sqlQuery = 'INSERT INTO Wastepoint (latitude, longitude, timestamp, uid) VALUES (' + values.join(', ') + ')';

    console.log('SQL: ', sqlQuery);

    connection.query(sqlQuery, function(err, rows, fields) {
        if (err){
            console.error(err);
        }
        callback(obj, err);
    });
};

