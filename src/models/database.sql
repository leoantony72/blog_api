
//DRAFT

CREATE TABLE users(
    user_id BIGSERIAL NOT NULL PRIMARY KEY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    age INT NOT NULL,
    profile_image BYTEA 
);

CREATE TABLE admin_users(
    admin_id BIGSERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    user_password VARCHAR(50) NOT NULL
);

CREATE TABLE blog_post(
    post_id BIGSERIAL NOT NULL PRIMARY KEY,
    post_title TEXT NOT NULL,
    post_description TEXT NOT NULL,
    post_body TEXT NOT NULL,
    post_A_image BYTEA,
    post_B_image BYTEA,
    post_C_image BYTEA,
    post_D_image BYTEA,
    post_author BIGINT REFERENCES admin_users(admin_id)
);

CREATE TABLE saved_post (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    user__id BIGINT REFERENCES users(user_id)
);