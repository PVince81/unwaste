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
  GRANT ALL PRIVILEGES ON unwaste.* TO 'unwaste'@'localhost'

  USE unwaste;

  CREATE TABLE wastepoint (
    id int NOT NULL AUTO_INCREMENT,
    latitude FLOAT(12, 10) NOT NULL,
    longitude FLOAT(12, 10) NOT NULL,
    timestamp datetime NOT NULL,
    PRIMARY KEY (id)
  );
*/

exports.addWastePoint = function(query, callback){
    console.log('addWastePoint', query);

    var values = [
        query.latitude,
        query.longitude,
        query.timestamp
    ];
    connection.connect();
    var sqlQuery = 'INSERT INTO wastepoint (latitude, longitude, timestamp) VALUES (' + values.join(', ') + ')';

    console.log('SQL: ', sqlQuery);

    connection.query(sqlQuery, function(err, rows, fields) {
        if (err){
            console.error(err);
        }
        connection.end();
        callback();
    });
};
