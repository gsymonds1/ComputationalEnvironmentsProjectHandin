import de.voidplus.leapmotion.*;

import themidibus.*;

// ======================================================
// Table of Contents:
// ├─ 1. Callbacks
// ├─ 2. Hand
// ├─ 3. Arms
// ├─ 4. Fingers
// ├─ 5. Bones
// ├─ 6. Tools
// └─ 7. Devices
// ======================================================


LeapMotion leap;


import processing.serial.*; // Import Serial library to talk to Arduino

int value;
int channel;


int fingerMod;
boolean noNote;
int notePlayed;
int finalNotePlayed;
int final2NotePlayed;
int final3NotePlayed;

MidiBus bus;
int velocity;
int note;

int noteState = 0;


Serial myPort; // Send new DMX channel value to Arduino //

void setDmxChannel(int channel, int value) { // Convert the parameters into a message of the form: 123c45w where 123 is the channel and 45 is the value // then send to the Arduino
  myPort.write( str(channel) + "c" + str(value) + "w" );
}



void setup() {
  size(800, 500);
  background(255);
  
  MidiBus.list(); 
  bus= new MidiBus(this, 0, 2);
  // ...

  leap = new LeapMotion(this);
}


// ======================================================


void draw() {
  background(255);
  text("KeyScape Terminal", 15,15);
  
  
  // ...

  int fps = leap.getFrameRate();
  for (Hand hand : leap.getHands ()) {


    // ==================================================
    // 2. Hand

    int     handId             = hand.getId();
    PVector handPosition       = hand.getPosition();
    //PVector handStabilized     = hand.getStabilizedPosition();
    //PVector handDirection      = hand.getDirection();
    //PVector handDynamics       = hand.getDynamics();
    //float   handRoll           = hand.getRoll();
    //float   handPitch          = hand.getPitch();
    //float   handYaw            = hand.getYaw();
    //boolean handIsLeft         = hand.isLeft();
    //boolean handIsRight        = hand.isRight();
    //float   handGrab           = hand.getGrabStrength();
    //float   handPinch          = hand.getPinchStrength();
    //float   handTime           = hand.getTimeVisible();
    //PVector spherePosition     = hand.getSpherePosition();
    //float   sphereRadius       = hand.getSphereRadius();

    // --------------------------------------------------
    // Drawing
    hand.draw();
    text(handId, 40, 120); 
    
    text("Y: "+ handPosition.y, 40, 220);
    text("X: "+ handPosition.x, 40, 240);
    text("Z: "+ handPosition.z, 40, 260);
    
    //Calculating note played: Using an invisible grid
    
    //GETTIN: X POSITION -> Into Note Played
    if (handPosition.x <= 143) { //1
      notePlayed = 1;
    } else if (handPosition.x > 143 && handPosition.x <= 286) { //2
      notePlayed = 2;
    } else if (handPosition.x > 286 && handPosition.x <= 429) { //3
      notePlayed = 3;
    } else if (handPosition.x > 429 && handPosition.x <= 572) { //4
      notePlayed = 4;
    } else if (handPosition.x > 572 && handPosition.x <= 715) { //5
      notePlayed = 5;
    } else if (handPosition.x > 715 && handPosition.x <= 858) { //6
      notePlayed = 6;
    } else if (handPosition.x > 858) { //7
      notePlayed = 7;
    }
  
    //POSITION OUTPUT
    text("notePlayed (*pos): "+ notePlayed, 40, 300);       
    println(handPosition.x);




    // ==================================================
    // 4. Finger


    for (Finger finger : hand.getFingers()) {
      // or              hand.getOutstretchedFingers();
      // or              hand.getOutstretchedFingersByAngle();

      int     fingerId         = finger.getId();
      PVector fingerPosition   = finger.getPosition();
      PVector fingerStabilized = finger.getStabilizedPosition();
      PVector fingerVelocity   = finger.getVelocity();
      PVector fingerDirection  = finger.getDirection();
      float   fingerTime       = finger.getTimeVisible();

      // ------------------------------------------------
      //Writing Finger txt

      switch(finger.getType()) {
      case 0:
         //System.out.println("thumb");
        break;
      case 1:
        // System.out.println("index");
        break;
      case 2:
        // System.out.println("middle");
        break;
      case 3:
        // System.out.println("ring");
        break;
      case 4:
        // System.out.println("pinky");
        break;
      }
      
      
      //FINGERS MOD:  Moding note played by amount of fingers extended
      
      int fingersOut = hand.getOutstretchedFingers().size();
      text("fingers extruded= "+fingersOut, 40, 330);  
      
      if (fingersOut == 0) {  //modifying note played no of fingers that are extended
          
        noNote = true;
      } else if (fingersOut == 1) {
        fingerMod = -2;
        noNote = false;
      } else if (fingersOut == 2) {
        fingerMod = -1;
        noNote = false;
      } else if (fingersOut == 3) {
        fingerMod = 0;
        noNote = false;
      } else if (fingersOut == 4) {
        fingerMod = 1;
        noNote = false;
      } else if (fingersOut == 5) {
        fingerMod = 2;
        noNote = false;
      } 
      
      finalNotePlayed = notePlayed + fingerMod;
      
      
       //NOTE OUTPUT
      text("finalnotePlayed (*fingers): "+ finalNotePlayed, 40, 360);  
      text("noNote"+ noNote, 40, 380);  
      
      //number translation matrix here// convertsnumebrs that are otside our range of 1 -7
       if (finalNotePlayed == 8){
         final2NotePlayed = 1;
       } else if (finalNotePlayed == 9){
         final2NotePlayed = 2;
       } else if (finalNotePlayed == 10){
         final2NotePlayed = 3;  
       } else if (finalNotePlayed == 0){
         final2NotePlayed = 7;
       } else if (finalNotePlayed == -1){
         final2NotePlayed = 6;
       } else if (finalNotePlayed == -2){
         final2NotePlayed = 5; 
       } else {
         final2NotePlayed = finalNotePlayed;
       }
      //end matrix  FinalNotePlayed can only equal [1 2 3 4 5 6 7]//
      
      text("final2notePlayed (*1-7range): "+ final2NotePlayed, 40, 400);  
      
     
      //convert to natual only keys
      if (final2NotePlayed == 1) {
        final3NotePlayed = 1;
      } else if (final2NotePlayed == 2) {
        final3NotePlayed = 3;
      } else if (final2NotePlayed == 3) {
        final3NotePlayed = 5;
      } else if (final2NotePlayed == 4) {
        final3NotePlayed = 6;
      } else if (final2NotePlayed == 5) {
        final3NotePlayed = 8;
      } else if (final2NotePlayed == 6) {
        final3NotePlayed = 10;
      } else if (final2NotePlayed == 7) {
        final3NotePlayed = 12;
      } else {
        final3NotePlayed = final2NotePlayed;
      }
      
      if (noNote == true){
        final3NotePlayed = 0;
      }
      //end of convertmatrix final3NotePlayed will ONLY EQUAL [1 3 5 6 8 10 12]
      
      //NOTE OUTPUT
      text("final3notePlayed (*fingers): "+ final3NotePlayed, 40, 420);  
      
      
      if (final3NotePlayed == 1 || final3NotePlayed == 3 || final3NotePlayed == 5 || final3NotePlayed == 6 || final3NotePlayed == 8 || final3NotePlayed == 10 || final3NotePlayed == 12){
        sendNote2MIDIBus();
      } else if (final3NotePlayed == 0){
        bus.sendNoteOff(0, note, velocity);
      }
      

      int     touchZone        = finger.getTouchZone();
      float   touchDistance    = finger.getTouchDistance();

      switch(touchZone) {
      case -1: // None
        break;
      case 0: // Hovering
        // println("Hovering (#" + fingerId + "): " + touchDistance);
        break;
      case 1: // Touching
        // println("Touching (#" + fingerId + ")");
        break;
      }
    }


    // ==================================================
    // 6. Tools

    for (Tool tool : hand.getTools()) {
      int     toolId           = tool.getId();
      PVector toolPosition     = tool.getPosition();
      PVector toolStabilized   = tool.getStabilizedPosition();
      PVector toolVelocity     = tool.getVelocity();
      PVector toolDirection    = tool.getDirection();
      float   toolTime         = tool.getTimeVisible();

      // ------------------------------------------------
      // Drawing:
      // tool.draw();

      // ------------------------------------------------
      // Touch emulation

      int     touchZone        = tool.getTouchZone();
      float   touchDistance    = tool.getTouchDistance();

      switch(touchZone) {
      case -1: // None
        break;
      case 0: // Hovering
        // println("Hovering (#" + toolId + "): " + touchDistance);
        break;
      case 1: // Touching
        // println("Touching (#" + toolId + ")");
        break;
      }
    }
  }


  // ====================================================
  // 7. Devices

  for (Device device : leap.getDevices()) {
    float deviceHorizontalViewAngle = device.getHorizontalViewAngle();
    float deviceVericalViewAngle = device.getVerticalViewAngle();
    float deviceRange = device.getRange();
  }

}

void sendNote2MIDIBus() {
  note = final3NotePlayed +59; //60+ starts 3 at C5 (home note)
  velocity= 60; //preset velocityj
  if (noteState == 0) {
    bus.sendNoteOn(0, note, velocity); // Sending to DAW
  }
 // delay(200);
  //bus.sendNoteOff(0, note, velocity);
  
}
