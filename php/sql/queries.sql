CREATE TABLE users (
    id int NOT NULL AUTO_INCREMENT,
    userGoogleId varchar(255) NOT NULL,
    firstName varchar(255) NOT NULL,
    surName varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    PRIMARY KEY (id)
);