const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const nodemailer = require('nodemailer');
const session = require('express-session');
const paginate = require('express-paginate');
const { body, validationResult } = require('express-validator');
const flash = require('connect-flash');
const router = express.Router();


mongoose.connect('mongodb://localhost/blog');
let db = mongoose.connection;

//Check for db errors
db.on('error', function(err){
    console.log(err);
});

//Check connection
db.once('open', function(){
    console.log("Connected to mongodb");
})

const app = express();

//bring in model

let Article = require('./models/article');
const bodyParser = require('body-parser');
const { Router } = require('express');

//Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));
app.use(function (req, res, next) {
    if (!req.session.views) {
        req.session.views = {}
    }
    var pathname = req.url
    
    req.session.views[pathname] = (req.session.views[pathname] || 0) + 1
    
    next()
})

//Express messages middleware

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(paginate.middleware(3, 50));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));

app.use(function(req, res, next){
    if (!req.session.username && req.path != '/user/login') {
        res.redirect('/user/login')
    }
    next();
})

app.use(fileUpload())



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async function(req, res){
    const [ results, itemCount ] = await Promise.all([
        Article.find({}).limit(req.query.limit).skip(req.skip),
        Article.count({})
    ]);
    
    const pageCount = Math.ceil(itemCount / req.query.limit);
   
    res.render('index', {
        title: 'Articles',
        articles: results,
        pageCount,
        itemCount,
        pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)
    });
});

app.get('/upload', function(req, res){
    res.sendFile(__dirname + '/upload.html')
});

app.post('/upload', function(req, res){
    if(req.files) {
        console.log(req.files)
        var file = req.files.avatar;
        var filename = file.name;
        console.log(filename);
        
        file.mv('./uploads/'+filename, function(err){
            if (err) {
                console.log(err);
            }
            else {
                res.send('File uploaded');
            }
        })
    }
});



  app.get('/foo', function (req, res, next) {
    res.send('you viewed this page ' + req.session.views['/foo'] + ' times')
  })
   
  app.get('/bar', function (req, res, next) {
    res.send('you viewed this page ' + req.session.views['/bar'] + ' times')
  })

  //Route files

let articles = require('./router/articles');
app.use('/articles', articles);

let users = require('./router/user');
app.use('/user', users);

app.listen(3000, function(){
    console.log('Server started on port 3000...');
})