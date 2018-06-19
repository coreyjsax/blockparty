const express = require("express");
const router = express.Router();
const Artist = require("../models/artist");
const Rating = require("../models/rating");
const User = require("../models/user");
const middleware = require("../middleware");
const axios = require('axios');
const request = require('request-promise');


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
/* router.get('/:id/inbox', function(req, res){
    User.findById(req.params.id, function(err, user){
        if (err) {
            console.log(err)
            res.send(err);
        }
        Artist.find({}, function(err, allArtists){
            if(err){
                console.log(err);
            } else {
                res.render("users/inbox", {user:user, artists:allArtists});
            }
        })
        
    });
}); */

router.get('/:id/inbox', (req, res) => {
    var user = req.params.id;
    var artistReq = '/api/artists';
    var userRatingReq = '/api/users/'+ user + '/ratings';
    var inboxData=[];
    
    function getArtists(){
        return axios.get(artistReq);
    }
    function getUserRatings(){
        return axios.get(userRatingReq);
    }
    
    axios.all([getArtists(), getUserRatings()])
        .then(axios.spread(function(artists, userRatings){
           var artists = artists;
           for (var i = 0; i < artists.length; i++){
               inboxData.push(artists.data[i]);
           }
           var userRatings = userRatings;
            for (var i = 0; i < userRatings.length; i++){
               inboxData.push(userRatings.data[i]);
           }
            
           
        
            
            
            
            return inboxData;
            
        }))
        console.log(inboxData);
        res.json(inboxData);
       
});

router.get('/:id/inbox2', (req, res) => {
   var user = req.params.id;
   var userReviewed = [];
   var artistUrl = '/api/artists';
   var userRatings = '/api/users/'+ user + '/ratings';
  // var reviewed =[];
   request(userRatings)
   .then(function(response){
     var reviewed = JSON.parse(response);
    // console.log(reviewed)
     return reviewed;
   }).then(function(reviewed){
       for (var i = 0; i < reviewed.length; i++){
           var id = reviewed[i].artist;
           var artist = reviewed[i].artist_name;
           var comment = reviewed[i].comment;
           var score = reviewed[i].score;
           var artist_avatar = reviewed[i].artist_avatar;
           var review_id = reviewed[i]._id;
           var date = reviewed[i].reviewed;
           var user_avatar = reviewed[i].reviewer.avatar;
           userReviewed.push({artist_id: id, artist: artist, comment: comment, score: score, artist_avatar: artist_avatar, user_avatar: user_avatar, date:date, review_id:review_id});
          
       }
       return userReviewed;
   }).then(function(userReviewed){
       request(artistUrl)
       .then(function(res2){
           console.log(userReviewed)
        
           var reviewedArtistIds =[];
           for (var i = 0; i<userReviewed.length; i++){
               reviewedArtistIds.push(userReviewed[i].artist_id)
           }
           
           var artists = JSON.parse(res2);
           var artists = artists.filter(function( o){
               return reviewedArtistIds.indexOf(o._id) === -1;
           })
           
          //res.json({artists, userReviewed})
          res.render("users/inbox2", {artist:artists, userReviewed:userReviewed});
       });
   });
});
 // res.render("partials/all-artists-gallery", {artists:artists});

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



module.exports = router;