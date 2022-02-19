

const vertexShader_Phong_basicColor = `

    uniform vec3 spotlightPosition;
    uniform vec3 spotlightDirection;
    
    // Built-in "in" attributes such as "position" and "normal" are not declared here, 
    //  since they are automatically inserted and filled by BufferGeometry. 
    out vec3 L;
    out vec3 N;
    out vec3 V;
    out float attenuation;
    out vec3 shineAt;


    void main(){

        /* LIGHTING */

        // !!! Three.js provides "position" attribute in object coordinates. We need world coordinates.
        vec3 vertexPosition = ( modelMatrix * vec4(position, 1.0) ).xyz;

        // Transform vertex position into eye coordinates
        vec3 pos = ( modelViewMatrix * vec4(vertexPosition,1.0) ).xyz; 
    
        // Vector from vertex to spotlight in eye coordinates. 
        L = normalize( (modelViewMatrix * vec4(spotlightPosition, 1.0)) - vec4(pos, 1.0) ).xyz; 

        // view vector in eye coordinates from vertex to camera 
        V = normalize( - pos ); 

        // Transform vertex normal into eye coordinates
        N = normalize( normalMatrix * normal );     

        // light direction in eye coordinates
        shineAt = normalize( modelViewMatrix * vec4(spotlightDirection, 0.0) ).xyz;   
        
        float distanceFromVertexToSpotlight = length ( vertexPosition - spotlightPosition );
        attenuation = 1.0 / ( 1.0 +  ( 0.5 * normalize( distanceFromVertexToSpotlight * distanceFromVertexToSpotlight ) ) );


        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    }
`;



const vertexShader_Phong_basicTexture = `

    uniform vec3 spotlightPosition;
    uniform vec3 spotlightDirection;
    out vec2 UV_coordinates;
    
    // Built-in "in" attributes such as "position" and "normal" are not declared here,
    //  since they are automatically inserted and filled by BufferGeometry. 
    out vec3 L;
    out vec3 N;
    out vec3 V;
    out float attenuation;
    out vec3 shineAt;


    void main(){

        /* LIGHTING */
        
        // !!! Three.js provides "position" attribute in object coordinates. We need world coordinates.
        vec3 vertexPosition = ( modelMatrix * vec4(position, 1.0) ).xyz;

        // Transform vertex position into eye coordinates
        vec3 pos = ( modelViewMatrix * vec4(vertexPosition,1.0) ).xyz; 
    
        // Vector from vertex to spotlight in eye coordinates. 
        L = normalize( (modelViewMatrix * vec4(spotlightPosition, 1.0)) - vec4(pos, 1.0) ).xyz; 

        // view vector in eye coordinates from vertex to camera 
        V = normalize( - pos ); 

        // Transform vertex normal into eye coordinates
        N = normalize( normalMatrix * normal );     
        
        // light direction in eye coordinates
        shineAt = normalize( modelViewMatrix * vec4(spotlightDirection, 0.0) ).xyz;   

        float distanceFromVertexToSpotlight = length ( vertexPosition - spotlightPosition );
        attenuation = 1.0 / ( 1.0 +  ( 0.5 * normalize( distanceFromVertexToSpotlight * distanceFromVertexToSpotlight ) ) );


        UV_coordinates = uv; 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;



