const express = require("express");
const router = express.Router();
const Artist = require("../models/artist");
const Rating = require("../models/rating");
const User = require("../models/user");
const middleware = require("../middleware");
const request = require('request-promise');
const async = require('async');
const d3 = require('d3');


// Test route 
router.get('/', (req, res) => {
    res.json({message: "Welcome to api"});
})

//Artist Routes
//=============
//Get all Artists
//===============
router.get('/artists', (req, res) => {
    Artist.find((err, artists) => {
        if (err){
            res.send(err)
        }
        res.json(artists);
    });
});

//Get Artist Genre Tag Cloud 
router.get('/genre', (req, res) => {
  var genre = [];
  Artist.find({}, {genre:1}, (err, genre) => {
    if (err){
      console.log(err);
    }
    var result = [...genre.reduce((mp, o) => {
      if (!mp.has(o.genre)) mp.set(o.genre, Object.assign({ count: 0}, o));
      mp.get(o.genre).count++;
      return mp;
    }, new Map).values()];
    var count = [];
    for (var i=0; i < result.length; i++){
      count.push({"genre": result[i]._doc.genre, "count": result[i].count})
    }
    res.json(count);
  })
})

//Get Artist by Genre
//==================

router.get("/genre/:id", (req, res) => {
    Artist.find({'genre': req.params.id}, (err, artist) => {
        if(err){
            res.redirect('/artists');
        } 
        res.json(artist);
    });
});

//Get Artist by ID
//================
router.get('/artists/:id', (req, res) => {
    Artist.findById(req.params.id, (err, artist) => {
        if (err) {
            res.send(err);
        }
        res.json(artist);
    });
});

//Get Ratings by Artist
//================
router.get('/artists/:id/ratings', (req, res) => {
    Artist.findById(req.params.id, (err, artist) => {
        if (err) {
            res.send(err);
        }
        Rating.find({ 'artist' : req.params.id }, (err, rating) => {
            if (err) {
                res.send(err);
            }
            res.json(rating);
        });
    });
});

/* router.get('/facebookdata/:id', (req, res) => {
    
}) */


//Rating Routeshttps://stackoverflow.com/questions/5024787/update-model-with-mongoose-express-nodejs
//=============
//Get all Ratings
router.get('/ratings', (req, res) => {
    Rating.find((err, ratings) => {
        if(err){
            res.send(err);
        }
        res.json(ratings);
    });
});

//Get Rating by ID
//================
router.get('/ratings/:id', (req, res) => {
    Rating.findById(req.params.id, (err, rating) => {
        if (err){
            res.send(err);
        }
        res.json(rating);
    });
});

//User Routes
//===========
//Get all Users
router.get('/users', (req, res) => {
    User.find((err, users) => {
        if(err){
            res.send(err);
        }
        res.json(users);
    });
});
   
//Get User by ID
//==============
router.get('/users/:id', (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err){
            res.send(err);
        }
        res.json(user);
    })
})

//Get ratings by User
//===================
router.get('/users/:id/ratings', (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (err) {
            res.send(err);
        }
        Rating.find({ 'reviewer.id' : req.params.id }, (err, rating) => {
            if (err) {
                res.send(err);
            }
            res.json(rating);
        });
    });
});

//Get Artists Submitted by User
//=============================
router.get('/users/:id/artists', (req, res) => {
    User.findById(req.params.id, (err, user) => {
       if (err) {
           res.send(err);
       } 
       Artist.find({ 'author.id' : req.params.id }, (err, myArtists) => {
           if (err) {
               res.send(err);
           }
           
           res.json(myArtists);
       });
    });
});

//Get Artists not yet rated by User
//=================================
router.get('/users/:id/inbox', (req, res) => {
   var user = req.params.id;
   var userReviewed = [];
   var artistUrl = '/api/artists';
   var userRatings = '/api/users/'+ user + '/ratings';
   request(userRatings)
   .then((response) => {
     var reviewed = JSON.parse(response);
     return reviewed;
   }).then(function(reviewed){
       for (var i = 0; i < reviewed.length; i++){
           var id = reviewed[i].artist;
           userReviewed.push(id);
       }
       return userReviewed;
   }).then((userReviewed) => {
       request(artistUrl)
       .then((res2) => {
       //    console.log(userReviewed)
           var artists = JSON.parse(res2);
           var artists = artists.filter(( o) => {
               return userReviewed.indexOf(o._id) === -1;
           })
           res.json(artists);
       });
   });
});


//Loop through artists and get ratings, then average ratings and organize by artist


 var artistJSON = [];
 var reviewJSON = [];

router.get('/leaderboard-test', (req, res) => {
   var artistUrl = '/api/artists';
   var ratingsUrl = '/api/ratings';
   var artistJSON = [];
   var reviewJSON = [];
   
   request(artistUrl)
   .then((response) => {
       var artists = JSON.parse(response);
       return artists;
   }).then((artists) => {
       for (var i = 0; i < artists.length; i++){
           var id = artists[i]._id;
           var name = artists[i].name;
           var genre = artists[i].genre;
           var submitted_by = artists[i].author.username;
           artistJSON.push({
               id: id,
               name: name,
               genre: genre,
               submitted_by: submitted_by
           });
       }
       return artistJSON;
   }).then((artistJSON) => {
      request(ratingsUrl)
      .then((response) => {
          var ratings = JSON.parse(response);
          return ratings;
      }).then((ratings) => {
          for (var i = 0; i < ratings.length; i++){
              var id = ratings[i].artist;
              var artist_name = ratings[i].artist_name;
              var reviewer = ratings[i].reviewer.username;
              var score = ratings[i].score;
              var comment = ratings[i].comment;
              reviewJSON.push({
                  artist_name: artist_name,
                  id: id,
                  reviewer: reviewer,
                  score: score,
                  comment: comment
              });
          }
          return reviewJSON;
      }).then((reviewJSON) => {
         var hash = Object.create(null);
         artistJSON.concat(reviewJSON).forEach((obj) => {
             hash[obj.id] = Object.assign(hash[obj.id] || {}, obj);
         });
         var final = Object.keys(hash).map((key) => {
             return(hash[key]);
         });
         res.json(final);
      })
   })
});

var rtn = [];

router.get("/leaderboard", (req, res) =>{
    //loop thorough ratings array and create an object for each artist. 
    var ratingsUrl = '/api/ratings';
    reviewJSON = [];
    var rtn=[];
    request(ratingsUrl)
    .then((response) => {
        var ratings = JSON.parse(response);
        return ratings;
    }).then((ratings) => {
        var newRatings = d3.nest()
        .key((d) => {return d.artist_name;})
        .entries(ratings);
        res.json(newRatings);
    })
});

router.get("/raterank", (req, res) => {
    var orderedByWeight = {};
    var rankList = [];
    var leaderboardUrl = '/api/leaderboard';
    request(leaderboardUrl)
    .then((response) => {
        var leaderboard = JSON.parse(response);
        return leaderboard;
    }).then((leaderboard) => {
        for (var i=0; i < leaderboard.length; i++){
            var score = 0;
            var tmp = [];
            var weightedScore = {};
            var scoreWeighted;
            var id;
            
            for (var j = 0; j < leaderboard[i].values.length; j++){
                score += leaderboard[i].values[j].score;
                tmp.push(leaderboard[i].values[j].score);
            }
          weightedScore.one = tmp.filter((x) => {return x==1}).length;
          weightedScore.two = tmp.filter((x) => {return x==2}).length;
          weightedScore.three = tmp.filter((x) => {return x==3}).length;
          weightedScore.four = tmp.filter((x) => {return x==4}).length;
          weightedScore.five = tmp.filter((x) => {return x==5}).length;
          scoreWeighted = ((5 * weightedScore.five) + (4 * weightedScore.four) + (3 * weightedScore.three) + (2 * weightedScore.two) + (1 * weightedScore.one)) / (weightedScore.five + weightedScore.four + weightedScore.three + weightedScore.two + weightedScore.one);
       
          //bayesian average for number of votes
          //Rating = (.05 * 4.1 + artistReviews * weightedScore)/(.05+artistReviews)
          var artistReviews = leaderboard[i].values.length;
          var id = leaderboard[i].values[0].artist;
          var finalRating = (.05 * 4.1 + artistReviews * scoreWeighted)/(.05 + artistReviews);
          finalRating = Math.round(finalRating*10000)/10000;
          rankList.push({"artist" : leaderboard[i].key, "artist_id": id, "genre": leaderboard[i].values[0].genre, "reviews": leaderboard[i].values.length,"weightedscore" :  finalRating });
          rankList.sort(function(a, b){
            return b.weightedscore-a.weightedscore
          })
          for (var i = 0; i < rankList.length; i++) {
            rankList[i].rank = (i + 1);
          }
        }
        res.json(rankList);
    });
});

/* Artist.find({}).populate('artists').exec(function(err,data){
       if (err){
           console.log(err)
       }
       async.forEach(data,function(artist, callback){
           Artist.populate(artist.ratings, {"path": "Rating"},function(err,output){
               if (err) console.log(err);
               callback();
           });
         
       })
         res.json(data)
   })
*/
/*
var ids = []
     var docs1 = [];
  Artist.find({}, 'ratings', function (err, ratings){
      if (err){
         console.log(err)
      }
      for (var i = 0; i < ratings.length; i++){
          ids.push({
              id: ratings[i]._id , 
          });
      }
    
    for(var id in ids){
          Rating.find({'artist': ids[id]}, function (err, docs){
              if (err){
                  console.log(err);
              }
            
            console.log(docs)
            
          })
        
      }
    
  }) 
*/




/* 

router.get('/artists/:id/ratings', (req, res) => {
    Artist.findById(req.params.id, (err, artist) => {
        if (err) {
            res.send(err);
        }
        Rating.find({ 'artist' : req.params.id }, (err, rating) => {
            if (err) {
                res.send(err);
            }
            
            res.json(rating);
        });
    });
});


*/

module.exports = router;

/*
router.get('/artists/:id/ratings', function(req, res){
    Artist.findById(req.params.id, function(err, artist){
        if (err) {
            res.send(err);
        }
        Rating.find({ 'artist' : req.params.id }, function(err, rating){
            if (err) {
                res.send(err);
            }
            console.log(rating);
            res.json(rating);
        });
    });
});

*/