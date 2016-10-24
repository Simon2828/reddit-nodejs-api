var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;

module.exports = function RedditAPI(conn) {
  return {
    createUser: function(user, callback) {

      // first we have to hash the password...
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else {
          conn.query(
            'INSERT INTO users (username,password, createdAt) VALUES (?, ?, ?)', [user.username, hashedPassword, new Date()],
            function(err, result) {
              if (err) {
                /*
                There can be many reasons why a MySQL query could fail. While many of
                them are unknown, there's a particular error about unique usernames
                which we can be more explicit about!
                */
                if (err.code === 'ER_DUP_ENTRY') {
                  callback(new Error('A user with this username already exists'));
                }
                else {
                  callback(err);
                }
              }
              else {
                /*
                Here we are INSERTing data, so the only useful thing we get back
                is the ID of the newly inserted row. Let's use it to find the user
                and return it
                */
                conn.query(
                  'SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', [result.insertId],
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      /*
                      Finally! Here's what we did so far:
                      1. Hash the user's password
                      2. Insert the user in the DB
                      3a. If the insert fails, report the error to the caller
                      3b. If the insert succeeds, re-fetch the user from the DB
                      4. If the re-fetch succeeds, return the object to the caller
                      */
                      callback(null, result[0]);
                    }
                  }
                );
              }
            }
          );
        }
      });
    },
    createPost: function(post, subredditId, callback) {
       if (!subredditId) {
        callback(new Error('subredditId is required'));
        return;
      }
      conn.query(
        'INSERT INTO posts (userId, subredditId, title, url, createdAt) VALUES (?, ?, ?, ?, ?)', [post.userId, subredditId, post.title, post.url, new Date()],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            conn.query(
              `SELECT posts.id, posts.title, posts.url, posts.userId, posts.createdAt, posts.updatedAt, posts.subredditId 
              FROM posts 
              WHERE id = ?`, [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
//In the reddit.js API, modify the getAllPosts function to return the full subreddit associated with each post. You will 
//have to do an extra JOIN to accomplish this.    
    
    getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      var sortingMethod = options.sortingMethod;
      console.log('options.sortingMethod:  ',sortingMethod);///???? need to add into [] in conn.query??  // need both sortingMethod(s) variables??
      console.log('sortingMethods:  ',sortingMethods.sortingMethod);
      var sortingMethods = {
        'new': 'posts.createdAt DESC',
        top: 'votes.vote desc' //works when tested in mysql but not in demo...check sortingMethods[sortingMethod]....
      };
      // ?????? need to join votes on votes.postId=posts.id too ?????
      conn.query(`
        SELECT posts.id AS postsId, posts.title AS postsTitle, posts.url AS postsUrl, posts.userId AS postsUserId, posts.createdAt AS postsCreatedAt,
        posts.updatedAt AS postsUpdatedAt, posts.subredditId as postSubredditId, users.id AS usersId, users.username AS usersUsername,
        users.createdAt AS usersCreatedAt, users.updatedAt AS usersUpdatedAt, subreddits.name AS subredditName, 
        subreddits.description AS subredditDescription, votes.vote as voteVote
        FROM posts JOIN users on posts.userId=users.id
        JOIN subreddits On posts.subredditId=subreddits.id
        JOIN votes ON votes.userId=users.id
        ORDER BY ?
        LIMIT ? OFFSET ?`, [sortingMethods[sortingMethod], limit, offset],
        function(err, results) {
          //console.log('results[0]:  ',results[0]);
          if (err) {
            callback(err);
          }
          else {
            var originalArray = results;
            var reformattedArray = originalArray.map(function(obj){
            var rObj = {};
              rObj.id = obj.postsId;
              rObj.title = obj.postsTitle;
              rObj.url = obj.postsUrl;
              rObj.createdAt = obj.postsCreatedAt;
              rObj.updatedAt = obj.postsUpdatedAt;
              rObj.userId = obj.postsUserId;
              rObj.user = {
                    id : obj.usersId,
                    username : obj.usersUsername,
                    createdAt : obj.usersCreatedAt,
                    updatedAt : obj.usersUpdatedAt
              };
              rObj.subreddit = {
                        name: obj.subredditName, 
                        description: obj.subredditDescription
                      };
              rObj.vote = obj.voteVote;        
            return rObj;
            });
            results = reformattedArray;
            callback(null, results);
          }
        }
      );
    },
    getAllPostsForUser: function(userId, options, callback) {
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      conn.query(`
        SELECT posts.title as postsTitle, posts.url as postsUrl, users.username as usersUsername, posts.createdAt as postsCreatedAt
        FROM posts JOIN users on users.id=posts.userId
        ORDER BY posts.createdAt DESC
        LIMIT ? OFFSET ?`, [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null,  console.log(results[userId].usersUsername),
                            console.log('\n'),
                            results.forEach(function(post){
                              console.log(post.postsTitle),
                              console.log(post.postsUrl),
                              console.log(post.postsCreatedAt+'\n');
                            })
            );
                      
            
          }
        }
      );
    },
    getSinglePost: function(postId, callback) {
      conn.query(`
        SELECT posts.title as postsTitle, posts.url as postUrl, users.username as userUsername, posts.createdAt as postCreatedAt
        FROM posts JOIN users on users.id=posts.userId
        WHERE posts.id = ?`, [postId], function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results);
          }
        });
    },
    createSubreddit: function(sub, callback) {
      conn.query(`INSERT into subreddits (name, description, createdAt) VALUES(?,?,?)`, [sub.name, sub.description, new Date()],
      function(err, results) {
        if (err) {
          callback(err);
        }
        else {
          callback(null, results);
        }
      });
    },
    
// In the reddit.js API, add a getAllSubreddits(callback) function. It should return the list of all subreddits, ordered by 
// the newly created one first.
    
    getAllSubreddits: function(callback) {
      conn.query(`
      SELECT id, name, description, createdAt
      FROM subreddits
      ORDER BY createdAt DESC
      `, 
      function(err, results){
        if(err) {
          callback(err);
        }
        else {
          callback(null, results);
        }
      });
    },
    createOrUpdateVote: function(vote, callback) {
      if (vote.vote !== 1 && vote.vote !==0 && vote.vote !== -1)  {
        callback(new Error('Not a valid vote'));
        return;
      }
      conn.query(`
      INSERT INTO votes (userId, postId, vote) VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE vote=?
      `, [vote.userId, vote.postId, vote.vote, vote.vote],
      function(err, results){
        if (err) {
          callback(err);
        }
        else {
          callback(null,results);
        }
      });
    }
  }
}
