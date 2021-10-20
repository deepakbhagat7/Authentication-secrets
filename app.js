// level 3 security using .env(environment variable)
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
//const encryption = require("mongoose-encryption");  //(level 2 security)
//const md5 = require("md5");             //level 4 security (hashing)
//const bcrypt = require("bcrypt");          // level 5 security (salting)
//const  saltRounds = 10;
const session = require('express-session'); //level 7 security (passport)
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");




const app = express();

//console.log(md5("123456"));

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret : "Our little secret.",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema =  new mongoose.Schema({
    email : String,
    password : String
});

userSchema.plugin(passportLocalMongoose);
// level 2 security using moongoose encryption 

//userSchema.plugin(encryption, {secret: process.env.SECRET, encryptedFields : ["password"]}); // level 3 security using(.env)
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});



app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login")
    }
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/register", function (req, res) {

User.register({username : req.body.username}, req.body.password, function (err, user){
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
});



    /*  commenting out whole code  for using passport
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {    //security level 5 using hashing
        const newUser = new User({
            email : req.body.username,
            password: hash                             // md5(req.body.password)------------->// security level 4 using hashing
        });
        newUser.save(function (err) {
            if(!err){
                res.render("secrets");
            }else{
                console.log(err);
            }
        });
    });*/
    
});

app.post("/login", function (req, res) {

const user = new User({
    username : req.body.username,
    password : req.body.password
});

req.login(user, function (err) {
    if (err) {
        console.log(err);
    } else {
        passport.authenticate("local")(req, res, function () {
            res.redirect("/secrets");
        });
    }
});





  /*  commenting out whole code  for using passport
    const username = req.body.username;
    const password = req.body.password;                                              //md5(req.body.password); no longer required md5 part
// level 1 sceurity- using email and password
    User.findOne({email:username}, function (err, foundUser) {
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                //if(foundUser.password === password){ level 1 security
                bcrypt.compare(password, foundUser.password, function (err, result) {// using level 5 security # bcrypts
                    if(result === true){
                        res.render("secrets");
                    }
                });
                    
                }
            }
        
    });**/
});





app.listen(3000, function () {
    console.log("Server started on port 3000");
});