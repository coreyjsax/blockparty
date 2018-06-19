const express = require("express");
const router = express.Router();
const Artist = require("../models/artist");
const Rating = require("../models/rating");
const User = require("../models/user");
const middleware = require("../middleware");
const d3 = require('d3');

//Get - Get all ratings
 router.get('/', (req, res) => {
    Rating.find({}, (err, allRatings) => {
     if(err){
        res.render('/landing');
//      req.flash('error', "you must be logged in");
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
            .key((d) => {return d.artist_name;})
            .entries(allRatings);
            res.render('artists/leaderboard', {leaderboard: leaderboard})
        }
    }).sort({ artist_name: 'desc'});
})

//Create - Add new review to DB
 router.post("/", middleware.isLoggedIn, (req, res) => {
     
     var ratingData = req.body;
    //validation logic for rating
    req.checkBody("score", "Please rate artist").notEmpty();
    var errors = req.validationErrors();
    
    
    if (errors) {
        console.log(errors);
        req.flash("success", "Rating not complete");
        res.redirect("back");
    }  else  {
    //rating score
    var artist = req.body.artist_id;
    var artist_name = req.body.artist_name;
    var artist_avatar = req.body.artist_avatar;
    var genre = req.body.genre;
    var score = req.body.score;
    var comment = req.body.comment;
    var reviewed = req.body.reviewed;
    //reviewer data
    var reviewer = {
        id: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar
    }
    //Make review object
    var newRating = {
        score:score, comment:comment, reviewer:reviewer,  reviewed:reviewed,
        artist:artist, artist_name:artist_name, genre:genre, artist_avatar: artist_avatar
    }
    //Check to see if user rating exists
    Rating.count({'artist': artist, 'reviewer.id': req.user._id}, (err, count) => {
        if(err){
            console.log(err);
        } else if (count>0) {
            req.flash("success", "You already rated this artist");
            res.redirect("back");
        } else {
            //Create rating and add to DB
            Rating.create(newRating, (err, newlyCreated) => {
                if(err){
                    console.log(err);
                } else {
                    req.flash("success", "Your review has been saved");
                    res.redirect("back");
                }
            })
        }
    })
    }
 });


//Ratings destroy route
//=====================
router.delete('/:id', (req, res) => {
    Rating.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Review deleted");
            res.redirect("back");
        }
    })
})

//Edit Routes =========
router.get("/:id/edit", (req, res) => {
    Rating.findById(req.params.id, (err, foundRating) => {
        res.render("ratings/edit", {rating: foundRating});
    });
});

//Update Routes =======
router.put("/:id", (req, res) => {
    Rating.findByIdAndUpdate(req.params.id, req.body.rating, (err, updateRating) => {
        if(err){
            res.redirect('back')
        } else {
            res.redirect('back');
        }
    });
});

function isLoggedIn(req, res, next){
    if(currentUser){
        return next();
    }
    req.flash("error", "You must log-in");
}

module.exports = router;