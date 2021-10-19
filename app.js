// level 3 security using .env(environment variable)
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encryption = require("mongoose-encryption");


const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema =  new mongoose.Schema({
    email : String,
    password : String
});
// level 2 security using moongoose encryption 

userSchema.plugin(encryption, {secret: process.env.SECRET, encryptedFields : ["password"]});
const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    const newUser = new User({
        email : req.body.username,
        password: req.body.password
    });
    newUser.save(function (err) {
        if(!err){
            res.render("secrets");
        }else{
            console.log(err);
        }
    });
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
// level 1 sceurity- using email and password
    User.findOne({email:username}, function (err, foundUser) {
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets");
                }
            }
        }
    });
});





app.listen(3000, function () {
    console.log("Server started on port 3000");
})