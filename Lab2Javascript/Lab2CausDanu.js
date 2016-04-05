
// Info:
// You can scroll the mouse wheel to zoom in and out in the browser
// You can click on the scene/canvas with your mouse and rotate the clock in the 3 dimensional space
// The clock has 2 faces. First face (front face) shows you Germany local time
// The back face shows you my hometown local time


window.onload = function(){  //window.onload is used so that all the dependencies are loaded properly before rendering

	//* Initialize webGL with camera and lights
	var canvas = document.getElementById("mycanvas");

	var renderer = new THREE.WebGLRenderer({canvas:canvas});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor('rgb(0, 255, 255)');

	// create scene and camera
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 10;

	var ambientLight = new THREE.AmbientLight(0x909090);
	scene.add(ambientLight);
	var light = new THREE.DirectionalLight(0x444444);
	light.position.set( 1.5,1,1 );
	scene.add(light);

	var clockFace = new THREE.Object3D(); // This object will contain all ticks, but not the hands of the clock

	// Make the cylinder:

	var cylinderHeight = 1;
	var cylinderRadius = 6;
	var geometry = new THREE.CylinderGeometry( cylinderRadius, cylinderRadius, cylinderHeight, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe:false} );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.rotation.z += Math.PI/2;
	cylinder.rotation.y += 90*(Math.PI/180);
	scene.add( cylinder );

	//------------------------------------------------
	// The following function is useful for creating the ticks and the seconds hand
	var createRectangle = function(rectangleWidth, rectangleLength, color){
		var rectangleGeometry = new THREE.Geometry();
	   
		rectangleGeometry.vertices[0] = new THREE.Vector3(-rectangleWidth/2,0,0);
		rectangleGeometry.vertices[1] = new THREE.Vector3(-rectangleWidth/2,rectangleLength,0);
		rectangleGeometry.vertices[2] = new THREE.Vector3(rectangleWidth/2,0,0);
		rectangleGeometry.vertices[3] = new THREE.Vector3(rectangleWidth/2,rectangleLength,0);
		rectangleGeometry.vertices[4] = new THREE.Vector3(-rectangleWidth/2,rectangleLength,0);
		rectangleGeometry.vertices[5] = new THREE.Vector3(rectangleWidth/2,0,0);

		var mat = new THREE.MeshPhongMaterial({color: color,
	                                       wireframe:false,
	                                       wireframeLinewidth:2} );

		rectangleGeometry.faces[0] = new THREE.Face3(0,2,1);  
		rectangleGeometry.faces[1] = new THREE.Face3(3,4,5); 
		rectangleGeometry.faces[2] = new THREE.Face3(0,1,2);  
		rectangleGeometry.faces[3] = new THREE.Face3(3,5,4); 
		
		var rectangle = new THREE.Mesh(rectangleGeometry, mat);
		return rectangle;
	}	

	var largeTick = createRectangle(0.4, 1, 0x000000);
	var largeTickArray = [];
	var radius = 4.5; // is used for placing the ticks at a certain distance from the center

	for(var i =0; i < 12; i++){
		largeTickArray[i] = largeTick.clone();
		largeTickArray[i].position.y += radius*Math.sin(30*i*(Math.PI/180)); // translation along y
		largeTickArray[i].position.x += radius*Math.cos(30*i*(Math.PI/180)); // translation along x
		largeTickArray[i].rotation.z = (30*i - 90)*(Math.PI/180);	// proper orientation
		if(i === 3) continue;  // index 3 is the position of the marked tick that will be added separately
		clockFace.add(largeTickArray[i]);
	}

	var twelveOclock = createRectangle(0.4, 1, 0x000f00f);
	twelveOclock.position.y += radius;
	clockFace.add(twelveOclock); // add the marked tick



	//-----------------------------------------------------
	var smallTick = createRectangle(0.2, 0.5, 0x000000);

	var smallTickArray = [];

	for(var i = 0; i < 60; i++){
		if(i%5 === 0) continue; // at these positions, the large 5 minute ticks are already placed
		smallTickArray[i] = smallTick.clone();
		smallTickArray[i].position.y += radius*Math.sin(6*i*(Math.PI/180));
		smallTickArray[i].position.x += radius*Math.cos(6*i*(Math.PI/180));
		smallTickArray[i].rotation.z = (6*i - 90)*(Math.PI/180);		
		clockFace.add(smallTickArray[i]);

	}

	clockFace.position.z += cylinderHeight/2 + 0.1;
	scene.add(clockFace);

	var hometownClockFace = clockFace.clone();
	hometownClockFace.position.z = -cylinderHeight/2-0.1;
	scene.add(hometownClockFace);

	//---------------------------------------------------------

	var secondsHand = createRectangle(0.2, 4, 0x000000);
	secondsHand.position.z += cylinderHeight/2 + 0.5;

	var hometownSecondsHand = secondsHand.clone();
	hometownSecondsHand.position.z = -cylinderHeight/2 - 0.5;

	scene.add(secondsHand);
	scene.add(hometownSecondsHand);

	//----------------------------------------------------------
	/*
	 From the threejs documentation files we have:

	SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)

	radius — sphere radius. Default is 50.
	widthSegments — number of horizontal segments. Minimum value is 3, and the default is 8.
	heightSegments — number of vertical segments. Minimum value is 2, and the default is 6.
	phiStart — specify horizontal starting angle. Default is 0.
	phiLength — specify horizontal sweep angle size. Default is Math.PI * 2.
	thetaStart — specify vertical starting angle. Default is 0.
	thetaLength — specify vertical sweep angle size. Default is Math.PI.
	*/
	// Therefore we are able to create half a sphere using the following constructor:
	var geometryMinutesHand = new THREE.SphereGeometry( 0.9, 32, 32, 0, 2*Math.PI, 0, Math.PI/2); 
	// Note: change 2*Math.PI (fifth parameter) to Math.PI to obtain 1/4  of a sphere.


	var materialMinutesHand = new THREE.MeshBasicMaterial( {color: 0x1d11e2} );
	var minutesHand = new THREE.Mesh( geometryMinutesHand, materialMinutesHand );

	minutesHand.scale.x = 0.3;
	minutesHand.scale.y = 5;
	minutesHand.scale.z = 0.3;

	hometownMinutesHand = minutesHand.clone();

	minutesHand.position.z = cylinderHeight/2 - 0.1;
	hometownMinutesHand.position.z = -cylinderHeight/2 + 0.1;

	scene.add(minutesHand);
	scene.add(hometownMinutesHand);

	//------------------------------------------------------------------------------
	//Construct a quarter of sphere for the hours hand so that we do not overlap the minutes hand in certain situations
	var geometryHoursHand = new THREE.SphereGeometry( 0.7, 32, 32, 0, Math.PI, 0, Math.PI/2); 
	var materialHoursHand = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	var hoursHand = new THREE.Mesh( geometryHoursHand, materialHoursHand );

	hoursHand.scale.x = 0.3;
	hoursHand.scale.y = 4;
	hoursHand.scale.z = 0.3;


	//--------------------------------------------------------------------------------------------------
	// Because the 7th parameter is different for the localhours hand, we cannot use clone like earlier... 
	// Therefore we need to duplicate the construction code
	var geometryhometownHoursHand = new THREE.SphereGeometry( 0.7, 32, 32, 0, Math.PI, 0, -Math.PI/2); 
	var materialhometownHoursHand = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	var hometownHoursHand = new THREE.Mesh( geometryhometownHoursHand, materialhometownHoursHand );

	hometownHoursHand.scale.x = 0.3;
	hometownHoursHand.scale.y = 4;
	hometownHoursHand.scale.z = 0.3;

	hoursHand.position.z += cylinderHeight/2+0.2;
	hometownHoursHand.position.z = -cylinderHeight/2-0.2;

	scene.add(hoursHand);
	scene.add(hometownHoursHand);

	//------------------------------------------------
	//Create blob:
	var blobGeometry = new THREE.SphereGeometry( 1, 32, 32 );
	var blobMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe:false, wireframeLinewidth:2} );
	var blob = new THREE.Mesh( blobGeometry, blobMaterial );

	scene.add( blob );

	//------------------------------------------------

	var d = new Date();
	var secondsCount = d.getSeconds();
	secondsHand.rotation.z = -6*secondsCount*Math.PI/180; // initial offset of the seconds hand

	var minutesCount = d.getMinutes();
	minutesHand.rotation.z = -6*minutesCount*Math.PI/180; // initial offset of the minutes hand

	var hoursCount = d.getHours();
	hoursHand.rotation.z = (-30*(hoursCount%12) - minutesCount/2)*Math.PI/180;
	/*
		* -30*(hoursCount%12) represents the offset to the current (integer) hour
		* minutesCount/2 represents the position (in degrees) of the hours hand between 2 consecutive INTEGER hour marks.
		* Explanation: 
		* 60 minutes  represent a total of 30 degrees of hours hand rotation. 
		* If 'minutesCount' has passed since x o'clock, 
		* the hoursHand will have an offset (from x mark) of: (minutesCount*30 degrees)/(60 minutes) = (minutesCount/2) degrees.
	 */

	//----------------------------------------------------------
	//Initial offsets of the hands for the hometown time (degrees like above, but negated) : 

	hometownSecondsHand.rotation.z = 6*secondsCount*Math.PI/180;


	hometownMinutesHand.rotation.z = 6*minutesCount*Math.PI/180;


	hometownHoursHand.rotation.z = (30*(hoursCount%12+1) + minutesCount/2)*Math.PI/180; // Chisinau, Moldova local time = GMT+2

	//----------------------------------------------------------

	setInterval(function(){ 
		
		secondsHand.rotation.z += -6*Math.PI/180;
		hometownSecondsHand.rotation.z += 6*Math.PI/180;
		

		hoursHand.rotation.z += (-30.0/3600)*Math.PI/180;// slightly rotate the hours hand each second to span 30 degrees in total after 3600 seconds pass
		hometownHoursHand.rotation.z += (30.0/3600)*Math.PI/180;

		secondsCount++;
		
		if(secondsCount === 60) {
			secondsCount = 0;
			minutesCount++;
			if(minutesCount % 5 === 0){
				minutesHand.rotation.z += -8*Math.PI/180;     // bigger ticks every 5 minutes
				hometownMinutesHand.rotation.z += 8*Math.PI/180;		
			}
			else{
				minutesHand.rotation.z += -5.5*Math.PI/180;
				hometownMinutesHand.rotation.z += 5.5*Math.PI/180;		
			}
		}

		if(minutesCount === 60) {
			minutesCount = 0;
		}

	}, 1000); // delta t = 1000 ms


    // add controls:
	var controls = new THREE.TrackballControls( camera, canvas );
	controls.rotateSpeed = 2;

	function render() {
	    requestAnimationFrame(render);
	    controls.update();
	    renderer.render(scene, camera);
	}

	render();

} // end of window.onload function
