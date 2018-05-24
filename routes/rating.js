const express = require("express");
const router = express.Router();
const Artist = require("../models/artist");
const Rating = require("../models/rating");
const User = require("../models/user");
const middleware = require("../middleware");
const d3 = require('d3');

//Get - Get all ratings
 router.get('/', function(req, res){
    Rating.find({}, function(err, allRatings){
     if(err){
     res.render('/landing');
//          req.flash('error', "you must be logged in");
            console.log(err);
            } else {
            res.render("ratings/index", {ratings:allRatings});
      }
    }).sort({ reviewed: 'desc' });
 });
 
//Ratings leaderboard
router.get('/leaderboard', (req, res) => {
    Rating.find({}, (err, allRatings) => {
        if(err){
            res.render('/landing');
            console.log(err);
        } else {
            var leaderboard = d3.nest()
            .key(function(d){return d.artist_name;})
            .entries(allRatings);
            res.render('artists/leaderboard', {leaderboard: leaderboard})
        }
    }).sort({ artist_name: 'desc'});
})

//Create - Add new review to DB
 router.post("/", middleware.isLoggedIn, function(req, res){
    
    //rating score
    var artist = req.body.artist_id;
    var artist_name = req.body.artist_name;
    var genre = req.body.genre;
    var score = req.body.score;
    var comment = req.body.comment;
    var reviewed = req.body.reviewed;
    //reviewer data
    var reviewer = {
        id: req.user._id,
        username: req.user.username
    }
    //Make review object
    var newRating = {
        score:score, comment:comment, reviewer:reviewer,
        artist:artist, artist_name:artist_name, genre:genre
    }
    //Add new review and save to DB
    
    
    
    
    
    Rating.create(newRating, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
            req.flash("success", "Your review has been saved");
            res.redirect("back");
        }
    })
    
});

//Ratings destroy route
//=====================
router.delete('/:rating_id', (req, res) => {
    Rating.findByIdAndRemove(req.params.rating_id, (err) => {
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Review deleted");
            res.redirect("/rating");
        }
    })
})

function isLoggedIn(req, res, next){
    if(currentUser){
        return next();
    }
    req.flash("error", "You must log-in");
}

module.exports = router;