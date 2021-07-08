//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const saltRound = 10;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/safedriveDB",{useNewUrlParser : true ,useUnifiedTopology: true});

const feedbackSchema = new mongoose.Schema({
    email : String,
    content : Array
});

const userSchema = new mongoose.Schema({
    email : String,
    nums: Array,
    password: String,
    status: Number
});


const Feedback = mongoose.model("Feedback",feedbackSchema);
const User = mongoose.model("User",userSchema);

var loginStatus=0;

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

        if (loginStatus === 1){
            console.log("Already Logged in.");
            res.redirect("/");
        }

        var userEmail = req.body.username;
        var userPassword = req.body.password;
        User.findOne({email:userEmail},function(err,foundEmail){
            if(err){
                console.log(err);
            }else{
                if(foundEmail){
                    bcrypt.hash(userPassword,saltRound,function(err,hash){
                        bcrypt.compare(userPassword,foundEmail.password,function(err,result){
                            if(err){
                                console.log(err);
                            }else{
                                if(result === true){
                                    foundEmail.status=1;
                                    loginStatus=1;
                                    foundEmail.save();
                                    res.redirect("/");
                                }else{
                                    console.log("Wrong PassWord");
                                }
                            }
                        });
                    });
                }else{
                    console.log("User not found.");
                    res.redirect("/create");
                }
            }
        });
    });

app.route("/create")
    .get(function(req,res){
        res.render("create");
    })
    .post(function(req,res){
        
        var userEmail = req.body.username;
        var userPassword = req.body.password;
        var userNew_password = req.body.new_password;
        var userContact1 = req.body.phone;

        User.findOne({email:userEmail},function(err,foundEmail){
            if(err){
                console.log(err);
            }else{
                if(foundEmail){
                    console.log("Email already exist!");
                }else{
                    if(userPassword != userNew_password){
                        console.log("Password Not matched");
                    }else{
                        bcrypt.hash(userPassword,saltRound,function(err,hash){

                            if(err){
                                console.log(err);
                            }else{
                                const newUser = new User({
                                    email: userEmail,
                                    nums: [userContact1],
                                    password: hash,
                                    status:0
                                });
        
                                newUser.save(function(err){
                                    if(err){
                                        console.log("Error adding new user");
                                    }else{
                                        console.log("User added");
                                    }
                                });
                            }     
                        }); 
                    }
                }
            }
        });

        res.redirect("/login");
    });

app.listen(3000,function(req,res){
    console.log("Server Running!");
});