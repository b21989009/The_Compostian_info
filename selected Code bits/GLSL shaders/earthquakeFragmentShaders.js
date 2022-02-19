
const colorChanging_fragmentShader_withColor = `

    precision highp float;
  
    uniform vec3 objectColor;
    
    in float time_;

    out vec4 outColor;

    void main(){
    
        float colorJiggle = abs( sin(time_/4.0) ) * 0.8; 

        vec3 invertedColor = vec3 ( 1.0 - objectColor.r , 1.0 - objectColor.g, 1.0 - objectColor.b);

        float red   = mix( objectColor.r , invertedColor.r, colorJiggle );
        float green = mix( objectColor.g , invertedColor.g, colorJiggle );
        float blue  = mix( objectColor.b , invertedColor.b, colorJiggle );

        outColor = vec4(red, green, blue , 1.0);  
    }
`;




const colorChanging_fragmentShader_withTexture = `

    precision highp float;
  
    in vec2 UV_coordinates;
    uniform sampler2D basicTexture;

    in float time_;

    out vec4 outColor;

    void main(){
    
        float colorJiggle = abs( sin(time_ / 4.0) ) * 0.6; 
        
        vec3 textureColor = (texture(basicTexture, UV_coordinates)).xyz;
        
        vec3 invertedColor = vec3 ( 1.0 - textureColor.r , 1.0 - textureColor.g, 1.0 - textureColor.b);

        float red   = mix( textureColor.r , invertedColor.r, colorJiggle);
        float green = mix( textureColor.g , invertedColor.g, colorJiggle);
        float blue  = mix( textureColor.b , invertedColor.b, colorJiggle);

        outColor = vec4(red, green, blue , 1.0);  
    }
`;




const earthquakeResistant_fragmentShader = `

    precision highp float;
  
    in vec2 UV_coordinates;
    uniform sampler2D basicTexture;
    out vec4 outColor;

    void main(){
        outColor = vec4( (texture(basicTexture, UV_coordinates)).xyz , 1.0 );  
    }
`;
