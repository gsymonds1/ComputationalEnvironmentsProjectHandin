#include <Servo.h>
/*
  NERF GUN SENTRY TURRET:
    *property of kang records*

  INSTRUCTIONS:
    LEDS:
      armed led : ~10
      trigger led : ~11
    TRIGGERSERVO:
      Y : ~9
      R : 5V
      Br: GND
    MOTORSERVO
      Y : ~5
      R : 5V
      Br: GND


*/
Servo servo;
Servo servo2;

//LEDS
int armedLED = 10;
int triggerLED = 11;
//SERVOS
int triggerServo = 9;
int motorServo = 5;

//serialsplit variables
const char marker = '\n'; //This is the end of message marker
char serialbuf[32]; //This gives the incoming serial some room. Change it if you want a longer incoming.

int serialRead1;
int serialRead2;

int intValue1;
int intValue2;



void setup() {
  Serial.begin(115200);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);

  servo.attach(triggerServo);
  servo2.attach(motorServo);
  
    //led test
  analogWrite(triggerLED, 255);  //10 written with 255
  delay(1000);
  analogWrite(triggerLED, 0);
}

void loop() {

  if(Serial.available()){
    String rxString = "";
    String strArr[2]; //Set the size of the array to equal the number of values you will be receiveing.
    //Keep looping until there is something in the buffer.
    while (Serial.available()) {
      //Delay to allow byte to arrive in input buffer.
      delay(2);
      //Read a single character from the buffer.
      char ch = Serial.read();
      
      //Append that single character to a string.
      rxString+= ch;
    }
    int stringStart = 0;
    int arrayIndex = 0;
    for (int i=0; i < rxString.length(); i++){
      //Get character and check if it's our "special" character.
      if(rxString.charAt(i) == ','){
        //Clear previous values from array.
        strArr[arrayIndex] = "";
        //Save substring into array.
        strArr[arrayIndex] = rxString.substring(stringStart, i);
        //Set new string starting point.
        stringStart = (i+1);
        arrayIndex++;
      }
    } 
    //Put values from the array into the variables.
    String value1 = strArr[0];
    String value2 = strArr[1];
    //Convert string to int if you need it.
    int intValue1 = value1.toInt();
    int intValue2 = value2.toInt();
  }

  Serial.print(intValue1);
  Serial.print(","); 
  Serial.println(intValue2) ;

  

      //LED ON/OFF STATES.      input 0 or 1
      if (intValue1 == 1) {
        servo2.write(180);
        analogWrite(triggerLED, 255);  //10 written with 255
        analogWrite(armedLED, 0);

        delay(1000);
        intValue1 = Serial.parseInt();
        //trigger shoot loop
        while (intValue1 == 1) {
          servo.write(180);
          delay(550);
          servo.write(5); 
          delay(550);
          intValue1 = Serial.parseInt();
        }

      } else {
        analogWrite(armedLED, 255); //11 written with 255
        analogWrite(triggerLED, 0);
        servo2.write(5);
      }

      

      delay(15);
    
  }







void triggerShoot(){

  
  
}
