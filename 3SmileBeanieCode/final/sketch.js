let faceapi;
let detections = [];

let video;
let canvas;

let happyState = 0;

//for connecting to arduino
let port;
let connectBtn;
let triggerPulse =0; //if on shoot

//webcam selection
let list;
let selectedItem = -1;
let drop = false;
let itemY = [];
var deviceList = [];

function preload() {
  navigator.mediaDevices.enumerateDevices().then(getDevices);
}




class List { //menu

  constructor(x, y, w, h, itemH, txtSize) {
    this.x = 0;
    this.y = y;
    this.w = w;
    this.h = h;
    this.itemH = itemH;
    this.txtSize = txtSize;
    this.arrwX = this.x + this.w;
    this.arrwY = this.y;
    this.arrwH = this.h;
  }

  openVideoInput (videoSelected) {
    var constraints = {
      video: {
        deviceId: {
          exact: deviceList[videoSelected].id
        },
      }
    };
    video = createCapture(constraints);
    video.size(width, 270)
    faceapi = ml5.faceApi(video, detection_options, modelReady);   //tried to add here but  no work
  }

  press(mx, my) {
    // arrow touches
    if ((mx >= this.arrwX) && (mx <= this.arrwX+this.arrwH) && (my >= this.arrwY) && (my <= this.arrwY+this.arrwH)) {
      if (drop == true) {
        drop = false;
      } else {
        drop = true;
      }
    } // list touches
    if (drop) {
      if (deviceList.length > 0) {
        for (let j = 0; j < deviceList.length; j++) {
          if ((mx >= this.x) && (mx <= this.x + this.w) && (my >= itemY[j] ) && (my <= itemY[j] + this.itemH)) {
            selectedItem = j;
            console.log("selectedItem :", selectedItem);
            list.openVideoInput(selectedItem);
            drop = false;
          }
        }
      }
    }
  }
  
  displayFieldString(title) {
    fill(255); // background color
    rect(this.x, this.y, this.w, this.h);
    fill(0); // text color
    textSize(this.txtSize);
    text(title, this.x + 10, this.y + this.txtSize);
  }
  
  display() {
    if (selectedItem == -1) {
      this.displayFieldString("Select video input:");
    } else {
      this.displayFieldString(deviceList[selectedItem].label);
    }
    // arrow
    fill(255); // arrow background color
    rect(this.arrwX, this.arrwY, this.arrwH, this.arrwH);
    fill(0, 255, 0); // arrow color
    triangle(this.arrwX+5, this.arrwY+5, this.arrwX+this.arrwH-5, this.arrwY+5, this.arrwX+this.arrwH/2, this.arrwY+this.arrwH-5);
    // listItems
    if ((deviceList.length > 0) && (drop)) {
      for (let j = 0; j < deviceList.length; j++) {
        itemY[j] = (this.y + this.h) + j*this.itemH;
        fill(255);
        rect(this.x, itemY[j], this.w, this.itemH);
        fill(0);
        textSize(this.txtSize);
        text(deviceList[j].label, this.x + 10, itemY[j] + this.txtSize);
      }
    }
    if (!drop) {
      rect(this.x, this.y + this.h, this.w, 0);
    }
  }
}



function setup() {
  canvas = createCanvas(380, 370);
  canvas.id("canvas");

  video = createCapture(VIDEO);// Create the video: 
  video.id("video");
  video.size(width, height);

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.5
  };

  //Initialize the model: 
  faceapi = ml5.faceApi(video, faceOptions, faceReady);

  //connecting to arduino
  port = createSerial();
  // any other ports can be opened via a dialog after
  // user interaction (see connectBtnClick below)
  connectBtn = createButton('Connect to Arduino');
  connectBtn.position(10, 630);
 video.hide();
  connectBtn.mousePressed(connectBtnClick);

  list = new List(30, 30, 320, 24, 24, 16);
}

function faceReady() {
  faceapi.detect(gotFaces);// Start detecting faces:
}

// Got faces:
function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }

  detections = result;　//Now all the data in this detections: 
  // console.log(detections);

  //clear();//Draw transparent background;:
  image(video, 0,0, 350, 270) //dimension of second traced video
  
  drawBoxs(detections);//Draw detection box:
  drawLandmarks(detections);//// Draw all the face points: 
  drawExpressions(detections, 20, 250, 14);//Draw face expression: 

  faceapi.detect(gotFaces);// Call the function again at here: 
    
}

function drawBoxs(detections){
  if (detections.length > 0) {//If at least 1 face is detected: 
    for (f=0; f < detections.length; f++){
      let {_x, _y, _width, _height} = detections[f].alignedRect._box;
      stroke(44, 169, 225);
      strokeWeight(1);
      noFill();
      rect(_x, _y, _width, _height);
    }
  }
}

function drawLandmarks(detections){
  if (detections.length > 0) {//If at least 1 face is detected: 
    for (f=0; f < detections.length; f++){
      let points = detections[f].landmarks.positions;
      for (let i = 0; i < points.length; i++) {
        stroke(44, 169, 225);
        strokeWeight(3);
        point(points[i]._x, points[i]._y);
      }
    }
  }
}

function drawExpressions(detections, x, y, textYSpace){
  if(detections.length > 0){//If at least 1 face is detected: 
    let {neutral, happy, angry, sad, disgusted, surprised, fearful} = detections[0].expressions;
    textFont('Helvetica Neue');
    textSize(14);
    noStroke();
    fill(44, 169, 225);

    text("neutral:       " + nf(neutral*100, 2, 2)+"%", x, y);
    text("happiness: " + nf(happy*100, 2, 2)+"%", x, y+textYSpace);
    text("anger:        " + nf(angry*100, 2, 2)+"%", x, y+textYSpace*2);
    text("sad:            "+ nf(sad*100, 2, 2)+"%", x, y+textYSpace*3);
    text("disgusted: " + nf(disgusted*100, 2, 2)+"%", x, y+textYSpace*4);
    text("surprised:  " + nf(surprised*100, 2, 2)+"%", x, y+textYSpace*5);
    text("fear:           " + nf(fearful*100, 2, 2)+"%", x, y+textYSpace*6);


    list.display(); //wecbcam selection

    //determining Happiness + sending to serial port 2 arduino
    if (happy*100 > 50){ //HAPPY DETECTED
      fill(255,255,255);
      text("*sending smile thru serial", 18,18);
      happyState = 1;
      fill(44, 169, 225);

      if(frameCount%10==0){ //writing output to arduino
        port.write(happyState+'\n'); //finish with a newline character for Arduino recieving
        console.log("written 2 port: "+happyState);
      }

    } else { //NEUTRAL DETECTED
      fill(255,255,255);
      text("*sending neutral thru serial", 18,18);
      happyState = 0;
      fill(44, 169, 225);

      if(frameCount%10==0){ //writing output to arduino
        port.write(happyState+'\n'); //finish with a newline character for Arduino recieving
        console.log("written 2 port: "+happyState);
      }
    }


  // changes button label based on connection status
  if (!port.opened()) {
      connectBtn.html('Connect to Arduino');
    } else {
      connectBtn.html('Disconnect');
  }


  }else{//If no faces is detected: 
    text("neutral: ", x, y);
    text("happiness: ", x, y + textYSpace);
    text("anger: ", x, y + textYSpace*2);
    text("sad: ", x, y + textYSpace*3);
    text("disgusted: ", x, y + textYSpace*4);
    text("surprised: ", x, y + textYSpace*5);
    text("fear: ", x, y + textYSpace*6);
  }
}

function connectBtnClick() {
  if (!port.opened()) {
    port.open('Arduino', 57600);
  } else {
    port.close();
  }
  

}

function getDevices(devices) {

  for (let i = 0; i < devices.length; ++i) {
    let deviceInfo = devices[i];
    //Only get videodevices and push them into deviceList
    if (deviceInfo.kind == 'videoinput') {
      deviceList.push( {
      label:deviceInfo.label,
        id:deviceInfo.deviceId
      }
      );
    }
  }
}

function mousePressed() {
  list.press(mouseX, mouseY);
  
}