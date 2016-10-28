var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;
var secureRandom = require('secure-random');

function createSessionToken() {
  return secureRandom.randomArray(100).map(code => code.toString(36)).join('');
}

module.exports = function RedditAPI(conn) {
  return {
    createSession: function(userId, callback) {
      var token = createSessionToken();
      conn.query('INSERT INTO sessions SET userId = ?, token = ?', [userId, token], function(err, result){
        if (err) {
          callback(err);
        }  
        else {
          callback(null, token);
        }
        
      });
    },
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
    checkLogin: function(user, pass, callback) {
      conn.query('SELECT * FROM users WHERE username = ?', [user], function(err, result) {
        if (err) {
          callback(err);
        }
        else {
          if (result.length === 0) {
            callback(new Error('username or password incorrect')); // in this case the user does not exists
          }
          else {
            var user = result[0];
            var actualHashedPassword = user.password;
            bcrypt.compare(pass, actualHashedPassword, function(err, result) {
              if (result === true) { // let's be extra safe here
                callback(null, user);
              }
              else {
                callback(new Error('username or password incorrect')); // in this case the password is wrong, but we reply with the same error
              }
            });
          }
        }
      });
    },
    createPost: function(post, loggedIn, callback) {
      //console.log('loggedIn:  ',loggedIn[0].sessionsUserId);
      // could include a subredditId in parameters above...
      // if (!subredditId) {
      //   callback(new Error('subredditId is required'));
      //   return;
      // }
      conn.query(
        `INSERT INTO posts (userId, title, url, createdAt) VALUES (?, ?, ?, ?)
        `, [loggedIn[0].sessionsUserId, post.title, post.url, new Date()],
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
    getUserFromSessionId: function(sessionCookie, callback) {
      //console.log('sessionCookie:  ',sessionCookie);
      conn.query(`
      SELECT sessions.userId as sessionUserId, sessions.token as sessionToken, users.id as userId, users.username as userUsername
      FROM sessions 
      JOIN users ON sessions.userId=users.id
      WHERE sessions.token=?
      `,[sessionCookie], 
      function(err, user){
        console.log('getUserFromSess user:',user);
        if(err) {
          callback(err);
        }
        else {
          var userObj = user[0];
          console.log(userObj);
          callback(null, userObj);
        }
      })
    },
    getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
   
      
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      var sortingMethod = options.sortingMethod;
      var sort = {
        new: 'posts.createdAt',
        
      };
      //console.log('sort.sortingMethod...',sort.sortingMethod);
      
      // console.log('sortingMethod:  ',sortingMethod);
      
      // var sortingMethods = {
      //   new: 'posts.createdAt',
      //   top: 'sum(votes.vote)',
      //   hot: 'SUM(votes.vote)/(NOW() - posts.createdAt)'
      // };
      // console.log('sortingMethods:  ',sortingMethods[sortingMethod]);

      conn.query(`
        SELECT posts.id AS postsId, posts.title AS postsTitle, posts.url AS postsUrl, posts.userId AS postsUserId, posts.createdAt AS postsCreatedAt,
        posts.updatedAt AS postsUpdatedAt, posts.subredditId as postSubredditId, users.id AS usersId, users.username AS usersUsername,
        users.createdAt AS usersCreatedAt, users.updatedAt AS usersUpdatedAt, subreddits.name AS subredditName, 
        subreddits.description AS subredditDescription, votes.vote as voteVote,
        sum(votes.vote) as top,
        posts.createdAt as new
        FROM posts JOIN users on posts.userId=users.id
        LEFT JOIN subreddits On posts.subredditId=subreddits.id
        LEFT JOIN votes ON votes.postId=posts.id
        GROUP BY posts.id
        ORDER BY ?? DESC
        LIMIT ? OFFSET ?`, [sort.sortingMethod,limit, offset],  //sort.sortingmethod as first var for order by ? -does not work, putting posts.createdAt in query does..?
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
            return rObj; //something going wrong with the object createdAt
            });
            results = reformattedArray;
            callback(null, results);
          }
        }
      );
    },
    testFunction: function() {
      console.log('It works');
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
      conn.query(`
      INSERT into subreddits (name, description, createdAt) VALUES(?,?,?)`, [sub.subreddit, sub.url, new Date()], 
      function(err, subredditId) {
        if (err) {
          callback(err);
        }
        else {
          callback(null, subredditId);
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
      if (vote.vote !== '1' && vote.vote !== '0' && vote.vote !== '-1')  {
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
