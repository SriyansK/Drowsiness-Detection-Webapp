//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const e = require("express");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
    secret:"hi",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

mongoose.connect("mongodb://0.0.0.0:27017/safedriveDB",{useNewUrlParser : true ,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const feedbackSchema = new mongoose.Schema({
    name : String,
    email : String,
    content : Array
});

const userSchema = new mongoose.Schema({
    email : String,
    password : String,
});

const userDataSchema = new mongoose.Schema({
    name : String,
    email : String,
    emails : Array,
});

userSchema.plugin(passportLocalMongoose);

const Feedback = mongoose.model("Feedback",feedbackSchema);
const User = mongoose.model("User",userSchema);
const UserDataSchema = mongoose.model("UserDataSchema" ,userDataSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route("/")
    .get(function(req,res){
        if(req.isAuthenticated()){
            UserDataSchema.findOne({email:req.user.username},function(err,newUser){
                if(err){
                    console.log(err);
                }else{
                    res.render("index",{username : newUser.name , emails:newUser.emails});
                }
            });
        }else{
            res.render("index",);
        }
        
    });

app.route("/demo")
    .get(function(req,res){
        if(req.isAuthenticated()){
            UserDataSchema.findOne({email:req.user.username},function(err,newUser){
                if(err){
                    console.log(err);
                }else{
                    res.render("demo",{username : newUser.name, emails:newUser.emails});
                }
            });
        }else{
            res.render("demo",);
        }
    });


app.route("/feedbackAc")
    .get(function(req,res){
        if(req.isAuthenticated()){
            UserDataSchema.findOne({email:req.user.username},function(err,newUser){
                if(err){
                    console.log(err);
                }else{
                    res.render("feedbackAc",{username : newUser.name, emails:newUser.emails});
                }
            });
        }else{
            res.render("feedbackAc",);
        }
    });

app.route("/contacts")
    .get(function(req,res){
        if(req.isAuthenticated()){
            UserDataSchema.findOne({email:req.user.username},function(err,newUser){
                if(err){
                    console.log(err);
                }else{
                    res.render("contacts",{username : newUser.name, emails:newUser.emails});
                }
            });
        }else{
            res.render("contacts",);
        }
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
        if(req.isAuthenticated()){
            UserDataSchema.findOne({email:req.user.username},function(err,newUser){
                if(err){
                    console.log(err);
                }else{
                    res.render("about",{username : newUser.name, emails:newUser.emails});
                }
            });
        }else{
            res.render("about",);
        }
    });

app.route("/login")
    .get(function(req,res){
        if(req.isAuthenticated()){
            UserDataSchema.findOne({email:req.user.username},function(err,newUser){
                if(err){
                    console.log(err);
                }else{
                    res.render("login",{username : newUser.name, emails:newUser.emails});
                }
            });
        }else{
            res.render("login",);
        }
    })
    .post(function(req,res){
        var username = req.body.username;
        var password = req.body.password;  
        var id;
        const user = new User({
            username: username,
            password: password
        });
        req.login(user,function(err){
            
            if(err){
                console.log(err);
            }else{
                passport.authenticate("local");
                id = user._id;
                res.redirect("/home?uID="+id);
            }
        })
    });

app.route("/home")
    .get(function(req,res){
        if(req.isAuthenticated()){
            console.log(req.user.username);
            UserDataSchema.findOne({email:req.user.username},function(err,newUser){
                if(err){
                    console.log(err);
                }else{
                    res.render("home",{username : newUser.name, emails:newUser.emails});
                }
            });
        }else{
            res.redirect("/create");
        }
    });

app.route("/create")
    .get(function(req,res){
        if(req.isAuthenticated()){
            UserDataSchema.findOne({email:req.user.username},function(err,newUser){
                if(err){
                    console.log(err);
                }else{
                    res.render("create",{username : newUser.name, emails:newUser.emails});
                }
            });
        }else{
            res.render("create");
        }
    })
    .post(function(req,res){

        var userName = req.body.name;
        var userEmail = req.body.username;
        var userPassword = req.body.password;
        var userNew_password = req.body.new_password;
        var userContact = req.body.phone;
        
        if(userPassword != userNew_password){
            console.log("Password doesn't match");
            res.redirect("/create");
        }

        User.register({username:userEmail} , userPassword , function(err,user){
            if(err){
                console.log(err);
                res.redirect("/create");
            }else{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/home?uID="+user._id);
                });

                const newUser = UserDataSchema({
                    name : userName,
                    email : userEmail,
                    emails : userContact,
                });
        
                newUser.save(function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("New user added");
                    }
                });
            }
        })
    });

app.route("/logout")
    .get(function(req,res){
        req.logout(function(err){
            if(err){
                console.log(err);
            }
        });
        req.session.destroy();
        res.redirect("/");
    });

app.listen(3000,function(req,res){
    console.log("Server Running!");
});