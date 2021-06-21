//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");
});

app.get("/home",function(req,res){
    res.render("home");
});

app.get("/contacts",function(req,res){
    res.render("contacts");
});

app.get("/about",function(req,res){
    res.render("about");
});

app.listen(3000,function(req,res){
    console.log("Server Running!");
});