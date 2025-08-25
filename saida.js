import * as THREE from 'three';
import * as TEX from './texturingfuncs.js'

export function saidaArea()
{
    //   ORIENTATION : back == z+ , left == x-


    let centro=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),new THREE.MeshLambertMaterial('red'));
    let largura=16;
    let comprimento=16;
    let altura=16;
    let espessuraParede=1.5;
    let paredeGeometryFronte = new THREE.BoxGeometry(largura-2*espessuraParede,altura,espessuraParede);
    let paredeGeometryLateral = new THREE.BoxGeometry(espessuraParede,altura,comprimento-2*espessuraParede);
    let teto= new THREE.Mesh(new THREE.BoxGeometry(largura-2*espessuraParede,1,comprimento-2*espessuraParede),TEX.boxTexture(['./T3_assets/saida.jpg'],largura-2*espessuraParede,1,comprimento-2*espessuraParede));
    centro.add(teto);
    teto.translateY(altura-0.5);

    let paredeGeometryFronteColision = new THREE.BoxGeometry(largura-2*espessuraParede+1,altura,espessuraParede+1);
    let paredeGeometryLateralColision = new THREE.BoxGeometry(espessuraParede+1,altura,comprimento-2*espessuraParede+1);
    let colMaterial = new THREE.MeshLambertMaterial({color:"grey"});
    
    let paredeDireitaColision=new THREE.Mesh(paredeGeometryLateralColision,colMaterial);
    let paredeEsquerdaColision=new THREE.Mesh(paredeGeometryLateralColision,colMaterial);
    let paredeFrenteColision = new THREE.Mesh(paredeGeometryFronteColision,colMaterial);
    let paredeTrasColision = new THREE.Mesh(paredeGeometryFronteColision,colMaterial);
    let cantoGeometry = new THREE.BoxGeometry(0.5,altura,0.5);
    

    centro.coliders=[paredeTrasColision,paredeDireitaColision,paredeEsquerdaColision,paredeFrenteColision];


    let paredeMaterialLateral = TEX.boxTexture(['./T3_assets/saida.jpg'],espessuraParede,altura,comprimento-2*espessuraParede);
    let paredeMaterialFronte = TEX.boxTexture(['./T3_assets/saida.jpg'],largura-2*espessuraParede,altura,espessuraParede);
    
    let paredeTras=new THREE.Mesh(paredeGeometryFronte,paredeMaterialFronte);
    let paredeFrente=new THREE.Mesh(paredeGeometryFronte,paredeMaterialFronte);
    let paredeEsquerda=new THREE.Mesh(paredeGeometryLateral,paredeMaterialLateral);
    let paredeDireita= new THREE.Mesh(paredeGeometryLateral,paredeMaterialLateral);

    paredeTras.castShadow=true;
    paredeTras.recieveShadow=true;

    paredeFrente.castShadow=true;
    paredeFrente.recieveShadow=true;

    paredeEsquerda.castShadow=true;
    paredeEsquerda.recieveShadow=true;

    paredeDireita.castShadow=true;
    paredeDireita.recieveShadow=true;

    centro.meshes=[paredeTras,paredeDireita,paredeEsquerda,paredeFrente];
    for(let i=0;i<centro.meshes.length;i++)
        centro.add(centro.meshes[i]);
    paredeTras.translateZ(comprimento/2 - 3*espessuraParede/2);
    paredeTras.translateY(altura/2+0.05);
    
    paredeFrente.translateZ((-1)*(comprimento/2 - 3*espessuraParede/2));
    paredeFrente.translateY(altura/2+0.05);

    paredeDireita.translateX(largura/2 - 3*espessuraParede/2);
    paredeDireita.translateY(altura/2+0.05);
    
    paredeEsquerda.translateX((-1)*(largura/2 - 3*espessuraParede/2));
    paredeEsquerda.translateY(altura/2+0.05);

    for(let i=0;i<centro.coliders.length;i++)
    {
        centro.add(centro.coliders[i]);
        centro.coliders[i].visible=false;
        centro.coliders[i].position.copy(centro.meshes[i].position);

    }

    let cantoLU=new THREE.Mesh(cantoGeometry,colMaterial); //left upper
    let cantoLD=new THREE.Mesh(cantoGeometry,colMaterial);//left down
    let cantoRU=new THREE.Mesh(cantoGeometry,colMaterial);//right up
    let cantoRD=new THREE.Mesh(cantoGeometry,colMaterial);//right down

    centro.cantos=[cantoLD,cantoLU,cantoRD,cantoRU];
    for(let i=0;i<centro.cantos.length;i++)
    {
        centro.add(centro.cantos[i]);
        centro.cantos[i].visible=false;
    }
    
    cantoLD.position.copy(paredeEsquerdaColision.position);
    cantoLD.translateZ(((comprimento-2*espessuraParede)/2+0.5 +0.25));
    cantoLD.translateX((-espessuraParede/2-0.5 -0.25));
    

    cantoLU.position.copy(paredeEsquerdaColision.position);
    cantoLU.translateZ((-1)*((comprimento-2*espessuraParede)/2+0.5 +0.25));
    cantoLU.translateX((-espessuraParede/2-0.5 -0.25));

    cantoRD.position.copy(paredeDireitaColision.position);
    cantoRD.translateZ(((comprimento-2*espessuraParede)/2+0.5 +0.25));
    cantoRD.translateX((-1)*(-espessuraParede/2-0.5 -0.25));

    cantoRU.position.copy(paredeDireitaColision.position);
    cantoRU.translateZ((-1)*((comprimento-2*espessuraParede)/2+0.5 +0.25));
    cantoRU.translateX((-1)*(-espessuraParede/2-0.5 -0.25));
    



    centro.coliders[0].translateZ(0.5);
    centro.coliders[1].translateX(0.5);
    centro.coliders[2].translateX(-0.5);
    centro.coliders[3].translateZ(-0.5);

    centro.portaSaida=[paredeFrente,paredeFrenteColision];

    console.log(centro.meshes);
    return centro;
}