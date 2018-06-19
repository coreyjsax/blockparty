var Artist = require("../models/artist");
var Rating = require("../models/rating");
var Song = require("../models/song");
//middleware
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("success", "Log-in to add an artist!");
    res.redirect("back");
}

middlewareObj.checkCommentOwnership = function(req, res, next){
  if (req.isAuthenticated()){
    Rating.findById(req.params.rating_id, function(err, foundRating){
      if(err){
        req.flash("error", "Rating not found");
        res.redirect("back/");
      } else {
        if(foundRating.author.id.equals(req.user._id) || req.user.username === "Corey Sax"){
          next();
        } else {
          req.flash("error", "Sorry brah, you can't delete someone else's rating.");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
}

middlewareObj.checkArtistOwnership = function(req, res, next){
  if(req.isAuthenticated()){
    Artist.findById(req.params.id, function(err, foundArtist){
      if(err){
        req.flash("error", "Ooops!");
        res.redirect("back");
      } else {
        if(foundArtist.author.id.equals(req.user._id) || req.user.username === "Corey Sax") {
        next();
        
          } else {
            req.flash("error", "You have to be logged-in to do that.");
            res.redirect("back");
          }
        }
      })
    }
}


module.exports = middlewareObj;