const canvas = document.getElementById("game-surface");
canvas.width = innerWidth;
canvas.height = innerHeight;
let cameraX = 0; cameraY = 0; cameraZ = 20;
let cameraXRotation = 5; 
let cameraYRotation = 0; 
let cameraZRotation = 0; 
let last = 0;


function main() {

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
		varying vec2 fragTexCoord;
		uniform mat4 mWorld;
		uniform mat4 mView;
		uniform mat4 mProj;
		uniform float time;


		void main() {
			fragTexCoord = vertTexCoord;
			gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
		}
	`);

	gl.shaderSource(fragShader, `
		precision mediump float;

		varying vec2 fragTexCoord;
		uniform sampler2D sampler;
		
		void main()
		{
			gl_FragColor = texture2D(sampler, fragTexCoord);
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
	let elements = [
		{
			id: 1,
			position: [0,0,0],
			rotationAxis: [0,0,0],
			vertices: 
			[ // X, Y, Z           U, V
				// Top
				-1.0, 1.0, -1.0,   0, 0,
				-1.0, 1.0, 1.0,    0, 1,
				1.0, 1.0, 1.0,     1, 1,
				1.0, 1.0, -1.0,    1, 0,

				// Left
				-1.0, 1.0, 1.0,    0, 0,
				-1.0, -1.0, 1.0,   1, 0,
				-1.0, -1.0, -1.0,  1, 1,
				-1.0, 1.0, -1.0,   0, 1,

				// Right
				1.0, 1.0, 1.0,    1, 1,
				1.0, -1.0, 1.0,   0, 1,
				1.0, -1.0, -1.0,  0, 0,
				1.0, 1.0, -1.0,   1, 0,

				// Front
				1.0, 1.0, 1.0,    1, 1,
				1.0, -1.0, 1.0,    1, 0,
				-1.0, -1.0, 1.0,    0, 0,
				-1.0, 1.0, 1.0,    0, 1,

				// Back
				1.0, 1.0, -1.0,    0, 0,
				1.0, -1.0, -1.0,    0, 1,
				-1.0, -1.0, -1.0,    1, 1,
				-1.0, 1.0, -1.0,    1, 0,

				// Bottom
				-1.0, -1.0, -1.0,   1, 1,
				-1.0, -1.0, 1.0,    1, 0,
				1.0, -1.0, 1.0,     0, 0,
				1.0, -1.0, -1.0,    0, 1,
			],
			indices: 
			[
				// Top
				0, 1, 2,
				0, 2, 3,

				// Left
				5, 4, 6,
				6, 4, 7,

				// Right
				8, 9, 10,
				8, 10, 11,

				// Front
				13, 12, 14,
				15, 14, 12,

				// Back
				16, 17, 18,
				16, 18, 19,

				// Bottom
				21, 20, 22,
				22, 20, 23
			],
			positionAttributeData: {
				elementsPerInstance: 3,
				type: gl.FLOAT,
				normalized: gl.FALSE,
				byteSize: 5 * Float32Array.BYTES_PER_ELEMENT,
				byteOffset: 0
			},
			texCoordAttributeData: {
				elementsPerInstance: 2,
				type: gl.FLOAT,
				normalized: gl.FALSE,
				byteSize: 5 * Float32Array.BYTES_PER_ELEMENT,
				byteOffset: 3 * Float32Array.BYTES_PER_ELEMENT
			},
			vertexBufferObject: null,
			indexBufferObject: null
		},
		{
			id: 1,
			position: [5,0,0],
			rotationAxis: [0,0,0],
			vertices: 
			[ // X, Y, Z           U, V
				// Top
				-1.0, 1.0, -1.0,   0, 0,
				-1.0, 1.0, 1.0,    0, 1,
				1.0, 1.0, 1.0,     1, 1,
				1.0, 1.0, -1.0,    1, 0,

				// Left
				-1.0, 1.0, 1.0,    0, 0,
				-1.0, -1.0, 1.0,   1, 0,
				-1.0, -1.0, -1.0,  1, 1,
				-1.0, 1.0, -1.0,   0, 1,

				// Right
				1.0, 1.0, 1.0,    1, 1,
				1.0, -1.0, 1.0,   0, 1,
				1.0, -1.0, -1.0,  0, 0,
				1.0, 1.0, -1.0,   1, 0,

				// Front
				1.0, 1.0, 1.0,    1, 1,
				1.0, -1.0, 1.0,    1, 0,
				-1.0, -1.0, 1.0,    0, 0,
				-1.0, 1.0, 1.0,    0, 1,

				// Back
				1.0, 1.0, -1.0,    0, 0,
				1.0, -1.0, -1.0,    0, 1,
				-1.0, -1.0, -1.0,    1, 1,
				-1.0, 1.0, -1.0,    1, 0,

				// Bottom
				-1.0, -1.0, -1.0,   1, 1,
				-1.0, -1.0, 1.0,    1, 0,
				1.0, -1.0, 1.0,     0, 0,
				1.0, -1.0, -1.0,    0, 1,
			],
			indices: 
			[
				// Top
				0, 1, 2,
				0, 2, 3,

				// Left
				5, 4, 6,
				6, 4, 7,

				// Right
				8, 9, 10,
				8, 10, 11,

				// Front
				13, 12, 14,
				15, 14, 12,

				// Back
				16, 17, 18,
				16, 18, 19,

				// Bottom
				21, 20, 22,
				22, 20, 23
			],
			positionAttributeData: {
				elementsPerInstance: 3,
				type: gl.FLOAT,
				normalized: gl.FALSE,
				byteSize: 5 * Float32Array.BYTES_PER_ELEMENT,
				byteOffset: 0
			},
			texCoordAttributeData: {
				elementsPerInstance: 2,
				type: gl.FLOAT,
				normalized: gl.FALSE,
				byteSize: 5 * Float32Array.BYTES_PER_ELEMENT,
				byteOffset: 3 * Float32Array.BYTES_PER_ELEMENT
			},
			vertexBufferObject: null,
			indexBufferObject: null
		}
	];
	initiateElements(elements, gl, program);
	gl.useProgram(program)
	
	/* INIT GAME LOOP */
	loop(elements, gl, program);
}

function initiateElements(elements, gl, program) {
		elements.forEach(object => {
			object.vertexBufferObject = gl.createBuffer();
			object.indexBufferObject = gl.createBuffer();
			
			
	
			// TEXTURE OBJECT
			let elementTexture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, elementTexture);
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
				document.getElementById("crate-image")
			)		
		})
	
}


function render(elements, gl, program) {
	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	let matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var viewMatrix = new Float32Array(16);
	let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var worldMatrix = new Float32Array(16);
	mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
	mat4.translate(
		viewMatrix,
		viewMatrix,
		[cameraX,cameraY,cameraZ]
	)
	mat4.rotate(
		viewMatrix, 
		viewMatrix,
		cameraXRotation,
		[cameraXRotation, 0, 0]
		);
	mat4.rotate(
		viewMatrix, 
		viewMatrix,
		cameraYRotation,
		[0, cameraYRotation, 0]
		);
	mat4.rotate(
		viewMatrix, 
		viewMatrix,
		cameraZRotation,
		[0, 0, cameraZRotation]
		);
		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	elements.forEach(object => {
		
		gl.useProgram(program);

		gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.indexBufferObject);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.indices), gl.STATIC_DRAW);

		let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
		let texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');

		gl.vertexAttribPointer(
			positionAttribLocation,
			object.positionAttributeData.elementsPerInstance,
			object.positionAttributeData.type,
			object.positionAttributeData.normalized,
			object.positionAttributeData.byteSize,
			object.positionAttributeData.byteOffset
		)

		gl.vertexAttribPointer(
			texCoordAttribLocation,
			object.texCoordAttributeData.elementsPerInstance,
			object.texCoordAttributeData.type,
			object.texCoordAttributeData.normalized,
			object.texCoordAttributeData.byteSize,
			object.texCoordAttributeData.byteOffset
		)

		gl.enableVertexAttribArray(positionAttribLocation);
		gl.enableVertexAttribArray(texCoordAttribLocation);
		
		var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
		var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
		var worldMatrix = new Float32Array(16);
		var projMatrix = new Float32Array(16);

		mat4.identity(worldMatrix);
		mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
		let timeLocation = gl.getUniformLocation(program, "time")
		gl.uniform1f(timeLocation, performance.now());

		var xRotationMatrix = new Float32Array(16);
		var yRotationMatrix = new Float32Array(16);

		var identityMatrix = new Float32Array(16);
		mat4.identity(identityMatrix);
		let angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		//mat4.rotate(yRotationMatrix, identityMatrix, angle, object.rotationAxis);
		//mat4.mul(worldMatrix, worldMatrix, yRotationMatrix);
		mat4.translate(
			worldMatrix,
			worldMatrix,
			[object.position[0], object.position[1], object.position[2]]
		)

		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);
		
	})
	
}

// INPUT
window.addEventListener("keypress", event => {
	let speed = 1;
	if(event.key == "w") {
		cameraZ -= speed;
	}
	if(event.key == "s") {
		cameraZ += speed;
	}
	if(event.key == "a") {
		cameraX -= speed;
	}
	if(event.key == "d") {
		cameraX += speed;
	}
	if(event.key == "e") {
		cameraY -= speed ;
	}
	if(event.key == "q") {
		cameraY += speed;
	}

	if(event.key == "i") {
		cameraXRotation += speed/8;
	}
	if(event.key == "k") {
		cameraXRotation -= speed/8;
	}
	if(event.key == "j") {
		cameraYRotation += speed/8;
	}
	if(event.key == "l") {
		cameraYRotation -= speed/8;
	}
	console.log({x: cameraX}, {y: cameraY}, {z: cameraZ});
})

function update() {

}

function loop(elements, gl, program, now) {
	var dt = Math.min(1, (now - last) / 1000);
	console.log(dt)
  	last = now;
	update();
	render(elements, gl, program);
	
	requestAnimationFrame(() => loop(elements, gl, program, now));
}