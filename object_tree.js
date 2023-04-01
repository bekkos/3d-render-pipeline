let orange_car_object;
let orange_car_texture;
let test_texture = new Image();
test_texture.src = "./objects/test-texture.jpg";

fetch("./objects/orange_car/orange_car_model.json")
.then((response) => response.json())
.then(data => orange_car_object = data);

fetch("./objects/orange_car/orange_car_texture.png")
.then((response) => response.body)
.then(data => orange_car_texture = data);

var elements = [
    {
        id: 0,
        position: [5,0,5],
        rotationAxis: [0,0,0],
        vertices: orange_car_object.meshes[0].vertices,
        indices: [].concat.apply([], orange_car_object.meshes[0].faces),
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
        textureBufferObject: null
    },
    {
        id: 1,
        position: [0,0,0],
        rotationAxis: [0,0,0],
        vertices: 
        [ // X, Y, Z           
            // Top
            -1.0, 1.0, -1.0, 
            -1.0, 1.0, 1.0,  
            1.0, 1.0, 1.0,   
            1.0, 1.0, -1.0,  

            // Left
            -1.0, 1.0, 1.0,  
            -1.0, -1.0, 1.0, 
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0, 

            // Right
            1.0, 1.0, 1.0,  
            1.0, -1.0, 1.0, 
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0, 

            // Front
            1.0, 1.0, 1.0,  
            1.0, -1.0, 1.0,  
            -1.0, -1.0, 1.0,  
            -1.0, 1.0, 1.0,  

            // Back
            1.0, 1.0, -1.0,  
            1.0, -1.0, -1.0,  
            -1.0, -1.0, -1.0,  
            -1.0, 1.0, -1.0,  

            // Bottom
            -1.0, -1.0, -1.0, 
            -1.0, -1.0, 1.0,  
            1.0, -1.0, 1.0,   
            1.0, -1.0, -1.0,  
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
        texture: document.getElementById("crate-image"),
        textureCoordinates: [
            0, 0,
            0, 1,
            1, 1,
            1, 0,
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            1, 1,
            0, 1,
            0, 0,
            1, 0,
            1, 1,
            1, 0,
            0, 0,
            0, 1,
            0, 0,
            0, 1,
            1, 1,
            1, 0,
            1, 1,
            1, 0,
            0, 0,
            0, 1,
        ],
        positionAttributeData: {
            elementsPerInstance: 3,
            type: gl.FLOAT,
            normalized: gl.FALSE,
            byteSize: 3 * Float32Array.BYTES_PER_ELEMENT,
            byteOffset: 0
        },
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
        textureBufferObject: null
    }
];

export { elements };