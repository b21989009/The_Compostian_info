

const fragmentShader_Phong_basicColor = `

    precision highp float;
    
    in vec3 L;
    in vec3 N;
    in vec3 V;
    in float attenuation;
    in vec3 shineAt;
    
    uniform vec3 objectColor;
    out vec4 outColor;
    
    uniform float ambientDaylight;
    /* Daylight is implemented as ambient. Looks better than a directional or point source, because those sources 
       make many edges appear darker since we do not ray-trace reflections of reflections. 

       Daylight gets darker in late hours of day via animation. 
    */


    /* Spotlight */
    uniform vec3 diffuseProduct;
    uniform vec3 specularProduct;
    uniform float shininess;
    uniform float isSpotlightEnabled;


    void main(){
    
        // Blinn-Phong illumination equation

        float Kd = max( dot(L, N), 0.0 );
        vec3  diffuse = Kd * diffuseProduct;

        vec3 Halfway = normalize( L + V ); 
        float Ks = pow( max(dot(N, Halfway), 0.0), shininess );
        vec3  specular = Ks * specularProduct;

        if( dot(L, N) < 0.0 ) {
            // light is behind the object or camera does not see it
            specular = vec3(0.0, 0.0, 0.0);
        } 
        
        
        
        /*** SPOTLIGHT */

        /* A Spotlight is a point-source light, with an imaginary cone around it that restricts the light beams 
           within the scope of cutoff angle. 
        
        To establish this restriction, first, lets look at the Dot Product Formula:
            A dot B  =  |A| * |B| * cos( angle between )
            cos( angle between )  =  (A dot B) / (|A| * |B|) 
              
        We want to light ONLY the parts of the scene where 
        the angle between  spotlightDirection "shineAt"  and  vectorFromLightToVertex "-L"  is less than the cutoff angle we set. 
        */

        float cutoffAngle = radians (20.0);    // arbitrary
        float cutoffValue = cos(cutoffAngle);
        float currentValue = dot(-L, shineAt) / length(L) / length(shineAt);
        
        if( currentValue < cutoffValue ) {
            // No light beams outside the desired scope cone of Spotlight. 
            specular = vec3(0.0, 0.0, 0.0);
            diffuse  = vec3(0.0, 0.0, 0.0);
        } 


        vec3 spotlightIntensity = isSpotlightEnabled * attenuation * (diffuse + specular);
   
        vec3 totalLight = vec3(ambientDaylight, ambientDaylight, ambientDaylight) + spotlightIntensity;

        outColor = vec4 ( totalLight * objectColor  , 1.0);

    }
`;



const fragmentShader_Phong_basicTexture = `

    precision highp float;
    
    in vec3 L;
    in vec3 N;
    in vec3 V;
    in float attenuation;
    in vec3 shineAt;
    
    in vec2 UV_coordinates;
    uniform sampler2D basicTexture;
    out vec4 outColor;
    
    uniform float ambientDaylight;
    /* Daylight is implemented as ambient. Looks better than a directional or point source, because those sources 
       make many edges appear darker since we do not ray-trace reflections of reflections. 

       Daylight gets darker in late hours of day via animation. 
    */


    /* Spotlight */
    uniform vec3 diffuseProduct;
    uniform vec3 specularProduct;
    uniform float shininess;
    uniform float isSpotlightEnabled;


    void main(){
    
        // Blinn-Phong illumination equation

        float Kd = max( dot(L, N), 0.0 );
        vec3  diffuse = Kd * diffuseProduct;

        vec3 Halfway = normalize( L + V ); 
        float Ks = pow( max(dot(N, Halfway), 0.0), shininess );
        vec3  specular = Ks * specularProduct;

        if( dot(L, N) < 0.0 ) {
            // light is behind the object or camera does not see it
            specular = vec3(0.0, 0.0, 0.0);
        } 



        /*** SPOTLIGHT */

        /* A Spotlight is a point-source light, with an imaginary cone around it that restricts the light beams 
           within the scope of cutoff angle. 
        
        To establish this restriction, first, lets look at the Dot Product Formula:
            A dot B  =  |A| * |B| * cos( angle between )
            cos( angle between )  =  (A dot B) / (|A| * |B|) 
              
        We want to light ONLY the parts of the scene where 
        the angle between  spotlightDirection "shineAt"  and  vectorFromLightToVertex "-L"  is less than the cutoff angle we set. 
        */

        float cutoffAngle = radians (20.0);    // arbitrary
        float cutoffValue = cos(cutoffAngle);
        float currentValue = dot(-L, shineAt) / length(L) / length(shineAt);
        
        if( currentValue < cutoffValue ) {
            // No light beams outside the desired scope cone of Spotlight. 
            specular = vec3(0.0, 0.0, 0.0);
            diffuse  = vec3(0.0, 0.0, 0.0);
        } 



        vec3 spotlightIntensity = isSpotlightEnabled * attenuation * (diffuse + specular);
   
        vec3 totalLight = vec3(ambientDaylight, ambientDaylight, ambientDaylight) + spotlightIntensity;

        vec3 textureColor = (texture(basicTexture, UV_coordinates)).xyz;

        outColor = vec4( totalLight * textureColor , 1.0);

    }
`;



