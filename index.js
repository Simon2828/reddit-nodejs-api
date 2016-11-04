/*global path*/
// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

var app = express();

// Specify the usage of the Pug template engine
app.set('view engine', 'pug');

app.locals.title="reddit site";
// Middleware
// This middleware will parse the POST requests coming from an HTML form, and put the result in req.body.  Read the docs for more info!
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use('/files', express.static('static_files'));

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
            console.log('post:  ', posts);
            if (err) {
                console.log(err);
            }
            else {
                response.render('post-list', {title:"Welcome to Reddit Clone", posts: posts}
                );
            }
        }

    );
});


app.get('/login', function(req, res) {
    // code to display login form
    res.render('login.pug', {title: 'login'});
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
    res.render('register.pug', {title: 'signup'});
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
    redditAPI.getSubredditTitles(function(err, subreddits) {
        if (err) {
            console.log(err);
        }
        else {
            res.render('createpost.pug', {title: 'create post',
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

app.get('/r/:subreddit', function(req, res) {
    //console.log('req.params.subreddit: ',req.params.subreddit);
    redditAPI.getAllSubreddits(req.params.subreddit, function(err,subreddits){
        if (err) {
            console.log(err);
        }
        else {
            res.render('subreddits', {title: 'subreddits', subreddits:subreddits});
        }
    });

});

app.get('/suggestTitle', function(req, res) {
    
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
