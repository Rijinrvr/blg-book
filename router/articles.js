const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

let Article = require('../models/article');



router.get('/add', function (req, res) {
    res.render('add', {
        title: 'Add Article'
    })
});

router.post('/add', 
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('author').notEmpty().withMessage('Author is required'),
        body('body').notEmpty().withMessage('Body is required'),
    ],
    function(req, res){
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('add', {
                title: 'Add Article',
                errors: errors.array()
            })
        } 
        else {
            let article = new Article();
            article.title = req.body.title;
            article.author = req.body.author;
            article.body = req.body.body;
            article.save(function(err){
                if(err) {
                    console.log(err);
                    return;
                } 
                else {
                      req.flash('success', 'Article Added')
                      res.redirect('/');
                }
            });
        }
    });

router.get('/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        res.render('article', {
            article: article
        });
    });
});

router.get('/edit/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        res.render('edit',{
            title: "Edit",
            article: article
        })
    })
});
router.post('/edit/:id', function(req, res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}
    Article.updateOne(query, article, function(err){
        if(err) {
            console.log(err);
            return;
        } else {
            req.flash('success', 'Article Updated')
            res.redirect('/');
        }
    });
});

router.delete('/delete/:id', function (req, res) {
    
 let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    let query = {_id:req.params.id};
    Article.remove(query, article,function(err){
        if(err) {
            console.log(err);
        }
        else {
            res.send('Success');
        }
    })
});

module.exports = router;