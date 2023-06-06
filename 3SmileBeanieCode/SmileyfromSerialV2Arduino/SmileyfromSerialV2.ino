#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_PCD8544.h>

/*
  SMILEYBEANIE (prototype):
    *property of kang records*

  PIN IN INSTRUCTIONS (Arduino Nano 33 BLE Sense):
    LEDS:
      neutral led : ~A2
      trigger led : ~A0
    NOKIA LCD 5110 Display:
      RST : 12
      CE : 11
      DC: 10
      DIN: 9
      CLK: 8
      VCC: 3.3v
      LIGHT: GND
      GND: GND
*/
// Adafruit_PCD8544(CLK,DIN,D/C,CE,RST);
Adafruit_PCD8544 display = Adafruit_PCD8544(8, 9, 10, 11, 12);

//int analogValue = 0;//potentiometer
int serialValue=0;
bool smile = true;
int runState = 1;

void setup() {
  Serial.begin(115200);
  //pinMode(A7, INPUT);//potentiometer
  //Indicator LEDs 
  pinMode(A0, OUTPUT); //happy
  pinMode(A2, OUTPUT); // neutral
  pinMode(A4, OUTPUT);

	//Initialize LCD Display
	display.begin();

	// you can change the contrast around to adapt the display for the best viewing!
	display.setContrast(57);

	// Clear the buffer.
	display.clearDisplay();


}

void loop() {
  // Read serial input:
  if (Serial.available() > 0) { //if serial is available
    serialValue = Serial.parseInt(); //convert the String to an int
  
    analogWrite(A4,255);// serial ON indicaton
  }

  //serialValue = 1;

delay(10);
  //Updating Emotion on face
  //Serial.println(serialValue);
  if (serialValue == 1){  // AKA if (smile == true) {
    analogWrite(A0,255);
    analogWrite(A2,0);
    //smile detected
    drawSmile();
  } else if (serialValue == 0){
    //no smile detected
    analogWrite(A2,255);
    analogWrite(A0,0);
    drawNoSmile();
  }
}

void drawSmile() {
  // Clear the buffer.
  display.clearDisplay();

  // Displaying :)
  display.setRotation(3);
  display.setTextColor(BLACK);
  display.setCursor(7,30);
  display.setTextSize(3);
  display.println(":)"); // PRINT :)
  display.display();
  //Serial.println("Smile");

  runState = 1;
}

void drawNoSmile() {
  // Clear the buffer.
  display.clearDisplay();

  // Displaying :|
  display.setRotation(3);
  display.setTextColor(BLACK);
  display.setCursor(7,30);
  display.setTextSize(3);
  display.println(":|");  //PRINT :|
  display.display();
  //Serial.println("No Smile");

  runState = 2;
}
