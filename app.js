const canvas = document.getElementById("game-surface");
canvas.width = innerWidth;
canvas.height = innerHeight;
var lastUpdate = Date.now();
let camera = {
	x: -0.5,
	y: -1.5,
	z: 3,
	rotX: -0.2,
	rotY: -0.5,
	rotZ: 0,
	velRotX: 0,
	velRotY: 0,
	velRotZ: 0,
	velX: 0,
	velY: 0,
	velZ: 0,
	traction: 0.01,
	gravity: 0
}

let player = {
	velocities: {
		x: 0,
		y: 0,
		z: 0
	},
	traction: 0.05,
	rotation: {
		x: 0,
		y: 0,
		z: 0
	}
}




/* IMPORT OBJECTS AND TEXTURES */
// car
let orange_car_object;
let orange_car_texture;

// castle
let castle_object;
let castle_texture;

// test
let test_texture = new Image();
test_texture.src = "./objects/test-texture.jpg";

fetch("./objects/orange_car/orange_car_model.json")
.then((response) => response.json())
.then(data => orange_car_object = data);


fetch("./objects/castle/castle.json")
.then(response => response.json())
.then(data => castle_object = data);




function main() {
	console.log(castle_object)
	/* CONFIGURATION */
	const gl = canvas.getContext("webgl");

	if(!gl) {
		console.error("Your browser does not support WebGL!");
	}

	gl.clearColor(0.5, 0.5, 0.5, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	// Create shaders
	let vertShader = gl.createShader(gl.VERTEX_SHADER);
	let fragShader = gl.createShader(gl.FRAGMENT_SHADER);

	// Set shader source
	gl.shaderSource(vertShader, `
		attribute vec3 vertPosition;
		attribute vec2 vertTexCoord;
		attribute vec3 vertNormal;

		varying vec2 fragTexCoord;
		varying vec3 fragNormal;

		uniform mat4 mWorld;
		uniform mat4 mView;
		uniform mat4 mProj;
		uniform float time;

		void main() {
			fragTexCoord = vertTexCoord;
			fragNormal = (mWorld * vec4(vertNormal, 0.0)).xyz;
			gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
		}
	`);

	gl.shaderSource(fragShader, `
		precision mediump float;

		struct DirectionalLight
		{
			vec3 direction;
			vec3 color;
		};

		varying vec2 fragTexCoord;
		varying vec3 fragNormal;

		uniform sampler2D sampler;
		uniform vec3 ambientLightIntensity;
		uniform DirectionalLight sun;

		void main()
		{
			vec3 surfaceNormal = normalize(fragNormal);
			vec3 normSunDir = normalize(sun.direction);
			vec4 texel = texture2D(sampler, fragTexCoord);

			vec3 lightIntensity = ambientLightIntensity +
				sun.color * max(dot(fragNormal, normSunDir), 0.0);

				gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
		}
	`);
	
	gl.compileShader(vertShader);
	if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertShader));
		return;
	}

	gl.compileShader(fragShader);
	if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling frag shader!', gl.getShaderInfoLog(fragShader));
		return;
	}

	let program = gl.createProgram();
	gl.attachShader(program, vertShader);
	gl.attachShader(program, fragShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	/* CONFIGURATION END */
	/* LOAD/DEFINE OBJECTS */
	var elements = [
		{
			id: 0,
			scale: [1,1,1],
			position: [0,0,0],
			rotationAxis: [0,0,0],
			vertices: orange_car_object.meshes[0].vertices,
			indices: [].concat.apply([], orange_car_object.meshes[0].faces),
			normals: [].concat.apply([], orange_car_object.meshes[0].normals),
			texture: document.getElementById("car-texture"),
			positionAttributeData: {
				elementsPerInstance: 3,
				type: gl.FLOAT,
				normalized: gl.FALSE,
				byteSize: 3 * Float32Array.BYTES_PER_ELEMENT,
				byteOffset: 0
			},
			textureCoordinates: [].concat.apply([], orange_car_object.meshes[0].texturecoords),
			texCoordAttributeData: {
				elementsPerInstance: 2,
				type: gl.FLOAT,
				normalized: gl.FALSE,
				byteSize: 2 * Float32Array.BYTES_PER_ELEMENT,
				byteOffset: 0
			},
			vertexBufferObject: null,
			indexBufferObject: null,
			textureCoordBufferObject: null,
			textureBufferObject: null,
			normalBufferObject: null
		},
		{
			id: 1,
			scale: [5,5,5],
			position: [10,0,1],
			rotationAxis: [0,0,0],
			vertices: castle_object.meshes[0].vertices,
			indices: [].concat.apply([], castle_object.meshes[0].faces),
			normals: [].concat.apply([], castle_object.meshes[0].normals),
			texture: test_texture,
			positionAttributeData: {
				elementsPerInstance: 3,
				type: gl.FLOAT,
				normalized: gl.FALSE,
				byteSize: 3 * Float32Array.BYTES_PER_ELEMENT,
				byteOffset: 0
			},
			textureCoordinates: [].concat.apply([], castle_object.meshes[0].texturecoords),
			texCoordAttributeData: {
				elementsPerInstance: 2,
				type: gl.FLOAT,
				normalized: gl.FALSE,
				byteSize: 2 * Float32Array.BYTES_PER_ELEMENT,
				byteOffset: 0
			},
			vertexBufferObject: null,
			indexBufferObject: null,
			textureCoordBufferObject: null,
			textureBufferObject: null,
			normalBufferObject: null
		},
	];

	initiateElements(elements, gl, program);
	gl.useProgram(program)
	/* INIT GAME LOOP */
	loop(elements, gl, program);
}

function initiateElements(elements, gl, program) {
		elements.forEach(object => {
			// Create buffer objects and store in element
			object.vertexBufferObject = gl.createBuffer();
			object.indexBufferObject = gl.createBuffer();
			object.textureCoordBufferObject = gl.createBuffer();
			object.normalBufferObject = gl.createBuffer();

			// Create and create and configure texture
			object.textureBufferObject = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, object.textureBufferObject);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				object.texture
			)
		})
	
}


function render(elements, gl, program) {
	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	// CAMERA RENDER
	let matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var viewMatrix = new Float32Array(16);
	let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var worldMatrix = new Float32Array(16);
	mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
	mat4.translate(
		viewMatrix,
		viewMatrix,
		[camera.x, camera.y, camera.z]
	)
	mat4.rotate(
		viewMatrix, 
		viewMatrix,
		camera.rotX,
		[1, 0, 0]
		);
	mat4.rotate(
		viewMatrix, 
		viewMatrix,
		camera.rotY,
		[0, 1, 0]
		);
	mat4.rotate(
		viewMatrix, 
		viewMatrix,
		camera.rotZ,
		[0, 0, 1]
		);
		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	// OBJECT RENDER
	elements.forEach(object => {
		
		gl.useProgram(program);

		gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBufferObject);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.indices), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, object.textureCoordBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.textureCoordinates), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, object.normalBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.normals), gl.STATIC_DRAW);

		let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
		let texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
		let normalAttribLocation = gl.getAttribLocation(program, "vertNormal")
		// VERTEXBUFFER ATTRIBUTES
		gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBufferObject);
		gl.vertexAttribPointer(
			positionAttribLocation,
			object.positionAttributeData.elementsPerInstance,
			object.positionAttributeData.type,
			object.positionAttributeData.normalized,
			object.positionAttributeData.byteSize,
			object.positionAttributeData.byteOffset
		)
		gl.enableVertexAttribArray(positionAttribLocation);
		// TEXTURECOORD ATTRIBUTES
		gl.bindBuffer(gl.ARRAY_BUFFER, object.textureCoordBufferObject);
		gl.vertexAttribPointer(
			texCoordAttribLocation,
			object.texCoordAttributeData.elementsPerInstance,
			object.texCoordAttributeData.type,
			object.texCoordAttributeData.normalized,
			object.texCoordAttributeData.byteSize,
			object.texCoordAttributeData.byteOffset
		)
		gl.enableVertexAttribArray(texCoordAttribLocation);
		
		// NORMAL ATTRIBUTES
		gl.bindBuffer(gl.ARRAY_BUFFER, object.normalBufferObject);
		gl.vertexAttribPointer(
			normalAttribLocation,
			3,
			gl.FLOAT,
			gl.TRUE,
			3 * Float32Array.BYTES_PER_ELEMENT,
			0
		);
		gl.enableVertexAttribArray(normalAttribLocation);


		var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
		var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
		var worldMatrix = new Float32Array(16);
		var projMatrix = new Float32Array(16);

		mat4.identity(worldMatrix);
		mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);
		
		// mat4.scale(worldMatrix, worldMatrix, [1,1,1]);

		
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
		let timeLocation = gl.getUniformLocation(program, "time")
		gl.uniform1f(timeLocation, performance.now());

		var xRotationMatrix = new Float32Array(16);
		var yRotationMatrix = new Float32Array(16);

		var identityMatrix = new Float32Array(16);
		mat4.identity(identityMatrix);
		let angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		if(object.id == 0) {
			mat4.rotate(yRotationMatrix, worldMatrix, object.rotationAxis[0], [0, 1, 0]);
			mat4.mul(worldMatrix, worldMatrix, yRotationMatrix);
		}
		mat4.translate(
			worldMatrix,
			worldMatrix,
			[object.position[0], object.position[1], object.position[2]]
		)
		mat4.scale(worldMatrix, worldMatrix, object.scale);

		// Apply object texture
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			object.texture
		)

		var ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
		var sunlightDirUniformLocation = gl.getUniformLocation(program, 'sun.direction');
		var sunlightIntUniformLocation = gl.getUniformLocation(program, 'sun.color');
		
		// SCENE LIGHT CONFIG
		gl.uniform3f(ambientUniformLocation, 0.5, 0.5, 0.5);
		gl.uniform3f(sunlightDirUniformLocation, -3.0, 4.0, -2.0);
		gl.uniform3f(sunlightIntUniformLocation, 0.9, 0.9, 0.9);


		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);
		
	})
	
}

// INPUT
window.addEventListener("keypress", event => {
	let speed = 0.05;
	if(event.key == "w") {
		camera.velZ -= speed;
	}
	if(event.key == "s") {
		camera.velZ += speed;
	}
	if(event.key == "a") {
		camera.velX -= speed;
	}
	if(event.key == "d") {
		camera.velX += speed;
	}
	if(event.key == "e") {
		camera.velY -= speed ;
	}
	if(event.key == "q") {
		camera.velY += speed;
	}

	if(event.key == "i") {
		camera.velRotX += speed/6;
	}
	if(event.key == "k") {
		camera.velRotX -= speed/6;
	}
	if(event.key == "j") {
		camera.velRotY += speed/6;
	}
	if(event.key == "l") {
		camera.velRotY -= speed/6;
	}

	if(event.key == "8") {
		if(player.velocities.z > -0.5) player.velocities.z -= speed;
	}
	if(event.key == "2") {
		if(player.velocities.z < 0.5) player.velocities.z += speed;
	}

	if(event.key == "4") {
		player.rotation.x -= speed/6;
	}
	if(event.key == "6") {
		player.rotation.x += speed/6;
	}

})

function update(dt, elements) {
	calculateCameraPosition(dt);
	calculateCarPosition(elements, dt)
}

function loop(elements, gl, program, now) {
	var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;
	update(dt, elements);
	render(elements, gl, program);
	
	requestAnimationFrame(() => loop(elements, gl, program, now));
}


function calculateCarPosition(elements, dt) {
	let car = elements[0];
	car.position[2] += player.velocities.z;
	car.rotationAxis = [player.rotation.x, 0, 0];

	if(player.velocities.z > 0.002) {
		player.velocities.z -= (player.traction / dt);
	} else if(player.velocities.z < -0.002) {
		player.velocities.z += (player.traction / dt);
	} else {
		player.velocities.z = 0;
	}

}


function calculateCameraPosition(dt) {
	camera.x += camera.velX;
	camera.y += camera.velY;
	camera.z += camera.velZ;

	camera.rotX += camera.velRotX;
	camera.rotY += camera.velRotY;

	if(camera.velX > 0.002) {
		camera.velX -= (camera.traction / dt);
	} else if(camera.velX < -0.002) {
		camera.velX += (camera.traction / dt);
	} else {
		camera.velX = 0;
	}

	if(camera.velY > 0.002) {
		camera.velY -= (camera.traction / dt);
	} else if(camera.velY < -0.002) {
		camera.velY += (camera.traction / dt);
	} else {
		camera.velY = 0;
	}

	if(camera.velZ > 0.002) {
		camera.velZ -= (camera.traction / dt);
	} else if(camera.velZ < -0.002) {
		camera.velZ += (camera.traction / dt);
	} else {
		camera.velZ = 0;
	}

	if(camera.velRotX > 0.002) {
		camera.velRotX -= (camera.traction / dt);
	} else if(camera.velRotX < -0.002) {
		camera.velRotX += (camera.traction / dt);
	} else {
		camera.velRotX = 0;
	}

	if(camera.velRotY > 0.002) {
		camera.velRotY -= (camera.traction / dt);
	} else if(camera.velRotY < -0.002) {
		camera.velRotY += (camera.traction / dt);
	} else {
		camera.velRotY = 0;
	}


	
}