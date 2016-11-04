//Ex 1:

var express = require('express');
var app = express();
app.set('view engine', 'pug');

app.get('/hello', function (req, res) {
  res.send('<h1>Hello World!</h1>');
});


//test
// Exercise 2: A wild query has appeared!
// Create a web server that can listen to requests for /hello?name=firstName, and respond with some HTML
// that says <h1>Hello _name_!</h1>. For example, if a client requests /hello?name=John, the server 
// should respond with <h1>Hello John!</h1>.


// app.get('/hello', function(req, res){
//     res.send('<h1>Hello '+req.query.name+'!</h1>');
// });


//Ex 2b


app.get('/hello/:name', function(req, res){
    res.send('<h1>Hello '+req.params.name+'</h1>');
});




app.get('/calculator/:operation', function(req, res) {
    var operation = req.params.operation;
    var num1 = parseInt(req.query.num1);
    var num2 = parseInt(req.query.num2);
    var add = num1 + num2;
    var sub = num1 - num2;
    var mult = num1 * num2;
    var div = num1 / num2;
    var solution;

    switch(operation) {
        case "add":
            solution = add;
            break;
        case "sub":
            solution = sub;
            break;
        case "mult":
            solution = mult;
            break;
        case "div":
            solution = div;
            break;
        default:
        res.sendStatus(404);
    }

    res.json({
        "operator": operation,
        "firstOperand": num1,
        "secondOperand": num2,
        "solution": solution
        }
     );
});


//Ex 4

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



app.get('/posts', function(req,res){

      redditAPI.getAllPosts( {
      numPerPage: 5, 
      page:0,
      sortingMethod: 'top'
    }, function(err,posts){
  if (err) {
    console.log(err);

  }
  else {
    res.render('post-list', {posts: posts});
      //console.log(posts);
    // posts.forEach(function(post){
    //     res.send('<div>'+post+'</div>');
    // });
//     var htmlString =   `<div id="contents">
//                         <h1>List of contents</h1>
//                         <ul class="contents-list">`;
//   //posts.forEach () first htmlString below goes in a forEach 
//     posts.forEach(function(post){
//         //console.log('here are the posts:',post);
//         htmlString += `<li class="content-item">
//       <h2 class="content-item__title">
//         <a href=${post.url}>${post.title}</a>
//       </h2>
//       <p>Created by ${post.user.username}</p>
//     </li>`;
//     })


//     htmlString +=`</ul>
//                 </div>`;

//        res.send(htmlString);
  }

}
);

}
);

// Ex 5 and 6


var bodyParser = require('body-parser');
var qs = require('qs');

app.get('/createContent', function(req,res){

    res.render('create-content');
// res.send(`<form action="/createContent" method="POST"> 
//   <div>
//     <input type="text" name="url" placeholder="Enter a URL to content">
//   </div>
//   <div>
//     <input type="text" name="title" placeholder="Enter the title of your content">
//   </div>
//   <button type="submit">Create!</button>
// </form>`
//);

});

var urlencodedParser = bodyParser.urlencoded({ extended: false });

// POST /login gets urlencoded bodies
app.post('/createContent', urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  //res.send('welcome, ' + req.body.title);
  var userId = 1;
  var post = {
    title: req.body.title,
    url: req.body.url,
    userId: userId
  };
  redditAPI.createPost(post, 4, function(err, post) {
      if (err) {
        console.log(err);
      }
      else {
        // part 2: res.send(JSON.stringify(post));
        // part 3:
        res.redirect('/posts');
      }

    });
});


// /* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
