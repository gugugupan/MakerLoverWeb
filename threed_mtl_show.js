var BASE_POINT_X = 0 ;
var BASE_POINT_Y = 0 ;
var BASE_POINT_Z = 3 ;

var container, camera, scene, renderer, object;
var radius , window_height_half = window.innerHeight / 2 , window_width_half = window.innerWidth / 2 * 3 / 4 ;
var mouse_x , mouse_y , zoom ;
var mouse_x_record , mouse_y_record , camera_rotate_record ;
var is_click = false ;

initialize_three_3d();

function initialize_three_3d( obj_file , mtl_file ) {
	// clear obj file
	show_log( "Initialize Scene" ) ;
	$( '#three_mtl_show_container' ).find( "canvas" ).remove() ;

	// set camera
	show_log( "Setting Camera..." ) ;
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth * 3 / 4 / window.innerHeight , 1, 1000 );
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 7;
	camera_rotate_record = Math.PI;
	zoom = 4 ; // (0,0,-1) to (0,0,3)   zoom means radius

	// set scene
	show_log( "Setting A Scene..." ) ;
	scene = new THREE.Scene();
	
	// set light
	show_log( "Setting Ambient Light..." ) ;
	var ambient_light = new THREE.AmbientLight( 0xffffff );
	scene.add( ambient_light );

	// Set plane
	var plane_geo = new THREE.PlaneGeometry( 20000, 20000 ) ;
	var plane_mtr = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } ) ;
	var plane = new THREE.Mesh( plane_geo , plane_mtr ) ;
	plane.position.y = -5;
	plane.rotation.x = - Math.PI / 2;
	// scene.add( plane ) ;

	// loading obj and mtl file
	var loader = new THREE.OBJMTLLoader();
	show_log( "Loading Object..." ) ;
	loader.load( obj_file , mtl_file , function ( object_load ) {
		object = object_load ;
		object.position.x = 0;
		object.position.y = 0;
		object.position.z = 0;
		object.rotation.x = 0;
		object.rotation.y = 0;
		object.rotation.z = -1.6;
		object.scale.x = 1;
		object.scale.y = 1;
		object.scale.z = 1;
		scene.add( object );
		show_log( "Object Loading Success." ) ;
	});

	startAnimate() ;
}

function startAnimate()
{
	// New Renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth * 3 / 4 , window.innerHeight );
	container = document.getElementById( 'three_mtl_show_container' );
	container.appendChild( renderer.domElement );
	//container.style.display = "block" ;

	// Trigger bind
	window.addEventListener( 'resize', onWindowResize, false );
	container.addEventListener( 'mousemove' , onContainerMouseMove , false ) ;
	container.addEventListener( 'mousedown' , onContainerClick , false ) ;
	container.addEventListener( "mousewheel" , onMouseWheel, false);
	container.addEventListener( "DOMMouseScroll" , onMouseWheel, false);
	is_click = false ;

	// Start Animate
	animate() ;
	startAutoRotation() ;
}

function onWindowResize() 
{
	window_width_half = window.innerWidth / 2 * 3 / 4 ;
	window_height_half = window.innerHeight / 2 ;
	camera.aspect = window.innerWidth * 3 / 4  / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth * 3 / 4  , window.innerHeight );
}

function onContainerClick()
{
	container.removeEventListener( 'mousedown' , onContainerClick , false ) ;
	container.addEventListener( 'mouseup' , onContainerClickEnd , false ) ;
	finishAutoRotation() ;
	is_click = true ;

	mouse_x_record = mouse_x ;
	mouse_y_record = mouse_y ;
}

function onContainerClickEnd()
{
	container.addEventListener( 'mousedown' , onContainerClick , false ) ;
	container.removeEventListener( 'mouseup' , onContainerClickEnd , false ) ;
	startAutoRotation() ;
	is_click = false ;
}

function onContainerMouseMove( event ) 
{
	mouse_x = ( event.clientX - window_width_half ) / 2;
	mouse_y = ( event.clientY - window_height_half ) / 2;
}

function onMouseWheel( e ) {
	/* 
	 * cross-browser wheel delta
	 * for delta : up = -1 , down = 1 
	 */
	var e = window.event || e;
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	// console.log( delta ) ;
	
	// change camera's raidus 
	if ( zoom + delta >= 2 && zoom + delta <= 10 )
	{
		var camera_x = camera.position.x - BASE_POINT_X ,
			camera_z = camera.position.z - BASE_POINT_Z ;
		camera_x = camera_x / zoom * ( zoom + delta ) ;
		camera_z = camera_z / zoom * ( zoom + delta ) ;
		zoom += delta ;
		camera.position.x = camera_x + BASE_POINT_X ;
		camera.position.z = camera_z + BASE_POINT_Z ;
	}
}

function camera_rotate( angle )
{
	camera_rotate_record -= angle ;
	if ( camera_rotate_record > Math.PI * 2 ) camera_rotate_record -= Math.PI * 2 ;
	if ( camera_rotate_record < -Math.PI * 2 ) camera_rotate_record += Math.PI * 2 ;
}

var rotation_handle = false ;
var rotation_count ;
function autoRotation()
{

	var camera_x = camera.position.x - BASE_POINT_X ,
		camera_z = camera.position.z - BASE_POINT_Z ;
	camera_rotate( 0.008 ) ;
	camera_z = zoom * Math.cos( camera_rotate_record ) ;
	camera_x = zoom * Math.sin( camera_rotate_record ) ;
	camera.position.x = camera_x + BASE_POINT_X ;
	camera.position.z = camera_z + BASE_POINT_Z ;

	if ( rotation_handle ) requestAnimationFrame( autoRotation ) ;
}

function startAutoRotation()
{
	rotation_handle = true ;
	autoRotation() ;
}

function finishAutoRotation()
{
	rotation_handle = false ;
}

// Animate render function
function animate() 
{
	requestAnimationFrame( animate );
	render();
}

function render() 
{
	if ( is_click )
	{
		var camera_x = camera.position.x - BASE_POINT_X ,
			camera_y = camera.position.y - BASE_POINT_Y ,
			camera_z = camera.position.z - BASE_POINT_Z ;

		// Adjust Camera's position on the circle
		var angle = 12.0 * ( mouse_x - mouse_x_record ) / window.innerWidth * 3 / 4 ;
		mouse_x_record = mouse_x ;
		camera_rotate( angle ) ;
		camera_z = zoom * Math.cos( camera_rotate_record ) ; // zoom is radius
		camera_x = zoom * Math.sin( camera_rotate_record ) ;

		// Adjust Camera's height
		var camera_y_new = camera_y + ( mouse_y - mouse_y_record ) * 0.05 ;
		if ( camera_y_new <= 5 && camera_y_new >= -5 )
		{
			camera_y = camera_y_new ;
			mouse_y_record = mouse_y ;
		}

		camera.position.x = camera_x + BASE_POINT_X ;
		camera.position.y = camera_y + BASE_POINT_Y ;
		camera.position.z = camera_z + BASE_POINT_Z ;
	}

	// Making camera looking at base point
	var base_point = new THREE.Vector3( BASE_POINT_X , BASE_POINT_Y , BASE_POINT_Z ) ;
	camera.lookAt( base_point ) ;

	renderer.render( scene, camera );
}

var show_log_timeout_handle = null ;
function show_log( log_msg )
{
	// console.log( "[~MAKERLOVER.log.by.yukis~]" + log_msg ) ;
	$( "#info_area" ).append( "<p>" + log_msg + "</p>" ) ;
	clearTimeout( show_log_timeout_handle ) ;
	show_log_timeout_handle = setTimeout( function() { 
		$( "#info_area p" ).fadeOut( 1500 ) ;
	} , 15000 ) ;
}

// requestAnimationFrame
if ( !requestAnimationFrame )
{
	function requestAnimationFrame( handle )
	{
		setTimeout( handle , 50 ) ;
	}
}
