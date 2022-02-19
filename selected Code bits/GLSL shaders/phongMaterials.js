
const lightUniforms = {

    ambientDaylight: {value: 0.99},

    // SPOTLIGHT
    diffuseProduct: {value: new THREE.Vector3 (1.0 , 1.0, 1.0)},
    specularProduct: {value: new THREE.Vector3 (0.7 , 0.7, 0.7)},
    shininess: {value: 30.0},
    isSpotlightEnabled: {value: 0.0},
    spotlightPosition: {value: new THREE.Vector3(0.0,20.0,0.0)},
    spotlightDirection: {value: new THREE.Vector3(0.0,-1.0,0.0)}

    /* These uniforms are same for all objects,
        since most of our imported models do not store any material properties other than base color.
        It is also better for consistency of visuals.
    */
};



// Phong Shader Program for objects without Textures
let basicColored_PHONG_Material = function( color_r, color_g, color_b ){

    let uniforms = THREE.UniformsUtils.merge( [
        lightUniforms,
        {objectColor: {value: new THREE.Vector3(color_r, color_g, color_b)} }
    ]);


    let newMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader_Phong_basicColor,
        fragmentShader: fragmentShader_Phong_basicColor,
        uniforms: uniforms,
        glslVersion: THREE.GLSL3,
    });

    allPhongMaterials.push(newMaterial);
    return newMaterial;
}



// Phong Shader Program for objects with Texture
let basicTextured_PHONG_Material = function( texture ){

    let uniforms = THREE.UniformsUtils.merge( [
        lightUniforms,
        {basicTexture: {value: texture}}
    ]);


    let newMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader_Phong_basicTexture,
        fragmentShader: fragmentShader_Phong_basicTexture,
        uniforms: uniforms,
        glslVersion: THREE.GLSL3,
    });

    newMaterial.uniforms.basicTexture.value = texture;
    // the merge function above copies texture object's value, but we needed the reference, thus we reassign it.

    allPhongMaterials.push(newMaterial);
    return newMaterial;
}

