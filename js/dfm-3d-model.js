/**
 * Created by Theodore on 2/14/14.
 */

// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables
var points = [];
var values = [];
var size;
var fullWindow = false;
var SCREEN_WIDTH, SCREEN_HEIGHT;

var doCs = new KPU.domain();
var adg = new KPU.adg();
var wavefronts = new KPU.wavefront();

initDFM(doCs, adg, wavefronts);  // initialize the Domain Flow Model
initUI();
animate();

// FUNCTIONS
function initUI()
{
    // SCENE
    scene = new THREE.Scene();
    // CAMERA
    if (fullWindow) {
        container = document.getElementById( 'DFV' );
        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;
    } else {
        container = document.getElementById( 'DFV_s' );
        SCREEN_WIDTH = container.offsetWidth;
        SCREEN_HEIGHT = container.offsetHeight;
    }
    console.log('viewport = (' + SCREEN_WIDTH + "x" + SCREEN_HEIGHT + ')');
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(20,20,60);
    camera.lookAt(scene.position);
    // RENDERER
    if ( Detector.webgl )
        renderer = new THREE.WebGLRenderer( {antialias:true} );
    else
        renderer = new THREE.CanvasRenderer();
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container.appendChild( renderer.domElement );
    // EVENTS
    DfmWindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    // CONTROLS
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    // STATS
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.right = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );
    // LIGHT
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0,10,0);
    scene.add(light);

    var origin = new THREE.Vector3(0,0,0);
    // Axis
    var axes = new THREE.AxisHelper(50);
    axes.position.set(0,0,0);
    scene.add( axes );

    // measure grid
    var gridXZ = new THREE.GridHelper(20,1);
    gridXZ.setColors( new THREE.Color(0x777777), new THREE.Color(0xbbbbbb));
    gridXZ.position.set(11,-1,11);
    scene.add( gridXZ );

    var direction = new THREE.Vector3(1,0,0);
    var arrow = new THREE.ArrowHelper( direction, origin, 10, 0xff0000 );
    scene.add( arrow );
    direction.set(0,1,0);
    arrow = new THREE.ArrowHelper( direction, origin, 10, 0x00ff00 );
    scene.add( arrow );
    direction.set(0,0,1);
    arrow = new THREE.ArrowHelper( direction, origin, 10, 0x0000ff );
    scene.add( arrow );

    ////////////////////////////////////////////////
    // Visualization of the Domain of Computation //
    ////////////////////////////////////////////////

    var lineMaterial =  new THREE.LineBasicMaterial( {color: 0xffffff} );

    // create the geometry object
    var nrOfFaces = doCs.getNrOfPolylines();
    var polyhedronFace;
    for (polyhedronFace = 0; polyhedronFace < nrOfFaces; polyhedronFace++) {
        var polylineGeometry = new THREE.Geometry();
        polylineGeometry.name = 'face_' + polyhedronFace;
        var polyline = doCs.getPolyline(polyhedronFace); // getPolyline returns { dim:dimensionality,  vrtxArray:[vertices in adjacency order] }
        var vertexId;
        for (vertexId = 0; vertexId < polyline.vrtxArray.length; vertexId++) {
            var v = polyline.vrtxArray[vertexId];
            polylineGeometry.vertices.push(new THREE.Vector3(v[0], v[1], v[2]));
        }
        var polygon = new THREE.Line( polylineGeometry, lineMaterial );
        scene.add(polygon);
    }

    ////////////////////////////////////////////////////////
    // Visualization of the computational event evolution //
    ////////////////////////////////////////////////////////

    var discTexture = THREE.ImageUtils.loadTexture( './images/disc.png' );

    // values that are constant for all particles during a draw call
    this.customUniforms =
    {
        cardinality:    { type: "f", value: 33.0 },
        time:	        { type: "f", value: 1.0 },
        texture:        { type: "t", value: discTexture }
    };

    // properties that may vary from particle to particle. only accessible in vertex shaders!
    //	(can pass color info to fragment shader via vColor.)
    var customAttributes =
    {
        customColor:	 { type: "c", value: [] },
        schedule:        { type: 'f', value: [] }
    };

    var wavefrontView = new THREE.Geometry();
    wavefrontView.name = 'wavefront';
    var I = 11;
    var J = 11;
    var K = 11;
    var recurrenceColor = [ 0xff0000, 0x00ff00, 0x0000ff];
    var v = 0;
    var index = [];
    // recurrence equation a(i,j,k) = a(i,j-1,k)
    var recurrence = 0;
    for (i = 1; i < I; i++) {
        for (j = 1; j < J; j++) {
            for (k = 1; k < K; k++) {
                index = [i,j,k];
                wavefrontView.vertices.push( new THREE.Vector3(i,j+0.5,k) );
                // assign values to attributes, one for each vertex of the geometry
                customAttributes.customColor.value[ v ] = new THREE.Color( recurrenceColor[recurrence] );
                customAttributes.schedule.value[ v ] = schedule(recurrence,index);
                v++;
            }
        }
    }
    // recurrence equation b(i,j,k) = b(i-1,j,k)
    recurrence = 1;
    for (i = 1; i < I; i++) {
        for (j = 1; j < J; j++) {
            for (k = 1; k < K; k++) {
                index = [i,j,k];
                wavefrontView.vertices.push( new THREE.Vector3(i+0.5,j,k) );
                // assign values to attributes, one for each vertex of the geometry
                customAttributes.customColor.value[ v ] = new THREE.Color( recurrenceColor[recurrence] );
                customAttributes.schedule.value[ v ] = schedule(recurrence,index);
                v++;
            }
        }
    }
    // recurrence equation c(i,j,k) = c(i,j,k-1)
    recurrence = 2;
    for (i = 1; i < I; i++) {
        for (j = 1; j < J; j++) {
            for (k = 1; k < K; k++) {
                index = [i,j,k];
                wavefrontView.vertices.push( new THREE.Vector3(i,j,k+0.5) );
                // assign values to attributes, one for each vertex of the geometry
                customAttributes.customColor.value[ v ] = new THREE.Color( recurrenceColor[recurrence] );
                customAttributes.schedule.value[ v ] = schedule(recurrence,index);
                v++;
            }
        }
    }
    wavefrontView.verticesNeedUpdate = true;

    var shaderMaterial = new THREE.ShaderMaterial(
        {
            uniforms: 		this.customUniforms,
            attributes:		customAttributes,
            vertexShader:   document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
            transparent:    true,
            alphaTest:      0.5,  // if having transparency issues, try including: alphaTest: 0.5,
            blending:       THREE.AdditiveBlending,
            // depthTest:      true,
        });

    var particleSystem = new THREE.ParticleSystem( wavefrontView, shaderMaterial );
    particleSystem.position.set(0, 0, 0);
    particleSystem.dynamic = true;
    particleSystem.sortParticles = true;
    scene.add( particleSystem );
}

function schedule( recurrence, index ) {
    var tau = [1,1,1];
    var seqNr = numeric.dot(tau, index);
    return seqNr;
}
/**
 * Draw a text sprite. The benefit of a sprite is that it is a 2D image and thus continues
 * to keep facing the eye as the 3D model view point is manipulated.
 *
 * CURRENTLY NOT USED YET: will be used for index point inspection
 *
 * @param message
 * @param parameters
 * @returns {THREE.Sprite}
 */
function makeTextSprite( message, parameters ) {
    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

    //var spriteAlignment = parameters.hasOwnProperty("alignment") ?
    //	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

    var spriteAlignment = THREE.SpriteAlignment.topLeft;


    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;

    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
        + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
        + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial(
        { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(100,50,1.0);
    return sprite;
}

/**
 * Function hooked to the window redraw event
 *
 * @param renderer
 * @param camera
 * @returns {{stop: stop}}
 * @constructor
 */
function DfmWindowResize(renderer, camera) {
    var callback	= function(){
        // notify the renderer of the size change
        if (fullWindow) {
            SCREEN_WIDTH  = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;
        } else {
            SCREEN_WIDTH  = container.offsetWidth;
            SCREEN_HEIGHT = container.offsetHeight;
        }
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        console.log('viewport = (' + SCREEN_WIDTH + "x" + SCREEN_HEIGHT + ')');
        // update the camera
        camera.aspect	= SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();
    }
    // bind the resize event
    window.addEventListener('resize', callback, false);
    // return .stop() the function to stop watching window resize
    return {
        /**
         * Stop watching window resize
         */
        stop	: function(){
            window.removeEventListener('resize', callback);
        }
    };
}

function animate() {
    requestAnimationFrame( animate );
    render();
    update();
}

function update() {
    controls.update();
    stats.update();

    var t = clock.getElapsedTime();
    customUniforms.time.value = t;
}

function render() {
    renderer.render( scene, camera );
}
