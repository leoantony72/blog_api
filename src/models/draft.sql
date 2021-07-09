

CREATE TABLE users(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    passwordHash VARCHAR(32) NOT NULL,
    registeredAt TIMESTAMP NOT NULL,
    last_login TIMESTAMP NOT NULL,
    intro VARCHAR(50) NULL DEFAULT NULL
);

CREATE TABLE authors(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(50),
    profile_image BYTEA NULL
);

CREATE TABLE post(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(75) NOT NULL,
    meta_title VARCHAR(100) NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    summary VARCHAR(100) NULL,
    published VARCHAR(20) NULL,
    createdAt TIMESTAMP NOT NULL,
    publishedAt TIMESTAMP NOT NULL,
    content TEXT NULL DEFAULT NULL,
    parent_id BIGINT NULL DEFAULT NULL REFERENCES post(id),
    author_id BIGINT NULL REFERENCES authors(id)
);

CREATE INDEX idx_author ON post(author_id);

/*
CREATE TABLE post_comment(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    published VARCHAR(20) NULL,
    createdAt TIMESTAMP NOT NULL,
    publishedAt TIMESTAMP NOT NULL,
    content TEXT NULL DEFAULT NULL,
    post_id BIGINT NOT NULL REFERENCES post(id),
    parentId BIGINT NULL DEFAULT NULL REFERENCES post_comment(id)
);

CREATE INDEX idx_comment_post ON post_comment(post_id ASC);
CREATE INDEX idx_comment_parent ON post_comment(parentId ASC);
*/


CREATE TABLE category(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(75) NOT NULL,
    meta_title VARCHAR(100) NULL DEFAULT NULL,
    slug VARCHAR(100) NOT NULL,
    content TEXT NULL DEFAULT NULL,
    parentId BIGINT NULL DEFAULT NULL REFERENCES category(id)
);

CREATE INDEX idx_category_parent on category(parentId ASC);

CREATE TABLE post_category(
    post_id BIGSERIAL NOT NULL REFERENCES post(id),
    category_id BIGINT NOT NULL REFERENCES category(id)
);

CREATE INDEX idx_post_post ON post_category(post_id ASC);
CREATE INDEX idx_post_category ON post_category(category_id ASC);



