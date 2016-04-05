// Info:
// You can scroll the mouse wheel to zoom in and out in the browser
// You can click on the scene/canvas with your mouse and view the objects from different angles


// Open issue:
// There is a sudden flip of the ball when it hits the wall, or any other ball, because of the change of the rotation axis.
// The rotation axis is recalculated at each collision event (with wall or ball) by defining an 'up' vector = (0, 1, 0) and crossing it with the reflected speed vector.

// Things I tried: 

// (a) I tried storing the previous axis of rotation, before collision and calculate the angle between it and the new axis(using dot product). 
//     Then I rotated back the ball in different directions with the angle I found, but still could not solve the issue. 

// (b) I tried also to change the damping coefficients to maybe have a smaller magnitude transition at collisions, but it did not help (since velocity changes direction).

// (c) I also tried to use a 'collisionFlag' that tells me if the collision takes place or not and I disabled rotation at the moment of collision, or set the rolling angle to zero at that moment, or
//     negated the rotation axis. Nothing worked.
//------------------------------------------------------------------------------------------------------

//* Initialize webGL with camera and lights
var canvas = document.getElementById("mycanvas");
var renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor('rgb(255,255,255)');
renderer.shadowMap.enabled = true;
// Create scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight,
  0.1, 1000);
camera.position.z = 3;
camera.position.y = 2;

// Add lights
var ambientLight = new THREE.AmbientLight(0x707070);
scene.add(ambientLight);
var light = new THREE.SpotLight(0xffffff);
light.position.set(0, 3, 0); // directly on top of the table
light.castShadow = true;
light.shadowCameraNear = 0.1;
light.shadowCameraFar = 40;
light.shadowDarkness = 0.3;
scene.add(light);

// Add sun at position of spotlight
var sun = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32),
  new THREE.MeshPhongMaterial({
    color: "black",
    emissive: "yellow"
  }));
sun.position.copy(light.position);
scene.add(sun);

// Add the ground
var groundMat = new THREE.MeshPhongMaterial({
  color: "lime",
  side: THREE.DoubleSide
});
groundMat.transparent = true;
groundMat.opacity = 0.5;
var groundGeo = new THREE.PlaneGeometry(20, 20);
var ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);


// Build the table:
var table = new THREE.Object3D();
var tablePlateWidth = 1.5;
var tablePlateLength = 2.5;
var tablePlateHeight = 0.05;
var tablePlateHeightFromGround = 0.55;

// Add the table plate (as in "Tischplatte") to the table
var tablePlateMat = new THREE.MeshPhongMaterial({
  color: "green"
});
var tablePlateGeo = new THREE.BoxGeometry(tablePlateWidth, tablePlateHeight, tablePlateLength);
var tablePlate = new THREE.Mesh(tablePlateGeo, tablePlateMat);
tablePlate.castShadow = true;
tablePlate.position.y = tablePlateHeightFromGround;
tablePlate.receiveShadow = true;

table.add(tablePlate);

//------------------------------------------------------------------------------------------------------


var longBorderWidth = 0.1;
var longBorderHeight = 0.1;
var longBorderLength = tablePlateLength;

var longBorderMat = new THREE.MeshPhongMaterial({
  color: "green"
});
var LongBorderGeo = new THREE.BoxGeometry(longBorderWidth, longBorderHeight, longBorderLength);

var leftBorder = new THREE.Mesh(LongBorderGeo, longBorderMat);
leftBorder.position.y = tablePlateHeightFromGround + tablePlateHeight;
leftBorder.position.x = -tablePlateWidth / 2 + longBorderWidth / 2;
leftBorder.castShadow = true;



var rightBorder = leftBorder.clone();
rightBorder.position.y = tablePlateHeightFromGround + tablePlateHeight;
rightBorder.position.x = tablePlateWidth / 2 - longBorderWidth / 2;
rightBorder.castShadow = true;


table.add(leftBorder);
table.add(rightBorder);


//-------------------------------------------------------------------------------------------------------

var shortBorderWidth = tablePlateWidth;
var shortBorderHeight = 0.1;
var shortBorderLength = 0.1;

var shortBorderMat = new THREE.MeshPhongMaterial({
  color: "green"
});
var shortBorderGeo = new THREE.BoxGeometry(shortBorderWidth, shortBorderHeight, shortBorderLength);

var closeBorder = new THREE.Mesh(shortBorderGeo, shortBorderMat);

closeBorder.position.y = tablePlateHeightFromGround + tablePlateHeight;
closeBorder.position.z = tablePlateLength / 2 - shortBorderLength / 2;
closeBorder.castShadow = true;

var farBorder = closeBorder.clone();
farBorder.position.y = tablePlateHeightFromGround + tablePlateHeight;
farBorder.position.z = -tablePlateLength / 2 + shortBorderLength / 2;
farBorder.castShadow = true;

table.add(closeBorder);
table.add(farBorder);



//-------------------------------------------------------------------------------------------------------

var legMat = new THREE.MeshPhongMaterial({
  color: "brown"
});
var legWidth = 0.1;
var legGeo = new THREE.BoxGeometry(legWidth, tablePlateHeightFromGround, legWidth);

var nearRightLeg = new THREE.Mesh(legGeo, legMat);
nearRightLeg.castShadow = true;

nearLeftLeg = nearRightLeg.clone();
farLeftLeg = nearRightLeg.clone();
farRightLeg = nearRightLeg.clone();


nearRightLeg.position.x += tablePlateWidth / 2 - legWidth;
nearRightLeg.position.y += tablePlateHeightFromGround / 2;
nearRightLeg.position.z += tablePlateLength / 2 - legWidth;
table.add(nearRightLeg);


nearLeftLeg.position.x += -tablePlateWidth / 2 + legWidth;
nearLeftLeg.position.y += tablePlateHeightFromGround / 2;
nearLeftLeg.position.z += tablePlateLength / 2 - legWidth;
table.add(nearLeftLeg);


farLeftLeg.position.x += -tablePlateWidth / 2 + legWidth;
farLeftLeg.position.y += tablePlateHeightFromGround / 2;
farLeftLeg.position.z += -tablePlateLength / 2 + legWidth;
table.add(farLeftLeg);


farRightLeg.position.x += tablePlateWidth / 2 - legWidth;
farRightLeg.position.y += tablePlateHeightFromGround / 2;
farRightLeg.position.z += -tablePlateLength / 2 + legWidth;
table.add(farRightLeg);


//-------------------------------------------------------------------------------------------------------
// To create some decoration stripes on the sides of the table:

var createRectangle = function(rectangleWidth, rectangleLength, color) {
  var rectangleGeometry = new THREE.Geometry();

  rectangleGeometry.vertices[0] = new THREE.Vector3(-rectangleWidth / 2, 0, 0);
  rectangleGeometry.vertices[1] = new THREE.Vector3(-rectangleWidth / 2, rectangleLength, 0);
  rectangleGeometry.vertices[2] = new THREE.Vector3(rectangleWidth / 2, 0, 0);
  rectangleGeometry.vertices[3] = new THREE.Vector3(rectangleWidth / 2, rectangleLength, 0);
  rectangleGeometry.vertices[4] = new THREE.Vector3(-rectangleWidth / 2, rectangleLength, 0);
  rectangleGeometry.vertices[5] = new THREE.Vector3(rectangleWidth / 2, 0, 0);

  var mat = new THREE.MeshPhongMaterial({
    color: color,
    wireframe: false,
    wireframeLinewidth: 2
  });

  rectangleGeometry.faces[0] = new THREE.Face3(0, 2, 1);
  rectangleGeometry.faces[1] = new THREE.Face3(3, 4, 5);
  rectangleGeometry.faces[2] = new THREE.Face3(0, 1, 2);
  rectangleGeometry.faces[3] = new THREE.Face3(3, 5, 4);

  var rectangle = new THREE.Mesh(rectangleGeometry, mat);
  return rectangle;
}

//-------------------------------------------------------------------------------------------------------

var smallOffset = 0.003;

var frontDecorationStripe = createRectangle(tablePlateHeight, tablePlateWidth, 0x000000);
var backDecorationStripe = frontDecorationStripe.clone();

frontDecorationStripe.position.x += tablePlateWidth / 2;
frontDecorationStripe.position.y += tablePlateHeightFromGround;
frontDecorationStripe.position.z += tablePlateLength / 2 + smallOffset;
frontDecorationStripe.rotation.z += Math.PI / 2;
table.add(frontDecorationStripe);

backDecorationStripe.position.x += tablePlateWidth / 2;
backDecorationStripe.position.y += tablePlateHeightFromGround;
backDecorationStripe.position.z += -tablePlateLength / 2 - smallOffset;
backDecorationStripe.rotation.z += Math.PI / 2;
table.add(backDecorationStripe);


var leftDecorationStripe = createRectangle(tablePlateHeight, tablePlateLength, 0x000000);
var rightDecorationStripe = leftDecorationStripe.clone();

leftDecorationStripe.position.x += -tablePlateWidth / 2 - smallOffset;
leftDecorationStripe.position.y += tablePlateHeightFromGround;
leftDecorationStripe.position.z += tablePlateLength / 2;
leftDecorationStripe.rotation.z += Math.PI / 2;
leftDecorationStripe.rotation.y += -Math.PI / 2;
table.add(leftDecorationStripe);


rightDecorationStripe.position.x += tablePlateWidth / 2 + smallOffset;
rightDecorationStripe.position.y += tablePlateHeightFromGround;
rightDecorationStripe.position.z += tablePlateLength / 2;
rightDecorationStripe.rotation.z += Math.PI / 2;
rightDecorationStripe.rotation.y += -Math.PI / 2;
table.add(rightDecorationStripe);
//-------------------------------------------------------------------------------------------------------

var ballRadius = 0.05;
var nrOfBalls = 8;
var ballGeo = new THREE.SphereGeometry(ballRadius, 32, 32);


var balls = [];


var ballTxt = []; // Texture array
for (var i = 0; i < nrOfBalls; i++) {
  var ballNr = i + 8;
  var fileName = "textures/Ball" + ballNr + ".jpg";
  ballTxt[i] = THREE.ImageUtils.loadTexture(fileName);
  ballTxt[i].minFilter = THREE.LinearFilter;
  balls[i] = new THREE.Mesh(ballGeo, new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x00ffff // cyan 
    // map: ballTxt[i] 
    
    // Important! If you decide to enable textures for more realistic graphics, please first read this post "https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally" and 
    // setup your browser accordingly, then set wireframe parameter from 4 lines above to false and finally uncomment the line 'map: ballTxt[i]' and comment 'color: 0x00ffff'
    // If you do not set up your browser correctly, the textures will not be loaded, and you will not see rotations, but rather only translations
  }));

}



for (var i = 0; i < nrOfBalls; i++) {
  
  balls[i].speed = new THREE.Vector3(Math.random(), 0, Math.random());
  balls[i].initPos = new THREE.Vector3(0, ballRadius + tablePlateHeight, i * ballRadius * 2.5); // i * ballRadius * 2.5 : to make sure balls don't overlap initially
  balls[i].rotAxis = new THREE.Vector3(0, 1, 0); // equal to default 'balls[i].up' Object3D parameter in three.js library
  balls[i].rotAxis.cross(balls[i].speed).normalize();
  balls[i].omega = balls[i].speed.length() / ballRadius; // angular velocity
  balls[i].matrixAutoUpdate = false; // use .matrix parameter; ignore rotation and position parameters
  balls[i].currentPosition = balls[i].initPos;
  balls[i].theta = 0; // rolling angle
  balls[i].previousDistanceArray = []; // used to avoid balls gluing together
   

}




//------------------------------------------------------------------------------------------------------


for (var i = 0; i < nrOfBalls; i++) {
  tablePlate.add(balls[i]); 
}

//-------------------------------------------------------------------------------------------------------
// Damping coefficients:
var rollFriction = 0.2;
var wallCollisionDamping = 0.2;
var ballCollisionDamping = 0.3;

//------------------------------
var distance = new THREE.Vector3(); // distance vector between 2 balls
var distanceSquared; // to increase the efficiency and speed of calculations ( used in reflectBalls() function)

var u1par = new THREE.Vector3(); // parallel component of incoming velocity of first colliding ball
var u1perp = new THREE.Vector3(); // perpendicular component of incoming velocity of first colliding ball

var u2par = new THREE.Vector3(); // parallel component of incoming velocity of second colliding ball
var u2perp = new THREE.Vector3(); // perpendicular component of incoming velocity of second colliding ball

var ballToReflectPositionVector = new THREE.Vector3();
var ball_i_PositionVector = new THREE.Vector3(); // the position of the other colliding ball, that collides with ballToReflect (see function below)

//-------------------------------------


// Store the initial distances between balls (square of the distance for more efficiency):

for (var i = 0; i < nrOfBalls - 1; i++) { // there is no need to take into account the last ball because same distance is calculated from ball 6 to ball 7
  for (var j = i + 1; j < nrOfBalls; j++) { // start j at i + 1 to avoid redundant calculations
    distance.subVectors(balls[j].currentPosition, balls[i].currentPosition);
    balls[i].previousDistanceArray[j] = distance.lengthSq(); // store distance squared to avoid taking square root
  }
}


var reflectBalls = function(ballToReflect, startIndex) { // function is called 7 times(see in setInterval() below) for balls[0},...,balls[6] (no need for ball 7)
                                                         // Therefore, in total, for all balls, the following 'for' loop will execute 28 times (and not 7*7 = 49)

                                                       
  for (var i = startIndex + 1; i < nrOfBalls; i++) { // startIndex used to avoid redundant calculations; ex: distance from ball 2 to ball 1 is unnecessary to calculate because the distance from ball 1 to ball 2
                                                     // has already been calculated.  

    ballToReflectPositionVector = ballToReflect.currentPosition;

    ball_i_PositionVector = balls[i].currentPosition;

    distance.subVectors(ball_i_PositionVector, ballToReflectPositionVector); // distance vector is just the subtraction of the position vectors of the 2 balls


    distanceSquared = distance.lengthSq(); // needed at the end of the function


    if ((distanceSquared <= 4 * ballRadius * ballRadius) && (ballToReflect.previousDistanceArray[i] > distanceSquared)) {// Check if the distance is smaller than 2*ballRadius in a more calculation efficient way 
                                                                                                                         // Check also if balls move towards each other to avoid gluing effect

      
      distance.normalize();

      u1par = distance.clone().multiplyScalar(distance.dot(ballToReflect.speed)); // .clone() here is very important
      u1perp.subVectors(ballToReflect.speed, u1par);

      u2par = distance.clone().multiplyScalar(distance.dot(balls[i].speed));
      u2perp = u2perp.subVectors(balls[i].speed, u2par);

      // The resulting velocities keep the perpendicular components of the incoming velocities, but swap the parallel components:
      ballToReflect.speed.addVectors(u2par, u1perp);
      balls[i].speed.addVectors(u1par, u2perp);


      ballToReflect.speed.multiplyScalar(1-ballCollisionDamping); // To achieve 30% speed loss at ball-ball collision
      balls[i].speed.multiplyScalar(1-ballCollisionDamping);


      //recalculate axis of rotation:
      balls[i].rotAxis = new THREE.Vector3(0, 1, 0); 
      balls[i].rotAxis.cross(balls[i].speed).normalize(); 


      //recalculate axis of rotation for the other ball:
      ballToReflect.rotAxis = new THREE.Vector3(0, 1, 0); 
      ballToReflect.rotAxis.cross(ballToReflect.speed).normalize(); 


    }

    ballToReflect.previousDistanceArray[i] = distanceSquared; // update the distance array to see later(at next time, aka: current time + dt) that the two balls move away from each other, 
                                                              // in case the distance is still 2*ballRadius between them. 

  }

}



var dt = 0.016; // time step = 1/60Hz = approximately 16 ms

setInterval(function() {
  
  
  for (var i = 0; i < nrOfBalls; i++) {
    balls[i].speed.multiplyScalar(1 - rollFriction * dt); // to achieve 20% speed loss each second
  }


  reflectBalls(balls[0], 0);
  reflectBalls(balls[1], 1);
  reflectBalls(balls[2], 2);
  reflectBalls(balls[3], 3);
  reflectBalls(balls[4], 4);
  reflectBalls(balls[5], 5);
  reflectBalls(balls[6], 6);
  // No need to do reflectBalls(balls[7], 7)

  for (var i = 0; i < nrOfBalls; i++) {
    balls[i].collisionFlag = false;

    if (balls[i].currentPosition.x + ballRadius >= tablePlateWidth / 2 - longBorderWidth) {

      balls[i].speed.x = -Math.abs(balls[i].speed.x); // do not simply invert the x component to avoid gluing problems

      balls[i].speed.multiplyScalar(1-wallCollisionDamping);  // speed loss of 20% at collision with wall

      
      //recalculate axis of rotation:
      balls[i].rotAxis = new THREE.Vector3(0, 1, 0); 
      balls[i].rotAxis.cross(balls[i].speed).normalize(); 



    }


    if (balls[i].currentPosition.x - ballRadius <= -tablePlateWidth / 2 + longBorderWidth) {

      balls[i].speed.x = Math.abs(balls[i].speed.x); // do not simply invert the x component to avoid gluing problems

      balls[i].speed.multiplyScalar(1-wallCollisionDamping); // speed loss of 20% at collision with wall

      //recalculate axis of rotation:      
      balls[i].rotAxis = new THREE.Vector3(0, 1, 0); 
      balls[i].rotAxis.cross(balls[i].speed).normalize(); 



    }

    if (balls[i].currentPosition.z + ballRadius >= tablePlateLength / 2 - shortBorderLength) {

      balls[i].speed.z = -Math.abs(balls[i].speed.z); // do not simply invert the z component to avoid gluing problems

      balls[i].speed.multiplyScalar(1-wallCollisionDamping); // speed loss of 20% at collision with wall

      
      //recalculate axis of rotation:
      balls[i].rotAxis = new THREE.Vector3(0, 1, 0); 
      balls[i].rotAxis.cross(balls[i].speed).normalize(); 



    }


    if (balls[i].currentPosition.z - ballRadius <= -tablePlateLength / 2 + shortBorderLength) {

      balls[i].speed.z = Math.abs(balls[i].speed.z); // do not simply invert the z component to avoid gluing problems

      balls[i].speed.multiplyScalar(1-wallCollisionDamping); // speed loss of 20% at collision with wall

      
      //recalculate axis of rotation:
      balls[i].rotAxis = new THREE.Vector3(0, 1, 0); 
      balls[i].rotAxis.cross(balls[i].speed).normalize(); 



    }


    // Make translation
    balls[i].currentSpeed = balls[i].speed.clone();
    balls[i].currentPosition = balls[i].currentPosition.add(balls[i].currentSpeed.multiplyScalar(dt));
    balls[i].transMat = new THREE.Matrix4();
    balls[i].transMat.makeTranslation(balls[i].currentPosition.x, balls[i].currentPosition.y, balls[i].currentPosition.z);
   

    // Make rotation
    balls[i].omega = balls[i].speed.length() / ballRadius;
    balls[i].theta += balls[i].omega * dt;
    balls[i].rotMat = new THREE.Matrix4();
    balls[i].rotMat.makeRotationAxis(balls[i].rotAxis, balls[i].theta); // rotAxis was calculated only at collision events
    

    balls[i].matrix.multiplyMatrices(balls[i].transMat, balls[i].rotMat); // order of matrix multiplication matters

  }

}, dt*1000); // *1000 because parameter should be in milliseconds


scene.add(table);
//addWorldAxes(balls[0]);
var controls = new THREE.TrackballControls(camera);

function render() {
  requestAnimationFrame(render);
  controls.update(dt);
  renderer.render(scene, camera);
}


render();