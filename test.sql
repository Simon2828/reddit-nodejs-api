The first step will be to create a subreddits table. Each subreddit should have a unique, auto incrementing id, a name anywhere
from 1 to 30 characters, and an optional description of up to 200 characters. Each sub should also have createdAt and updatedAt
timestamps that you can copy from an existing table. To guarantee the integrity of our data, we should make sure that the name 
column is unique.

Once you figure out the correct CREATE TABLE statement, add it to reddit.sql with a comment.