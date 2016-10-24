-- -- This creates the users table. The username field is constrained to unique
-- -- values only, by using a UNIQUE KEY on that column
-- CREATE TABLE `users` (
--   `id` INT(11) NOT NULL AUTO_INCREMENT,
--   `username` VARCHAR(50) NOT NULL,
--   `password` VARCHAR(60) NOT NULL, -- why 60??? ask me :)
--   `createdAt` DATETIME NOT NULL,
--   `updatedAt` DATETIME NOT NULL,
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `username` (`username`)
-- );

-- -- This creates the posts table. The userId column references the id column of
-- -- users. If a user is deleted, the corresponding posts' userIds will be set NULL.
-- CREATE TABLE `posts` (
--   `id` int(11) NOT NULL AUTO_INCREMENT,
--   `title` varchar(300) DEFAULT NULL,
--   `url` varchar(2000) DEFAULT NULL,
--   `userId` int(11) DEFAULT NULL,
--   `createdAt` DATETIME NOT NULL,
--   `updatedAt` DATETIME NOT NULL,
--   PRIMARY KEY (`id`),
--   KEY `userId` (`userId`), -- why did we add this here? ask me :)
--   CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
-- );


-- -- -- The subredditId references the id column of subreddits. If a subreddit is deleted, the corresponding subredditIds will be
-- -- -- set to null.
-- ALTER TABLE `posts`
-- ADD COLUMN `subredditId`int(11) DEFAULT NULL
-- ADD CONSTRAINT `subreddits_idfk_1` FOREIGN KEY (`subredditId`) REFERENCES `subreddits` (`id`) ON DELETE SET NULL;

-- -- This creates the subreddits table. The name is constrained to
-- -- unique values only.
-- create table `subreddits`(
--     `id` int(11) not null auto_increment primary key,
--     `name` varchar(30),
--     `description` varchar(200),
--     `createdAt` datetime not null,
--     `updatedAt` datetime not null,
--     unique key `name` (`name`)
-- );

-- CREATE TABLE votes (
--   userId INT NOT NULL,
--   postId INT NOT NULL,
--   vote TINYINT,
--   createdAt DATETIME,
--   updatedAt DATETIME,
--   CONSTRAINT `votes_idfk_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
--   CONSTRAINT `votes_idfk_posts` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`),
--   PRIMARY KEY (userId, postId)
-- );


