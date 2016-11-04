// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'simon2828', 
  password : '',
  database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);

//It's request time!
// redditAPI.createUser({
//   username: 'hello8',
//   password: 'xxx'
// }, function(err, user) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     redditAPI.createPost({
//       title: 'hi reddit!',
//       url: 'https://www.reddit.com',
//       userId: user.id
//     }, function(err, post) {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         console.log(post);
//       }
//     });
//   }
// });

// for (var i=0; i<=7; i++) {

    // redditAPI.createPost({
    //   title: 'hi reddit!',  //+i for for loop
    //   url: 'https://www.reddit.com',
    //   userId: i+5  // this needs to change if tested again...needs to equal posts.id
    // }, 4, function(err, post) {
    //   if (err) {
    //     console.log(err);
    //   }
    //   else {
    //     console.log(post);
    //   }
      
    // });
// }
// redditAPI.getAllPosts(
//   {
//     numPerPage: 5, 
//     page:0,
//     sortingMethod: 'new'
//   },

// function(err,posts){
//   if (err) {
//     console.log(err);
   
//   }
//   else {
//     console.log(posts);
        
//   }
// connection.end();
    
// });

// redditAPI.getAllPostsForUser(8, {numPerPage: 10, page:0}, function(err,posts){
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(JSON.stringify(posts, null, 4));
//   }
//   connection.end();
// });

// Currently there is no way to retrieve a single post by its ID. This would be important for eventually displaying this data
//on a webpage. Create this function, and make it return a single post, without array.

// redditAPI.getSinglePost(6, function(err,post){
//     if (err) {
//       console.log(err);
//     }
//     else {
//       console.log(JSON.stringify(post, null, 4));
//     }
//     connection.end();
// });

// redditAPI.createSubreddit({name: 'football', description: 'what a game'}, 
//   function(err, post) {
//     if (err) {
//       console.log(err);
//     }
//     else {
//       console.log(post);
//     }
//     connection.end();
//   }
// );

// redditAPI.getAllSubreddits(
//   function(err, posts) {
//     if (err) {
//       console.log(err);
//     }
//     else {
//       console.log(posts);
//     }
//   }
//   );
// for (var i=22, j=8; i<=29, j<=12; i++, j++) {
// redditAPI.createOrUpdateVote({postId:i, userId:j, vote:1}, 
// function(err, vote){
//   if (err) {
//     console.log(err);
//   }
//   else {
//     console.log(vote);
//   }
// });
// }