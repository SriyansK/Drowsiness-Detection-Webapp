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

mongoose.connect("mongodb://0.0.0.0:27017/safedriveDB",{useNewUrlParser : true ,useUnifiedTopology: true});

const feedbackSchema = new mongoose.Schema({
    name : String,
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

var loggedIn=0;
var currUser;
var phNums = new Array;

app.route("/")
    .get(function(req,res){
        if(loggedIn === 1){
            res.render("index",{loggedIn:"Logout"});
        }else{
            res.render("index",{loggedIn:"Login"});
        }
    });

app.route("/demo")
    .get(function(req,res){
        res.render("demo");
    });


app.route("/feedbackAc")
    .get(function(req,res){
        res.render('feedbackAc');
    });

app.route("/contacts")
    .get(function(req,res){
        res.render("contacts");
    })
    .post(function(req,res){
        var newName = req.body.name;
        var newEmail = req.body.email;
        var newContent = req.body.content;
        var feedBackSuccess = true;
        Feedback.findOne({email:newEmail},function(err,foundEmail){
            if(!err){
                if(foundEmail){
                    foundEmail.content.push(newContent);
                    foundEmail.save(function(err){
                        if(err){
                            console.log(err);
                            feedBackSuccess = false;
                        }else{
                            console.log("Feedback Submitted");
                        }
                    });
                }else{
                    const newFeedback = new Feedback({
                        name: newName,
                        email: newEmail,
                        content: [newContent]
                    });

                    newFeedback.save(function(err){
                        if(err){
                            console.log(err);
                            feedBackSuccess = false;
                        }else{
                            console.log("Feeback Submitted");
                        }
                    });
                }
            }else{
                console.log(err);
                feedBackSuccess = false;
            }
        });

        if(feedBackSuccess === true){
            res.render("feedbackAc",{acText:"Thank you for you time."});
        }else{
            res.render("feedbackAc",{acText:"Feedback was not submitted."});
        }
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
                                    currUser=userEmail;
                                    foundEmail.status=1;
                                    loggedIn=1;
                                    phNums = foundEmail.nums;
                                    foundEmail.save();
                                    console.log("Logged in");
                                    res.redirect("/home");
                                }else{
                                    console.log("Wrong Password");
                                    res.redirect("/login");
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
                    res.redirect("/login");
                }else{
                    if(userPassword != userNew_password){
                        console.log("Password Not matched");
                        res.redirect("/create");
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
                                        res.redirect("/create")
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

app.route("/logout")
    .get(function(req,res){
        console.log("Logged Out");
        User.findOne({email:currUser},function(err,foundEmail){
            if(err){
                console.log(err);
            }else{
                if(foundEmail){
                    foundEmail.status = 0;
                    foundEmail.save();
                }
            }
        });
        loggedIn=0;
        res.redirect("/login");
    });

app.listen(3000,function(req,res){
    console.log("Server Running!");
});