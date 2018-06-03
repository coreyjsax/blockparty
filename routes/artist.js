const express = require("express");
const router = express.Router();
const Artist = require("../models/artist");
const Rating = require("../models/rating");
const middleware = require("../middleware");




//INDEX - show all artists
router.get('/', function(req, res){
   //Get all artists from DB
   var artists;
   var tags;
   var genreIds;
   var genreData;
   var count;
   var total;
   function formatId(str){
        return str.toLowerCase().replace(/\s/g, '-').replace(/\//g,"-");
   }
   
   Artist.find({}, function(err, allArtists){
       if(err){
           res.render('/landing');
           console.log(err);
       } else {
          artists = allArtists;
       }
       Artist.collection.distinct("genre", function(err, allGenres){
           if(err){
               res.render('/landing');
               console.log(err);
           } else {
               tags = allGenres.sort();
               genreData = {};
               tags.forEach(function(item){
                  genreData[item] = {
                    type: (item),
                    id: formatId(item)
                  };
              });
              console.log(genreData)
           } 
           Artist.find({}, {genre:1}, function(err, genre){
               if(err){
                   console.log(err);
               }
               var result = [...genre.reduce((mp, o)=> {
                   if(!mp.has(o.genre)) mp.set(o.genre, Object.assign({ count: 0}, o));
                   mp.get(o.genre).count++;
                   return mp;
               }, new Map).values()];
               var count = [];
               var total = [];
               for (var i=0; i < result.length; i++){
                   count.push({"genre": result[i]._doc.genre, "count": result[i].count, "id": formatId(result[i]._doc.genre)});
                   total.push(result[i].count);
               }
               function getSum(total, num){
                   return total + num;
               }
               total = total.reduce(getSum);
               console.log(count)
               res.render("artists/index", {artists:artists, genreData:genreData, count:count, total: total});
           })
           
           
        
       })
       
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
    var artists;
    var tags;
    Artist.find({}, function(err, allArtists){
       if(err){
           res.render('/landing');
           console.log(err);
       } else {
              artists = allArtists;
             // res.render("partials/all-artists-gallery", {artists:allArtists}); 
       }
       Artist.collection.distinct("genre", function(err, allGenres){
           if(err){
               res.render('/landing');
               console.log(err);
           } else {
               tags = allGenres;
               
               res.render("partials/all-artists-gallery", {artists:artists, tags:tags}); 
           }
           console.log(tags);
               console.log(artists);
       })
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

//Get List of Genres
router.get("/genre", function(req, res){
    Artist.collection.distinct("genre", function(err, tags){
        if(err){
            res.redirect('/artists');
        }
        tags = tags.sort();
        res.render("partials/tag-cloud", {tags:tags});
    });
});


//Get Artists by Genre
router.get("/genre/:id", function(req, res){
    Artist.find({'genre': req.params.id}, function (err, artist){
        if(err){
            res.redirect('/artists');
        } else {
            res.render("partials/all-artists-gallery", {artists:artist});
        }
    }).sort({ submitted: 'desc' });
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