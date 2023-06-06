let faceapi;
let video;
var capture;
let detections;
let camWidth;
let camHeight;
let xvar = 0;

//for connecting to arduino
let port;
let connectBtn;
let triggerPulse =0; //if on shoot



// by default all options are set to true
const detection_options = {
    withLandmarks: true,
    withDescriptors: false,
}

//detecting largest face
detectedfaceXwidth = [];
detectedfaceXpos = [];

//webcam selection
let list;
let selectedItem = -1;
let drop = false;
let itemY = [];
var deviceList = [];

function preload() {
    navigator.mediaDevices.enumerateDevices().then(getDevices);
}

class List {

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
    createCanvas(350, 370);
    background(10);

    camWidth = 350;
    camHeight = 270;


    
    
    // load up your video
    video = createCapture(VIDEO);
    video.size(width, 270); //dimension of cathing spots
    // video.hide(); // Hide the video element, and just show the canvas
    console.log("setupcomplete")
    faceapi = ml5.faceApi(video, detection_options, modelReady)
    textAlign(LEFT);

    //connecting to arduino
    port = createSerial();
    // any other ports can be opened via a dialog after
    // user interaction (see connectBtnClick below)
    connectBtn = createButton('Connect to Arduino');
    connectBtn.position(10, 630);
    connectBtn.mousePressed(connectBtnClick);

    list = new List(30, 30, 320, 24, 24, 16);
}




function modelReady() {
    console.log('ready!')
    console.log(faceapi)
    faceapi.detect(gotResults)
    

}

function gotResults(err, result) {
    if (err) {
        console.log(err)
        return
    }

     console.log(result)
    detections = result;

    // background(220);
    background(10);
    image(video, 0,0, 350, 270) //dimension of second traced video
    if (detections) {
        if (detections.length > 0) {
            // console.log(detections)
            drawBox(detections)
            drawLandmarks(detections)
        }

    }
    setupguideslines();
}


function drawBox(detections){
    for(let i = 0; i < detections.length; i++){
        const alignedRect = detections[i].alignedRect;
        console.log(detections[i]);
        const x = alignedRect._box._x
        const y = alignedRect._box._y
        const boxWidth = alignedRect._box._width
        const boxHeight  = alignedRect._box._height
        
        noFill();
        stroke(161, 95, 251);
        strokeWeight(2);
        
        stroke(255,0,0);
        rect(x, y, boxWidth, boxHeight); //da rectsangles on faces
        push();
            fill (10);
            text(alignedRect._box._width,x,y); //print head width
        pop();



        //xvar = x+(boxWidth/2) //saves the last x value of target to xvar
        
        xvar = alignedRect._box._x+(boxWidth/2) //
        
        if (detections.length >1){
            console.log("MULTIPLE TARGETS DECTECTED");

            for (t = 0; t < detections.length; t++){  //get size of all faces save 2 array
                detectedfaceXwidth[t] = detections[t].alignedRect._box._width
                detectedfaceXpos[t] = detections[t].alignedRect._box._x
            }

            //get largest array
            var max = Math.max(...detectedfaceXwidth);

            const bigHeadIndex = detectedfaceXwidth.indexOf(max);
            console.log("biggest head: "+bigHeadIndex+ ": " + detectedfaceXwidth[bigHeadIndex]); // 👉️ 3
            xvar = detections[bigHeadIndex].alignedRect._box._x+(boxWidth/2)

        }

        

    }

    
}

function setupguideslines(){
 

    list.display(); //wecbcam selection
    

    stroke(255,255,0);
    
    triggerPulse = 0;
    if (xvar > 160 && xvar < 190){
        stroke(255,0,0);
        //SHOOT HERE -> send to p5

        triggerPulse = 1;
    }

    



    rect((xvar)-7,(camHeight/2)-7,14,14);//target point  (modify this to tagret largest sqaure)  - link to largest square

    push();
    stroke (0)
    
    line(camWidth/2,0,camWidth/2,camHeight); //x-y!,x-y! midpoint

    line(xvar,camHeight/2,camWidth/2,camHeight/2);//correction line

    pop();


    //OUTPUT TEXT  (175 is midpoint)
    push();
    stroke (100);
    fill(255);
    text ("xVar = "+ xvar,10,camHeight + 20);

    let rCorrection = parseInt(175 - xvar);

    text ("x(r).Correction = "+ rCorrection,10,camHeight + 40);
    pop();
    


    if(frameCount%10==0){ //writing output to arduino
        port.write(triggerPulse+","+rCorrection+'\n'); //finish with a newline character for Arduino recieving
       console.log("Serial Print: "+triggerPulse+","+rCorrection);
    }

    // changes button label based on connection status
    if (!port.opened()) {
        connectBtn.html('Connect to Arduino');
      } else {
        connectBtn.html('Disconnect');
    }



    faceapi.detect(gotResults);
}



function drawLandmarks(detections){
    /*
    noFill();
    stroke(161, 95, 251)
    strokeWeight(2)

    for(let i = 0; i < detections.length; i++){
        const mouth = detections[i].parts.mouth; 
        const nose = detections[i].parts.nose;
        const leftEye = detections[i].parts.leftEye;
        const rightEye = detections[i].parts.rightEye;
        const rightEyeBrow = detections[i].parts.rightEyeBrow;
        const leftEyeBrow = detections[i].parts.leftEyeBrow;

        drawPart(mouth, true);
        drawPart(nose, false);
        drawPart(leftEye, true);
        drawPart(leftEyeBrow, false);
        drawPart(rightEye, true);
        drawPart(rightEyeBrow, false);

    }
    */
}

function drawPart(feature, closed){
    /*
    beginShape();
    for(let i = 0; i < feature.length; i++){
        const x = feature[i]._x
        const y = feature[i]._y
        vertex(x, y)
    }
    
    if(closed === true){
        endShape(CLOSE);
    } else {
        endShape();
    }
    */
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
