

let earthquakeShaderMaterial_withColor = function( color_r, color_g, color_b ){

    let newMaterial = new THREE.ShaderMaterial({
        vertexShader: earthquake_vertexShader_withColor,
        fragmentShader: colorChanging_fragmentShader_withColor,
        uniforms: {
            objectColor: {value: new THREE.Vector3(color_r, color_g, color_b)},
            time: {value: 0.0}
        },
        glslVersion: THREE.GLSL3,
    });

    allEarthquakeMaterials.push(newMaterial);
    return newMaterial;
}



let earthquakeShaderMaterial_withTexture = function(texture){

    let newMaterial = new THREE.ShaderMaterial({
        vertexShader: earthquake_vertexShader_withTexture,
        fragmentShader: colorChanging_fragmentShader_withTexture,
        uniforms: {
            basicTexture: {value: texture},
            time: {value: 0.0}
        },
        glslVersion: THREE.GLSL3,
    });

    allEarthquakeMaterials.push(newMaterial);
    return newMaterial;
}



let earthquakeResistantMaterial = function(texture){

    return new THREE.ShaderMaterial({
        vertexShader: earthquakeResistant_vertexShader,
        fragmentShader: earthquakeResistant_fragmentShader,
        uniforms: {
            basicTexture: {value: texture},
        },
        glslVersion: THREE.GLSL3,
    });
}
