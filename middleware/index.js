var Artist = require("../models/artist");
var Song = require("../models/song");
//middleware
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("info", "You need to be logged in to do that!");
    res.redirect("back");
}

middlewareObj.checkCommentOwnership = function(req, res, next){
  if (req.isAuthenticated()){
    Artist.findById(req.params.artist_id, function(err, foundArtist){
      if(err){
        req.flash("error", "Artist not found");
        res.redirect("back/");
      } else {
        if(foundArtist.author.id.equals(req.user._id)){
          next();
        } else {
          req.flash("error", "Sorry brah, you can't delete someone else's artist.");
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
        if(foundArtist.author.id.equals(req.user._id) || req.user.role === "superadmin") {
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