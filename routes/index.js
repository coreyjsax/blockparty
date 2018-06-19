const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

//Landing
router.get("/", function(req, res){
    res.render("landing");
});

router.get("/facebook", function(req, res){
    res.render('login');
});

//Root Route
router.get("/login", function(req, res){
    res.render("log-in");
});

router.get("/signup", function(req, res){
    res.render("register");
});

//Registration Logic
router.post("/register", function(req, res){
    var fName = req.body.fName;
    var lName = req.body.lName;
    var email = req.body.email;
    var phone = req.body.phone;
    var username = req.body.username;
    
    
    var newUser = new User({fName:fName, lName:lName, email:email, phone:phone, username:username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/artists");
        }
        passport.authenticate("local")(req, res, function(){
       
           req.flash("success", "Welcome " + user.fName);
           res.redirect("/artists");
          
        });
    });
});

//Handle Login Logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/",
        failureFlash: true,
        successFlash: "Welcome back!"
    }), function(req, res){
        
});

//Log-out Route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You're logged out.");
    res.redirect("/");
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must log-in");
}


module.exports = router;