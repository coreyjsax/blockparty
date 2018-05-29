const express = require("express");
const router = express.Router();
const Artist = require("../models/artist");
const Rating = require("../models/rating");
const middleware = require("../middleware");




//INDEX - show all artists
router.get('/', function(req, res){
   //Get all artists from DB
   Artist.find({}, function(err, allArtists){
       if(err){
           res.render('/landing');
           console.log(err);
       } else {
           res.render("artists/index", {artists:allArtists});
       }
   }).sort({ submitted: 'desc' });
});




//Create - Add new artist to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    
    //Validation logic for name
    req.checkBody("name", "Enter artist name").notEmpty();
    req.checkBody("video", "Enter youtube video ID").notEmpty().isLength({min:11, max:11});
    req.checkBody("genre", "Select genre").notEmpty();
   
    //.notEmpty().withMessage( "must be provided" )
   // .matches("https://www.youtube.com/embed/*").withMessage("Please enter youtube embed link as indicated");
    
    var errors = req.validationErrors();
  //  console.log(errors);
    if (errors) {
        console.log(errors);
        res.render('artists/index', {errors: errors});
        return;
    } else {
         //Get data from form and add to DB
    var name = req.body.name;
    var genre = req.body.genre;
    var formed = req.body.formed;
    var desc = req.body.description;

    var info = req.body.info;
    var video = req.body.video;
  
   var submitted = req.body.submitted;
    
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newArtist = {
        name:name, genre: genre, formed:formed,
        description:desc, info:info, video:video, submitted:submitted, author:author
    }
        
    //Create a new artist and save to DB
    Artist.create(newArtist, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/artists");
        }
    });
    }
   
});




//dynamic views =========

//All Submitted Artists
router.get("/all", function(req, res){
    Artist.find({}, function(err, allArtists){
       if(err){
           res.render('/landing');
           console.log(err);
       } else {
           res.render("partials/all-artists-gallery", {artists:allArtists});
       }
   }).sort({ submitted: 'desc' });
});
//Booked Artists
router.get("/booked", function(req, res){
    res.render('partials/booked-artists-gallery');
});
//Form to post new artist
router.get("/newartist", function(req, res){
    res.render('partials/add-artist');
});




//Get Artist Genre
router.get("/genre/:id", function(req, res){
    res.send("Here is the " + req.params.id + " template");
});


//Get Artist by ID
router.get("/:id", function(req, res){
    Artist.findById(req.params.id).populate("ratings").exec(function(err, foundArtist){
        if(err){
            req.flash('error', "you must log-in");
             res.redirect("/artists");
             console.log(err);
        } else {
            
            //show template with Artist details
            res.render("artists/show", {artist: foundArtist});
        }
    });
});


// Delete Routes ========
router.delete("/:id", middleware.checkArtistOwnership, (req, res) => {
    Artist.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect("/artists");
        } else {
            Rating.remove({artist: req.params.id}, function(err){
                if(err){
                    res.redirect("/artists")
                } else {
                  req.flash("success", "Artist deleted");
                  res.redirect("/artists");  
                }
            });
            
        }
    });
});

// Edit Routes =========
router.get("/:id/edit", middleware.checkArtistOwnership, (req, res) => {
    Artist.findById(req.params.id, function(err, foundArtist){
        res.render("artists/edit", {artist: foundArtist});
    });
});

//Update Routes ========
router.put("/:id", middleware.checkArtistOwnership, (req, res) => {
    Artist.findByIdAndUpdate(req.params.id, req.body.artist, function(err, updatedArtist){
        if(err){
            res.redirect("/artists");
        } else {
            res.redirect("/artists/" + req.params.id);
        }
    });
});

//middleware
function isLoggedIn(req, res, next){
    if(currentUser){
        return next();
    }
    req.flash("error", "You must log-in");
}


module.exports = router;