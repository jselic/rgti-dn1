/*Canvas initialization and context*/
const canvas = document.getElementById('drawingBoard');
const ctx = canvas.getContext('2d');


/*Global variables definition*/
var vertices = [];
var triangles = [];
var rotationByX=0;
var rotationByY=0;
var rotationByZ=0;
var translationOnX = 0;
var translationOnY = 0;
var translationOnZ = 0;
var scaleOnX = 1;
var scaleOnY = 1;
var scaleOnZ = 1;
var perspectiveView = 1;

/*Tools for responsive controls*/
document.getElementById('rotXControls').addEventListener('change',function(){
    document.getElementById('labelRotX').innerHTML = this.value;
    rotationByX=this.value;
    draw();
});
document.getElementById('rotYControls').addEventListener('change',function(){
    document.getElementById('labelRotY').innerHTML = this.value;
    rotationByY=this.value;
    draw();
});
document.getElementById('rotZControls').addEventListener('change',function(){
    document.getElementById('labelRotZ').innerHTML = this.value;
    rotationByZ=this.value;
    draw();
});
document.getElementById('transXControls').addEventListener('change',function(){
    document.getElementById('labelTransX').innerHTML = this.value-10;
    translationOnX=this.value;
    draw();
});
document.getElementById('transYControls').addEventListener('change',function(){
    document.getElementById('labelTransY').innerHTML = this.value-10;
    translationOnY=this.value;
    draw();
});
document.getElementById('transZControls').addEventListener('change',function(){
    document.getElementById('labelTransZ').innerHTML = this.value-10;
    translationOnZ=this.value;
    draw();
});
document.getElementById('scaXControls').addEventListener('change',function(){
    document.getElementById('labelScaX').innerHTML = this.value;
    scaleOnX=this.value;
    draw();
});
document.getElementById('scaYControls').addEventListener('change',function(){
    document.getElementById('labelScaY').innerHTML = this.value;
    scaleOnY=this.value;
    draw();
});
document.getElementById('scaZControls').addEventListener('change',function(){
    document.getElementById('labelScaZ').innerHTML = this.value;
    scaleOnZ=this.value;
    draw();
});
document.getElementById('persControls').addEventListener('change',function(){
    document.getElementById('labelPers').innerHTML = this.value;
    perspectiveView=this.value;
    draw();
});


/*Event listener for the file upolad element for metadata*/
const fileSelector = document.getElementById('filePath');
fileSelector.addEventListener('change', function(){
    const type = fileSelector.type ? fileSelector.type : 'NOT SUPPORTED';
    const size = fileSelector.size ? fileSelector.size : 'NOT SUPPORTED';
    document.getElementById('fileMetadata').innerHTML = "Chosen " + type + " of size " + size + "B";
});

/*The necessary function realizations*/
function rotateX(alpha){
    return glMatrix.mat4.fromValues(1,0,0,0/**/,0,Math.cos(alpha),-Math.sin(alpha),0/**/,0,Math.sin(alpha),Math.cos(alpha),0/**/,0,0,0,1);
}
function rotateY(alpha){
    return glMatrix.mat4.fromValues(Math.cos(alpha),0,Math.sin(alpha),0/**/,0,1,0,0/**/,-Math.sin(alpha),0,Math.cos(alpha),0/**/,0,0,0,1);
}
function rotateZ(alpha){
    return glMatrix.mat4.fromValues(Math.cos(alpha),-Math.sin(alpha),0,0/**/,Math.sin(alpha),Math.cos(alpha),0,0/**/,0,0,1,0/**/,0,0,0,1);
}
function translate(dX,dY,dZ){
    return glMatrix.mat4.fromValues(1,0,0,dX,0,1,0,dY,0,0,1,dZ,0,0,0,1);
}
function scale(sX,sY,sZ){
    return glMatrix.mat4.fromValues(sX,0,0,0,0,sY,0,0,0,0,sZ,0,0,0,0,1);
}
function perspective(d){
    return glMatrix.mat4.fromValues(1,0,0,0/**/,0,1,0,0/**/,0,0,1,0/**/,0,0,1/d,0);
}
function cameraView(x,z,y){
    return glMatrix.mat4.fromValues(1,0,0,x,0,1,0,y,0,0,1,z,0,0,0,1);
}

/*Save file data into arrays. Vertices and triangles separately*/
function readFile(input){
    const file = input.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(){
        var lines = this.result.split('\n');
        for(var line = 0; line<lines.length; line++){
            var words = lines[line].split(' ');
            if (words[0]=="v"){
                vertices.push([words[1],words[2],words[3],1]);
            }else if (words[0]=="f"){
                triangles.push([words[1],words[2],words[3]]);
            }
        }
        console.log(vertices);
        console.log(triangles);

        
        
    };
}


function draw(){
    /*Clear canvas of previous drawings*/
    ctx.clearRect(0,0,canvas.clientWidth,canvas.height);

    /*Applying matrix transformations*/
    var mesh = glMatrix.mat4.create();
    glMatrix.mat4.multiply(mesh,scale(scaleOnX,scaleOnY,scaleOnZ),rotateX(rotationByX));
    glMatrix.mat4.multiply(mesh,mesh,rotateY(rotationByY));
    glMatrix.mat4.multiply(mesh,mesh,rotateZ(rotationByZ));
    glMatrix.mat4.multiply(mesh,mesh,translate(translationOnX,translationOnY,translationOnZ));
    glMatrix.mat4.multiply(mesh,mesh,cameraView(0,0,-8));
    glMatrix.mat4.multiply(mesh,mesh,perspective(perspectiveView));

    /*Transforming vertices (manually, because stupid mat4 doesn't have the function :/)*/
    for(var i = 0;i<vertices.length;i++){
        for(var j = 0;j<4;j++){
            vertices[i][j] = mesh[j*4+0]*vertices[i][0] + mesh[j*4+1]*vertices[i][1] + mesh[j*4+2]*vertices[i][2] + mesh[j*4+3]*vertices[i][3];
        }
    }

    /*And normalizing them*/
        /*for(var i = 0;i<vertices.length;i++){
            for(var j = 0;j<4;j++){
                vertices[i][j]/=vertices[i][3];
            }
        }*/


    /*Drawing triangles*/
    for(var i = 0;i<triangles.length;i++){
        ctx.beginPath();
        ctx.moveTo(vertices[triangles[i][0]-1][0],vertices[triangles[i][0]-1][1]);
        ctx.lineTo(vertices[triangles[i][1]-1][0],vertices[triangles[i][1]-1][1]);
        ctx.lineTo(vertices[triangles[i][2]-1][0],vertices[triangles[i][2]-1][1]);
        ctx.lineTo(vertices[triangles[i][0]-1][0],vertices[triangles[i][0]-1][1]);
        ctx.stroke();
    }

    /*And resetting vertices*/
    const input = document.getElementById('filePath');
    const file = input.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(){
        var lines = this.result.split('\n');
        for(var line = 0; line<lines.length; line++){
            var words = lines[line].split(' ');
            if (words[0]=="v"){
                vertices[line]=[words[1],words[2],words[3],1];
            }
        }
        //console.log(vertices);
        //console.log(triangles);

        
        
    };
}
