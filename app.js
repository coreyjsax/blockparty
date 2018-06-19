const express       = require('express'),
      app             = express(),
      axios = require('axios'),
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
      authRoutes = require("./routes/auth"),
      indexRoutes   = require("./routes/index"),
      ratingRoutes = require("./routes/rating"),
      sponsorRoutes = require('./routes/sponsor'),
      userRoutes = require("./routes/user");
     
      
//mongoose.connect("mongodb://localhost/blockparty_v1");
mongoose.connect(process.env.DATABASEURL);
//mongodb://coreyjsax:Summit123@ds113041-a0.mlab.com:13041,ds113041-a1.mlab.com:13041/pl-block-party-18?replicaSet=rs-ds113041
console.log(process.env.DATABASEURL)
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


//Custom Validators for Express Validator
//======================================
app.use(expressValidator({
  customValidators: {
    isNotEqual: (value1, value2) => {
      return value1 != value2
    }
  }
}));


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


app.use("/", indexRoutes);
app.use("/artists", artistRoutes);
app.use("/api", apiRoutes);
app.use("/auth", authRoutes);
app.use("/rating", ratingRoutes);
app.use("/sponsor", sponsorRoutes);
app.use("/user", userRoutes);


app.listen(process.env.PORT, function(){
    console.log("Block Party Server has Started");
});