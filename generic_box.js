import * as THREE from  'three';

export function genBox(length,width,stair_l,stair_w,height,materialForBox)
{
    let BoxGeometry0=new THREE.BoxGeometry((width-stair_l)/2,height,length);
    let BoxGeometry1=new THREE.BoxGeometry(stair_w,height,length-stair_l);
    let subBox1=new THREE.Mesh(BoxGeometry0,materialForBox);
    let subBox2=new THREE.Mesh(BoxGeometry0,materialForBox);
    let subBox0=new THREE.Mesh(BoxGeometry1,materialForBox);
    let center=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),materialForBox);
    center.lowerBox=subBox0;
    center.leftBox=subBox1;
    center.rightBox=subBox2;

    center.width=width;
    center.length=length;
    center.height=height;
    center.stair_l=stair_l;
    center.stair_w=stair_w;

    center.add(center.lowerBox);
    center.add(center.leftBox);
    center.add(center.rightBox);

    center.lowerBox.translateZ(stair_l/2);
    center.leftBox.translateX(-(stair_w+width)/4);
    center.rightBox.translateX((stair_w+width)/4);

    return center;

}



// let scene, renderer, camera, material, light, orbit; // Initial variables
// scene = new THREE.Scene();    // Create main scene
// renderer = initRenderer();    // Init a basic renderer
// camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
// material = setDefaultMaterial(); // create a basic material
// light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
// orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// // Listen window size changes
// window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// // Show axes (parameter is size of each axis)
// let axesHelper = new THREE.AxesHelper( 12 );
// scene.add( axesHelper );

// // create the ground plane
// let plane = createGroundPlaneXZ(20, 20)
// scene.add(plane);

// // create a cube
// let cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
// let cube = new THREE.Mesh(cubeGeometry, material);
// // position the cube
// cube.position.set(0.0, 2.0, 0.0);
// // add the cube to the scene
// //scene.add(cube);
// let test_box=genBox(4.0,6.0,1.0,2.0,4.0,material);
// scene.add(test_box);
// // Use this to show information onscreen
// let controls = new InfoBox();
//   controls.add("Basic Scene");
//   controls.addParagraph();
//   controls.add("Use mouse to interact:");
//   controls.add("* Left button to rotate");
//   controls.add("* Right button to translate (pan)");
//   controls.add("* Scroll to zoom in/out.");
//   controls.show();

// render();
// function render()
// {
//   requestAnimationFrame(render);
//   renderer.render(scene, camera) // Render scene
// }