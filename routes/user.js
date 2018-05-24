const express = require("express");
const router = express.Router();
const Artist = require("../models/artist");
const Rating = require("../models/rating");
const User = require("../models/user");
const middleware = require("../middleware");

//Ratings by User ID
//==================
router.get('/:id/ratings', function(req, res){
    User.findById(req.params.id, function(err, user){
        if (err) {
            res.send(err);
        }
        Rating.find({ 'reviewer.id' : req.params.id }, function(err, rating){
            if (err) {
                res.send(err);
            }
             res.render('users/ratings', {ratings:rating});
        });
    });
});

//Get Artists Not Yet Rated by User
//=================================
router.get('/:id/inbox', function(req, res){
    User.findById(req.params.id, function(err, user){
        if (err) {
            console.log(err)
            res.send(err);
        }
        console.log(user);
        Artist.find({}, function(err, allArtists){
            if(err){
                console.log(err);
            } else {
                console.log(user);
                console.log(allArtists);
                res.render("users/inbox", {user:user, artists:allArtists});
            }
        })
        
    });
});


//Get Artists Submmited by User
//=============================
router.get('/:id/artists', function(req, res){
    User.findById(req.params.id, function(err, user){
        if (err) {
            res.send(err);
        }
        Artist.find({ 'author.id' : req.params.id }, function(err, myArtists){
            if (err) {
                res.send(err);
            }
            res.render('users/artists', {artists:myArtists});
        });
    });
});



//Destroy Artists


module.exports = router;