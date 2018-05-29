const express       = require('express'),
      app             = express(),
      bodyParser      = require("body-parser"),
      mongoose        = require("mongoose"),
      flash           = require("connect-flash"),
      findOrCreate = require('mongoose-findorcreate'),
      passport        = require("passport"),
      LocalStrategy   = require("passport-local"),
      methodOverride  = require("method-override"),
      Artist          = require("./models/artist"),
      Comment         = require("./models/song"),
      User            = require("./models/user"),
      Rating          = require("./models/rating"),
      path            = require("path"),
      expressValidator = require('express-validator'),
      request = require('request-promise'),
      async = require('async'),
      d3 = require('d3'),
      seedDB          = require("./seeds");
      mongoose.Promise = require('bluebird');


      
const multer = require('multer');
const upload = multer({ dest: 'tmp/uploads'});
const mime = require('mime');
      
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

      
//Requiring Routes
const apiRoutes = require("./routes/api"),
      artistRoutes  = require("./routes/artist"),
     
      indexRoutes   = require("./routes/index"),
      ratingRoutes = require("./routes/rating"),
      sponsorRoutes = require('./routes/sponsor'),
      userRoutes = require("./routes/user");
     
      
mongoose.connect("mongodb://localhost/blockparty_v1");
app.use(morgan('dev')); //log requests to console
app.use(cookieParser());//read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended: true}));//get data from html forms
app.use(expressValidator());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//seedDB();

//Passport config
app.use(require("express-session")({
   secret: "harlowiscrazy",
   resave: false,
   saveUninitialized: false
}));

app.use(flash());//use connect flassh for flash messages

app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions
passport.use(new LocalStrategy(User.authenticate()));
//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, done){
  done(null, user.id)
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
   done(err, user);
  });
});

app.use(function(req, res, next){
      res.locals.currentUser = req.user;
      res.locals.error = req.flash("error");
      res.locals.success = req.flash("success");
      res.locals.info = req.flash("info");
      next();
});

//Facebook Auth// ===========
const FacebookStrategy = require('passport-facebook').Strategy;

const FACEBOOK_APP_ID = '209313839680350';
const FACEBOOK_APP_SECRET = '3445fe34a1011da53134d86800b35b08';

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: 'https://block-party-coreyjsax.c9users.io/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'gender', 'emails', 'picture.type(large)']
  },
  
  function(accessToken, refreshToken, profile, done){
    console.log(profile);
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
    

app.get('/auth/facebook',
  passport.authenticate('facebook', {scope : ["email", "user_location", "user_hometown", "user_birthday", 'public_profile'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/artists');
  });



app.use("/", indexRoutes);
app.use("/artists", artistRoutes);
app.use("/api", apiRoutes);

app.use("/rating", ratingRoutes);
app.use("/sponsor", sponsorRoutes);
app.use("/user", userRoutes);


app.listen(process.env.PORT, function(){
    console.log("Block Party Server has Started");
});