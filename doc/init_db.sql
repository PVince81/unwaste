CREATE DATABASE unwaste;
CREATE USER 'unwaste'@'localhost' IDENTIFIED BY 'un3W4$13';
GRANT ALL PRIVILEGES ON unwaste.* TO 'unwaste'@'localhost';

USE unwaste;

CREATE TABLE User (
    id int NOT NULL AUTO_INCREMENT,
    login VARCHAR(64) NOT NULL,
    pw VARCHAR(64),
    oauth_provider VARCHAR(16),
    oauth_uid VARCHAR(32),
    oauth_token VARCHAR(64),
    oauth_secret VARCHAR(64),
    PRIMARY KEY (id)
);

CREATE TABLE Wastepoint (
    id int NOT NULL AUTO_INCREMENT,
    latitude FLOAT(12, 10) NOT NULL,
    longitude FLOAT(12, 10) NOT NULL,
    timestamp datetime NOT NULL,
    uid int,
    comment VARCHAR(140),
    img LONGBLOB,
    todo TINYINT(1) DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (uid) REFERENCES User(id)
);
