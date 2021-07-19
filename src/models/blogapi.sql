
CREATE TABLE users(
    userid VARCHAR(11) NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    passwordHash text NOT NULL,
    user_role VARCHAR(25) NOT NULL,
    sessionid text ,
    registeredAt TIMESTAMP NOT NULL
);

CREATE INDEX idx_userid ON users(userid);

CREATE TABLE authors(
    id VARCHAR(11) NOT NULL PRIMARY KEY,
    username VARCHAR(50),
    profile_image BYTEA NULL
);

CREATE TABLE post(
    post_id VARCHAR(11) NOT NULL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    meta_title VARCHAR(100) NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    summary VARCHAR(100) NULL,
    content TEXT NULL DEFAULT NULL,
    published VARCHAR(20) NULL,
    publishedAt TIMESTAMP NOT NULL,
    author_id VARCHAR(11) NULL REFERENCES authors(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE  
);

CREATE TABLE savedpost(
    id VARCHAR(11) NOT NULL PRIMARY KEY,
    userid VARCHAR(11) NOT NULL REFERENCES users(userid)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    post_id VARCHAR(11) NOT NULL REFERENCES post(post_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE 
);

CREATE TABLE category(
    id VARCHAR(11) NOT NULL PRIMARY KEY,
    title VARCHAR(75) NOT NULL,
    meta_title VARCHAR(100) NULL DEFAULT NULL,
    slug VARCHAR(100) NOT NULL
);

CREATE INDEX idx_category_parent on category(id);

CREATE TABLE post_category(
    post_id VARCHAR(11) NOT NULL REFERENCES post(post_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE ,
    category_id VARCHAR(11) NOT NULL REFERENCES category(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE 
);
CREATE INDEX idx_post_post ON post_category(post_id ASC);
CREATE INDEX idx_post_category ON post_category(category_id ASC);

