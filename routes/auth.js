const express = require("express");
const router = express.Router();
const Artist = require("../models/artist");
const Rating = require("../models/rating");
const User = require("../models/user");
const passport        = require("passport");

//Facebook Auth// ===========
const FacebookStrategy = require('passport-facebook').Strategy;

const FACEBOOK_APP_ID = '209313839680350';
const FACEBOOK_APP_SECRET = '3445fe34a1011da53134d86800b35b08';

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: 'https://nameless-shore-98809.herokuapp.com/auth/facebook/callback',
  profileFields: ['id', 'displayName','gender', 'emails', 'picture.width(200).height(200)']
  },
  
  function(accessToken, refreshToken, profile, done){
    console.log(accessToken);
   // User.findOrCreate({ facebookId: profile.id, username: profile.name}, function(err, user){
    //  console.log('A new user from "%s" was inserted', user.facebookId);
   //   return done(err, user);
    User.findOne({ 'facebook.id' : profile.id },
      function(err, user){
        if (err) return done(err);
        if (user) return done(null, user);
          else {
            //if there is no user found with that facebook id, create them
            var newUser = new User();
            // set all of the facbeook information in our user model
            newUser.facebook.id = profile.id;
            newUser.facebook.token = accessToken;
            newUser.facebook.name = profile.displayName;
            newUser.username = profile.displayName;
            newUser.email = profile.emails[0].value;
            newUser.avatar = profile.photos[0].value;
            
              if (typeof profile.emails != 'undefined' && profile.emails.length > 0)
                newUser.facebook.email = profile.emails[0].value;
              //save user to DB
                newUser.save(function(err){
                  if (err) throw err;
                  return done(null, newUser);
                });
              }
            });
          }
      ))
    

router.get('/facebook',
  passport.authenticate('facebook', {scope : ["email", 'public_profile'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

//Twitter Auth// =================
const TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
  consumerKey: "3RAOUsNP8u05iaKxgXPKS0nmj",
  consumerSecret: "AimO7N3PXnsZsZiCN0yjbwAZiwvrVIBdjUj4BQGLcb1F46jlIh",
  callbackURL: 'https://nameless-shore-98809.herokuapp.com/auth/twitter/callback',
  includeEmail:true
},
  function(accessToken, refreshToken, profile, done) {
    User.findOne({'twitter.id' : profile.id},
      function(err, user) {
        if (err) return done(err);
        if(user) return done(null, user);
          else {
            //if there is no user found with twitter id, create them
            var newUser = new User();
            //set all of the twitter information in our user model
            newUser.twitter.id = profile.id;
            newUser.twitter.token = accessToken;
            newUser.twitter.username = profile.username;
            newUser.twitter.name = profile.displayName;
            newUser.avatar = profile.photos[0].value;
            //newUser.twitter.email = profile.emails[0].value;
            newUser.username = profile.displayName;
          
            //save user to DB
              newUser.save(function(err){
                if (err) throw err;
                return done(null, newUser);
              });
          }
      });
  }));
  
router.get('/twitter',
  passport.authenticate('twitter'));

router.get('/twitter/callback',
  passport.authenticate('twitter', {failureRedirect: '/login'}),
  function(req, res){
    res.redirect('/');
});

//Google Auth// ==================
var GoogleStrategy = require('passport-google-oauth2').Strategy;

 passport.use(new GoogleStrategy({
  clientID: '787307841572-uolj1du5brlcc55crdj3ho78i9ffrdrf.apps.googleusercontent.com',
  clientSecret: 'tgZOlwFMa7e79-x2ajowus-p',
  callbackURL: 'https://nameless-shore-98809.herokuapp.com/auth/google/callback',
  passReqToCallback: true
},
function(request, accessToken, refreshToken, profile, done){
  User.findOne({'google.id' : profile.id},
    function(err, user){
      if(err) return done(err);
      if(user) return done(null, user);
        else {
          //if there is no user found with Google id, create them
          var newUser = new User();
          //set all of the google information in our user model
          newUser.google.id = profile.id;
          newUser.google.token = accessToken;
          newUser.google.name = profile.displayName;
          newUser.google.email = profile.emails[0].value;
          newUser.avatar = profile.photos[0].value;
          newUser.email = profile.emails[0].value;
          newUser.username = profile.displayName;
          //save user to DB
          newUser.save(function(err){
            if (err) throw err;
            return done(null, newUser);
          });
        }
    });
}));
  
router.get('/google', 
passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/google/callback',
  passport.authenticate('google', {failureRedirect: '/login'}),
  function(req, res){
    res.redirect('/');
  });

module.exports = router;