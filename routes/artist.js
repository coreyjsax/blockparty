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
               
               Artist.count({booked:'booked'}, (err, bookedCount) => {
                   if (err) {
                       
                   }
                   res.render("artists/index", {artists:artists, genreData:genreData, count:count, total:total, bookedCount:bookedCount});
               })
               
           })
       })
   }).sort({ submitted: 'desc' });
});




//Create - Add new artist to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    var checkgenre = "Select Genre";
    var artistData = req.body;
    //Validation logic for artist
    req.checkBody("name", "Artist name cannot be blank").notEmpty();
    req.checkBody("video", "Youtube ID must be 11 characters").isLength({min:11, max:11});
    req.checkBody("genre", "Please select artist genre").notEmpty();
    req.checkBody("genre", "Please select artist genre").isNotEqual("Select Genre");
    req.checkBody("description", "Artist bio must be at least 150 and no more than 700 characters").isLength({min:150, max:700});
    req.checkBody("question", "Answer must be at least 1 and no more than 700 characters").isLength({min:1, max:700});
   
    //.notEmpty().withMessage( "must be provided" )
   // .matches("https://www.youtube.com/embed/*").withMessage("Please enter youtube embed link as indicated");
    var errors = req.validationErrors();
  //  console.log(errors);
    if (errors) {
        console.log(errors);

        res.render("artists/new-artist-page", {errors, artistData});
        return;
    } else {
         //Get data from form and add to DB
    var name = req.body.name;
    var genre = req.body.genre;
    var formed = req.body.formed;
    var desc = req.body.description;
    var question = req.body.question;
    var info = req.body.info;
    var video = req.body.video;
    var booked = req.body.booked;
  
   var submitted = req.body.submitted;
    
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newArtist = {
        name:name, genre: genre, formed:formed,
        description:desc, question:question, video:video, submitted:submitted, author:author, booked:booked
    }
    
    Artist.find({name: req.body.name}, function(err, docs){
        var checkArtist = "Artist has already been submitted";
        if (docs.length){
            res.render("artists/new-artist-page", {checkArtist})
        } else {
            //Create a new artist and save to DB
            Artist.create(newArtist, function(err, newlyCreated){
                if(err){
                    console.log(err);
                } else {
                    res.redirect("/artists");
                }
            });
        }
    })
        
    
    }
   
});




//dynamic views =========

//All Submitted Artists
router.get("/all", function(req, res){
    var artists;
    var tags;
    var bookedCount;
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
               
               Artist.count({'booked': 'booked'}, (err, bookedCount) => {
                   if (err) {
                       console.log(err);
                   } 
                       console.log(bookedCount)
                       res.render("partials/all-artists-gallery", {artists:artists, tags:tags, bookedCount:bookedCount}); 
                   
               })
               
               
           }
           
       })
   }).sort({ submitted: 'desc' });
});
//Get Booked Artists 
router.get("/booked", function(req, res){
    Artist.find({'booked': "booked"}, function(err, artist){
        if(err){
            res.redirect("/artists")
        } else {
            res.render("partials/all-artists-gallery", {artists:artist});
        }
    }).sort({ submitted: 'desc' });
    
});
//Form to post new artist
router.get("/newartist", function(req, res){
    res.render('artists/new-artist-page');
});

//Get List of Genres
router.get("/genre", function(req, res){
    var tags;
    var bookedCount;
    
    Artist.collection.distinct("genre", function(err, tags){
        if(err){
            res.redirect('/artists');
        }
        tags = tags.sort();
        
       Artist.count({booked: 'booked'}, (err, count) => {
            if(err){
                console.log(err);
            }
            bookedCount = count;
            console.log(bookedCount) 
            res.render("partials/tag-cloud", {tags:tags, bookedCount: bookedCount});
        });
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
router.get("/:id", (req, res) => {
    var rating;
    Artist.findById(req.params.id, (err, foundArtist) => {
        if(err){
             console.log(err);
             res.redirect("/artists");
        } 
        Rating.find({ 'artist' : req.params.id }, (err, artistRatings) => {
            if(err) {
                res.send(err);
            }
            console.log(rating)
           rating = artistRatings;
           res.render("artists/show", {artist: foundArtist, rating: rating});
            
        })
        
      //  
            
            //show template with Artist details
          
            
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
    
     //Validation logic for name
   /* req.checkBody("artist[name]", "Artist name cannot be blank").notEmpty();
    req.checkBody("artist[video]", "Youtube ID must be 11 characters").isLength({min:11, max:11});
    req.checkBody("artist[genre]", "Please select artist genre").notEmpty();
    req.checkBody("desc", "Artist bio must be at least 150 and no more than 700 characters").isLength({min:150, max:700});
    req.checkBody("question", "Answer must be at least 1 and no more than 700 characters").isLength({min:1, max:700});
   
   var artist = {
       id: req.params.id,
       author : {id: currentUser},
       name: req.body.name,
       video: req.body.video,
    genre: req.body.genre
   }
    
   var currentUser = req.user;
   
   
    //.notEmpty().withMessage( "must be provided" )
   // .matches("https://www.youtube.com/embed/*").withMessage("Please enter youtube embed link as indicated");
    var errors = req.validationErrors();
  //  console.log(errors);
    if (errors) {
        console.log(errors);
        
        res.render("artists/show", {errors: errors, artist: artist, currentUser: req.user});
        return;
    } else { */
    
        Artist.findByIdAndUpdate(req.params.id, req.body.artist, function(err, updatedArtist){
            if(err){
                res.redirect("back");
            } else {
                res.redirect("back");
            }
        });
  //  }
});

//middleware
function isLoggedIn(req, res, next){
    if(currentUser){
        return next();
    }
    req.flash("error", "You must log-in");
}


module.exports = router;