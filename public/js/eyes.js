
async function loadTfModel(){
    const model = tf.loadLayersModel("../tf_model/model.json"); 
    console.log(model);
    console.log("Model Loaded!");
}
loadTfModel();

function openCvReady() {
    let video = document.getElementById("cam_input"); // video is the id of video tag
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
    let leftCascadeFile = 'haarcascade_lefteye_2splits.xml'; // path to xml
    let rightCascadeFile = 'haarcascade_righteye_2splits.xml';

    utils.createFileFromUrl(leftCascadeFile, leftCascadeFile, () => {
        classifier_left.load(leftCascadeFile); // in the callback, load the cascade from file 
    });
    utils.createFileFromUrl(rightCascadeFile, rightCascadeFile, () => {
        classifier_right.load(rightCascadeFile); // in the callback, load the cascade from file 
    });

    const FPS = 24;

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

            let left_output=0,right_output=0;

            let le = left_eye.get(i);
            let re = right_eye.get(i);

            let point1 = new cv.Point(le.x, le.y);
            let point2 = new cv.Point(le.x + le.width, le.y + le.height);

            cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);

            point1 = new cv.Point(re.x, re.y);
            point2 = new cv.Point(re.x + re.width, re.y + re.height);

            cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
            
            /*let new_dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
            src.copyTo(new_dst);
            let rect = new cv.Rect(re.x, re.y,re.x + re.width, re.y + re.height);
            let right_img = new cv.Mat();
            right_img = new_dst.roi(rect);
            let r_ts = tf.browser.fromPixels(right_img,3)
                .resizeNearestNeighbor([24,24])
                .toFloat()
                .div(tf.scalar(255.0))
                .expandDims();
            right_output = model.predict(r_ts).data();
            console.log(right_output);
            let right_img = src;

            let l_ts = tf.browser.fromPixels(left_img,3)
                .resizeNearestNeighbor([24,24])
                .toFloat()
                .div(tf.scalar(255.0))
                .expandDims();
            console.log(l_ts);
            

            left_output =  await model.predict(l_ts).data();
            
            
            if(left_output==0 || right_output==0)
                $("h3").text("CLOSED");
            else
                $("h3").text("OPEN");*/
        }

        cv.imshow("canvas_output", dst);
        // schedule next one.
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
    // schedule first one.
    setTimeout(processVideo, 0);
}

openCvReady();