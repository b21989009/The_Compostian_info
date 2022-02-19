

const earthquake_vertexShader_withColor = `

    uniform float time;
    out float time_;

    void main(){

        time_ = time;
        
        float jiggle = sin(time) / 10.0; 

        float jiggled_x = position.x + (jiggle * position.y);
        float jiggled_z = position.z + (jiggle * position.y);

        vec3 jiggledPosition = vec3(jiggled_x + jiggle/3.0 , position.y, jiggled_z);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(jiggledPosition, 1.0);
    }
`;



const earthquake_vertexShader_withTexture = `

    uniform float time;
    out vec2 UV_coordinates;
    out float time_;

    void main(){

        time_ = time;
        
        float jiggle = sin(time) / 10.0; 

        float jiggled_x = position.x + (jiggle * position.y);
        float jiggled_z = position.z + (jiggle * position.y);

        vec3 jiggledPosition = vec3(jiggled_x + jiggle/3.0 , position.y, jiggled_z);
        
        UV_coordinates = uv; 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(jiggledPosition, 1.0);
    }
`;



const earthquakeResistant_vertexShader = `

    out vec2 UV_coordinates;

    void main(){
        UV_coordinates = uv; 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

