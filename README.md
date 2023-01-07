# DROWSINESS DETECTION WEBAPP

This WebApp prevents user from sleeping.

## Description

Motivation behind this project was to make long drives safe for drivers by 
alerting them if they are sleeping.

This project uses DeepLearing and Haar cascade classifiers to detect if the user is sleeping or not.
If found sleeping them a siren alerts them. If they still dont wake up then an alerting mail is send
to there contacts.

## Features

* Eye detection and sleeping monitoring.  
* User Login and Emergency contacts (Can use without creating an account though).
* User can add multiple emergency contacts.
* Siren to let user not sleep.
* If sleeping despite of siren then an email is sent to their contacts through smtp.
* Feedback form to get feedback from users.

## Screenshots

![alt text](https://github.com/SriyansK/Drowsiness-detection-webapp/blob/main/public/images/1.png?raw=true)
![alt text](https://github.com/SriyansK/Drowsiness-detection-webapp/blob/main/public/images/2.png?raw=true)
![alt text](https://github.com/SriyansK/Drowsiness-detection-webapp/blob/main/public/images/3.png?raw=true)
![alt text](https://github.com/SriyansK/Drowsiness-detection-webapp/blob/main/public/images/4.png?raw=true)
![alt text](https://github.com/SriyansK/Drowsiness-detection-webapp/blob/main/public/images/5.png?raw=true)
![alt text](https://github.com/SriyansK/Drowsiness-detection-webapp/blob/main/public/images/6.png?raw=true)
![alt text](https://github.com/SriyansK/Drowsiness-detection-webapp/blob/main/public/images/7.png?raw=true)
![alt text](https://github.com/SriyansK/Drowsiness-detection-webapp/blob/main/public/images/8.png?raw=true)
![alt text](https://github.com/SriyansK/Drowsiness-detection-webapp/blob/main/public/images/9.png?raw=true)

### Dependencies

* Nodejs , ExpressJS , bcrypt , MogoDB , OpenCV.js , Tensorflow.js , BodyParser , haar cascade classifiers , Keras.
* Windows 10

### Installing

* Download the respository.
* Add a less secure account to send emails.
    -public/js/eyes.js
        -sendEmail()
            -Email
            -Password

### Executing program

* How to run the program
* Step-by-step bullets
```
nodemon app.js
mongod
mongo
python -m http.server
```

## Authors

Contributors names and contact info
Sriyans


