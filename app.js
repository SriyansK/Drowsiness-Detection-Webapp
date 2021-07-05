//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/safedriveDB",{useNewUrlParser : true ,useUnifiedTopology: true});

const feedbackSchema = new mongoose.Schema({
    email : String,
    content : Array
});

const Feedback = mongoose.model("Feedback",feedbackSchema);

app.route("/")
    .get(function(req,res){
        res.sendFile(__dirname+"/index.html");
    });

app.route("/home")
    .get(function(req,res){
        res.render("home");
    });

app.route("/contacts")
    .get(function(req,res){
        res.render("contacts");
    })
    .post(function(req,res){
        var newEmail = req.body.email;
        var newContent = req.body.content;
        
        Feedback.findOne({email:newEmail},function(err,foundEmail){
            if(!err){
                if(foundEmail){
                    foundEmail.content.push(newContent);
                    foundEmail.save(function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("Feedback Submitted");
                        }
                    });
                }else{
                    const newFeedback = new Feedback({
                        email: newEmail,
                        content: [newContent]
                    });

                    newFeedback.save(function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("Feeback Submitted");
                        }
                    });
                }
            }else{
                console.log(err);
            }
        });

        res.redirect("/");
    });

app.route("/about")
    .get(function(req,res){
        res.render("about");
    });

app.route("/login")
    .get(function(req,res){
        res.render("login");
    })
    .post(function(req,res){
        var username = req.body.username;
        var password = req.body.password;

        
    })

app.route("/create")
    .get(function(req,res){
        res.render("create");
    })
    .post(function(req,res){
        res.redirect("/");
    });

app.listen(3000,function(req,res){
    console.log("Server Running!");
});