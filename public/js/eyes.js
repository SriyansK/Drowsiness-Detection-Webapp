async function loadTfModel(){
    let m = tf.loadLayersModel("../tf_model/model.json"); 
    console.log("Model Loaded!");
    return m;
}
let model = loadTfModel();
var curr_user = $(".curr_user").attr("data-curr_user");
var ph_nums = $(".ph_nums").attr("data-ph_nums");

var total_email = new Array;
var temp_string = new String;

for (var i=0; i<ph_nums.length;i++){
    if(ph_nums[i]===','){
        total_email.push(temp_string);
        temp_string="";
    }else{
        temp_string+=ph_nums[i];
    }
};

var body = curr_user + " is drowsy please inform."
function sendEmail(){
    for(var i=0;i<total_email.length;i++){
        var reciever_email = total_email[i];
        Email.send({
            Host : "",
            Username : "",
            Password : "",
            To : reciever_email,
            From : "",
            Subject : "Emergency Alert!!!",
            Body : body
        }).then(
          message => {
              if(message === "OK"){
                  console.log("Message Sent");
              }else{
                  console.log(message);
              }
          }
        );
    };
}

function openCvReady() {
    let video = document.getElementById("cam_input");
    var audio = new Audio("../sounds/siren.wav");
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function (err) {
            console.log("An error occurred! " + err);
        });
    
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    let gray = new cv.Mat();
    let cap = new cv.VideoCapture(cam_input);

    let left_eye = new cv.RectVector();
    let right_eye = new cv.RectVector();

    let classifier_left = new cv.CascadeClassifier();
    let classifier_right = new cv.CascadeClassifier();

    let utils = new Utils('errorMessage');
    let leftCascadeFile = 'haarcascade_lefteye_2splits.xml'; 
    let rightCascadeFile = 'haarcascade_righteye_2splits.xml';

    utils.createFileFromUrl(leftCascadeFile, leftCascadeFile, () => {
        classifier_left.load(leftCascadeFile); 
    });
    utils.createFileFromUrl(rightCascadeFile, rightCascadeFile, () => {
        classifier_right.load(rightCascadeFile);
    });

    const FPS = 24;

    var check = new Array;
    
    function gen_alert(){
        
        var l=check.length;
        var cnt=0;
        console.log(l);
        for(var i=0;i<l;i++){
            if(check[i]===0){
                cnt++;
            }
        }
    
        cnt = cnt*100;
        cnt/=l;
    
        if(cnt>=75){
            $(".alert").text("Sending Alert!!!");
            console.log("Alert!!!");
            sendEmail();
        }else{
            console.log("Fine");
        }
    
        check = [];
    }

    function processVideo() {

        let begin = Date.now();
        cap.read(src);
        src.copyTo(dst);
        cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);

        try {
            classifier_left.detectMultiScale(gray, left_eye, 1.1, 3, 0);
            classifier_right.detectMultiScale(gray, right_eye, 1.1, 3, 0);
        } catch (err) {
            console.log(err);
        }

        for (let i = 0; i < Math.min(left_eye.size(),right_eye.size()); ++i) {

            let le = left_eye.get(i);
            let re = right_eye.get(i);

            
            let point1 = new cv.Point(le.x, le.y);
            let point2 = new cv.Point(le.x + le.width, le.y + le.height);

            cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);

            point1 = new cv.Point(re.x, re.y);
            point2 = new cv.Point(re.x + re.width, re.y + re.height);

            cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);

            let canvas = document.getElementById("canvas_output");
            let ctx = canvas.getContext('2d');
            let imgData = ctx.getImageData(re.x, re.y, re.width, re.height);
            // console.log(imgData);
            model.then(function (res) {
                const example = tf.browser.fromPixels(imgData,1)
                .resizeNearestNeighbor([24,24])
                .toFloat()
                .div(tf.scalar(255.0))
                .expandDims();
                const prediction = res.predict(example);
                const yourClass = prediction.argMax(-1).dataSync()[0];
                check.push(yourClass);
                if(yourClass === 1){
                    $(".result").text("Awake")
                   
                }else{
                    $(".result").text("Sleeping")
                    audio.play();
                }

            }, function (err) {
                console.log(err);
            });
            imgData = ctx.getImageData(le.x,le.y,le.width,le.height);
            model.then(function (res) {
                const example = tf.browser.fromPixels(imgData,1)
                .resizeNearestNeighbor([24,24])
                .toFloat()
                .div(tf.scalar(255.0))
                .expandDims();
                const prediction = res.predict(example);
                const yourClass = prediction.argMax(-1).dataSync()[0];
                check.push(yourClass);
                if(yourClass === 1){
                    $(".result").text("Awake")
                }else{
                    $(".result").text("Sleeping")
                    audio.play();
                }

            }, function (err) {
                console.log(err);
            });
        }
        // schedule next one.
        cv.imshow("canvas_output",dst);
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
    // schedule first one.
    setTimeout(processVideo, 0);
    setInterval(gen_alert,10000);
}

openCvReady();