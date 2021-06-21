
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
            console.log(left_eye.size());
            console.log(right_eye.size());
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