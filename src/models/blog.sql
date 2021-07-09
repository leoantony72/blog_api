CREATE TABLE users(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    passwordHash VARCHAR(32) NOT NULL,
    registeredAt TIMESTAMP NOT NULL,
    intro VARCHAR(50) NULL DEFAULT NULL
);


/*AUTHORS*/
CREATE TABLE authors(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(50),
    profile_image BYTEA NULL
);


/*POST*/
CREATE TABLE post(
    post_id BIGSERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(75) NOT NULL,
    meta_title VARCHAR(100) NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    summary VARCHAR(100) NULL,
    content TEXT NULL DEFAULT NULL,
    published VARCHAR(20) NULL,
    publishedAt TIMESTAMP NOT NULL,
    parent_id BIGINT NULL DEFAULT NULL REFERENCES post(post_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE, 
    author_id BIGINT NULL REFERENCES authors(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE  
);

CREATE INDEX idx_author ON post(author_id);


/*CATEGORY*/
CREATE TABLE category(
    id BIGSERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(75) NOT NULL,
    meta_title VARCHAR(100) NULL DEFAULT NULL,
    slug VARCHAR(100) NOT NULL,
    content TEXT NULL DEFAULT NULL,
    parentId BIGINT NULL DEFAULT NULL REFERENCES category(id)
);

CREATE INDEX idx_category_parent on category(parentId ASC);


/*POST_CATEGORY*/
CREATE TABLE post_category(
    post_id BIGSERIAL NOT NULL REFERENCES post(post_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE ,
    category_id BIGINT NOT NULL REFERENCES category(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE 
);

CREATE INDEX idx_post_post ON post_category(post_id ASC);
CREATE INDEX idx_post_category ON post_category(category_id ASC);

/*Important*/
SELECT * FROM post
JOIN post_category ON post_category.post_id = post.post_id
JOIN category ON category.id = post_category.post_id;
