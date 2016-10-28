// //Ex 1:

// var express = require('express');
// var app = express();
// app.set('view engine', 'pug');

// app.get('/hello', function (req, res) {
//   res.send('<h1>Hello World!</h1>');
// });


// //test
// // Exercise 2: A wild query has appeared!
// // Create a web server that can listen to requests for /hello?name=firstName, and respond with some HTML
// // that says <h1>Hello _name_!</h1>. For example, if a client requests /hello?name=John, the server 
// // should respond with <h1>Hello John!</h1>.


// // app.get('/hello', function(req, res){
// //     res.send('<h1>Hello '+req.query.name+'!</h1>');
// // });


// //Ex 2b


// app.get('/hello/:name', function(req, res){
//     res.send('<h1>Hello '+req.params.name+'</h1>');
// });




// app.get('/calculator/:operation', function(req, res) {
//     var operation = req.params.operation;
//     var num1 = parseInt(req.query.num1);
//     var num2 = parseInt(req.query.num2);
//     var add = num1 + num2;
//     var sub = num1 - num2;
//     var mult = num1 * num2;
//     var div = num1 / num2;
//     var solution;

//     switch(operation) {
//         case "add":
//             solution = add;
//             break;
//         case "sub":
//             solution = sub;
//             break;
//         case "mult":
//             solution = mult;
//             break;
//         case "div":
//             solution = div;
//             break;
//         default:
//         res.sendStatus(404);
//     }

//     res.json({
//         "operator": operation,
//         "firstOperand": num1,
//         "secondOperand": num2,
//         "solution": solution
//         }
//      );
// });


// //Ex 4

// var mysql = require('mysql');

// // create a connection to our Cloud9 server
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'simon2828', 
//   password : '',
//   database: 'reddit'
// });

// // load our API and pass it the connection
// var reddit = require('./reddit');
// var redditAPI = reddit(connection);



// app.get('/posts', function(req,res){

//       redditAPI.getAllPosts( {
//       numPerPage: 5, 
//       page:0,
//       sortingMethod: 'top'
//     }, function(err,posts){
//   if (err) {
//     console.log(err);

//   }
//   else {
//     res.render('post-list', {posts: posts});
//       //console.log(posts);
//     // posts.forEach(function(post){
//     //     res.send('<div>'+post+'</div>');
//     // });
// //     var htmlString =   `<div id="contents">
// //                         <h1>List of contents</h1>
// //                         <ul class="contents-list">`;
// //   //posts.forEach () first htmlString below goes in a forEach 
// //     posts.forEach(function(post){
// //         //console.log('here are the posts:',post);
// //         htmlString += `<li class="content-item">
// //       <h2 class="content-item__title">
// //         <a href=${post.url}>${post.title}</a>
// //       </h2>
// //       <p>Created by ${post.user.username}</p>
// //     </li>`;
// //     })


// //     htmlString +=`</ul>
// //                 </div>`;

// //        res.send(htmlString);
//   }

// }
// );

// }
// );

// // Ex 5 and 6


// var bodyParser = require('body-parser');
// var qs = require('qs');

// app.get('/createContent', function(req,res){

//     res.render('create-content');
// // res.send(`<form action="/createContent" method="POST"> 
// //   <div>
// //     <input type="text" name="url" placeholder="Enter a URL to content">
// //   </div>
// //   <div>
// //     <input type="text" name="title" placeholder="Enter the title of your content">
// //   </div>
// //   <button type="submit">Create!</button>
// // </form>`
// //);

// });

// var urlencodedParser = bodyParser.urlencoded({ extended: false });

// // POST /login gets urlencoded bodies
// app.post('/createContent', urlencodedParser, function (req, res) {
//   if (!req.body) return res.sendStatus(400)
//   //res.send('welcome, ' + req.body.title);
//   var userId = 1;
//   var post = {
//     title: req.body.title,
//     url: req.body.url,
//     userId: userId
//   };
//   redditAPI.createPost(post, 4, function(err, post) {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         // part 2: res.send(JSON.stringify(post));
//         // part 3:
//         res.redirect('/posts');
//       }

//     });
// });


// // /* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// // Boilerplate code to start up the web server
// var server = app.listen(process.env.PORT, process.env.IP, function () {
//   var host = server.address().address;
//   var port = server.address().port;

//   console.log('Example app listening at http://%s:%s', host, port);
// });

// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

var app = express();

// Specify the usage of the Pug template engine
app.set('view engine', 'pug');

// Middleware
// This middleware will parse the POST requests coming from an HTML form, and put the result in req.body.  Read the docs for more info!
app.use(bodyParser.urlencoded({
    extended: false
}));

// This middleware will parse the Cookie header from all requests, and put the result in req.cookies.  Read the docs for more info!
app.use(cookieParser());

app.use(function(req, res, next) {
    if (req.cookies.SESSION) {
        redditAPI.getUserFromSessionId(req.cookies.SESSION, function(err, user) {
            if (err) {
                console.log(err);
            }
            else {
                if (user) {
                    //console.log("Adding user value to request: ", user)
                    req.loggedIn = user;
                    //console.log("see?", req.loggedIn)
                }
                next();
            }
        });
    }
    else {
        next();
    }
});

// This middleware will console.log every request to your web server! Read the docs for more info!
app.use(morgan('dev'));



/*
IMPORTANT!!!!!!!!!!!!!!!!!
Before defining our web resources, we will need access to our RedditAPI functions.
You will need to write (or copy) the code to create a connection to your MySQL database here, and import the RedditAPI.
Then, you'll be able to use the API inside your app.get/app.post functions as appropriate.
*/

var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'simon2828',
    password: '',
    database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);



// Resources
app.get('/', function(request, response) {
    /*
    Your job here will be to use the RedditAPI.getAllPosts function to grab the real list of posts.
    */
    redditAPI.getAllPosts({
            numPerPage: 25,
            page: 0,
            sortingMethod: 'new'
        }, function(err, posts) {
            //console.log('post:  ', posts);
            if (err) {
                console.log(err);
            }
            else {
                response.render('post-list', {
                    posts: posts
                });
            }
        }

    );
});


app.get('/login', function(req, res) {
    // code to display login form
    res.render('login.pug');
});

app.post('/login', function(req, res) {
    // code to login a user
    // hint: you'll have to use response.cookie here
    redditAPI.checkLogin(req.body.username, req.body.password, function(err, user) {
        //console.log('user:  ',user);
        if (err) {
            res.status(401).send(err.message);
        }
        else {
            redditAPI.createSession(user.id, function(err, token) {
                console.log('token:  ',token)
                if (err) {
                    res.status(500).send('An error occurred. Please try again later');
                }
                else {
                    res.cookie('SESSION', token);
                    res.redirect('/');
                }
            });
        }
    });
});

app.get('/signup', function(req, res) {
    // code to display signup form
    res.render('register.pug');
});


app.post('/signup', function(req, res) {
    // code to signup a user
    // hint: you'll have to use bcrypt to hash the user's password

    if (!req.body) return res.sendStatus(400);

    redditAPI.createUser(req.body, function(err, user) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/login');
        }
    });


});

app.get('/createpost', function(req, res) {
    redditAPI.getAllSubreddits(function(err, subreddits) {
        if (err) {
            console.log(err);
        }
        else {
            res.render('createpost.pug', {
                subreddits: subreddits
            });
        }
    });

});

app.post('/createpost', function(req, res) {
    if (!req.loggedIn) {
        res.status(401).send('You must be logged in to create content');
    }
    else {
        redditAPI.createPost(req.body, req.loggedIn, function(err, subreddits) {
            // userId is coming back as null currently when creating a new post... use getUserFromSession in reddit.js??
            // how to access subreddit.id in value of createpost.pug? could then put this value into 
            // createPost function in reddit.js. Or go about it a different way, joining subreddits table to posts...or something..
            if (err) {
                console.log(err);
            }
            else {
                res.redirect('/'); // change this to showing subreddits your post is part of?? see how reddit does it...
            }
        });
    }
});


app.post('/vote', function(req, res) {
    console.log('reg.loggedin:',req.loggedIn);
    // code to add an up or down vote for a content+user combination
    //console.log('req.body:  ', req.body);
    if (!req.loggedIn) {
        res.status(401).send('You must be logged in to vote');
    }
    else {
        redditAPI.createOrUpdateVote({
            vote: req.body.vote,
            postId: req.body.postId,
            userId: req.loggedIn.sessionUserId
        }, function(err, vote) {
            if (err) {
                console.log(err);
                res.send('You are not allowed to vote on a post more than once!');
            }
            else {
                //update the vote score/send a res.. look at postlist pug for variables...
                res.redirect('./');
            }
        });
    }
});



// maybe use below for creating subreddit...
// redditAPI.createSubreddit(req.body, function(err, subredditId) {
//     console.log('req.body:  ',req.body);
//     if (err) {
//         console.log(err);
//     }
//     else {
//         redditAPI.createPost(req.body, req.loggedIn, subredditId, function(err, post) {
//             if (err) {
//                 console.log(err);
//             }
//             else {
//                 res.redirect('./'); // change to see your own post??
//             }
//         }); //need to get userId from sql database... 
//         //see higher up in commented out section for eg. of createPost being called.
//         //redirect poster following submit...show them post??
//     }
// })


// Listen
var port = process.env.PORT || 3000;
app.listen(port, function() {
    // This part will only work with Cloud9, and is meant to help you find the URL of your web server :)
    if (process.env.C9_HOSTNAME) {
        console.log('Web server is listening on https://' + process.env.C9_HOSTNAME);
    }
    else {
        console.log('Web server is listening on http://localhost:' + port);
    }
});
