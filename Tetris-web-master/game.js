/**
 * 
 * - OBSERVAÇÕES GERAIS:
 * 
 *  A MATRIZ PARA ACESSO DO TABULEIRO SER�? VARIAVEL[X][Y]
 *  O TOPO DO TABULEIRO TEM INDEX = 0, OU SEJA, A BASE TEM VALOR M�?XIMO
 * 
 * 
 * 
 * 
 * 
 * 
 */




/**
 * 
 * 
 * - Constantes do jogo
 * 
 * 
 */


// Atribuindo o código das setas e espaço
const DIREITA = 39;
const ESQUERDA = 37;
const CIMA = 38;
const BAIXO = 40;
const ESPACO = 32;
const P = 80;

//valor dos estados do jogo
const NOVO = 0;
const JOGANDO = 1
const PAUSADO = 2;
const GAMEOVER = 3;

//quantidade de ponto por linha
const PONTO = 10;

//base dos elementos
const ELEMENTOSGAME = [
    {
        'cor': '237, 55, 31',
        'posicao':[
            [true],
            [true],
            [true],
            [true],
        ]
        
    },
    {
        'cor': '224, 127, 22',
        'posicao':[
            [true,true],
            [true,true]
        ]
        
    },
    {
        'cor': '108, 242, 12',
        'posicao':[
            [true,false],
            [true,false],
            [true,true],
        ]
        
    },
    {
        'cor': '6, 212, 147',
        'posicao':[
            [false,true],
            [false,true],
            [true,true],
        ]
        
    },
    {
        'cor': '12, 119, 189',
        'posicao':[
            [false,true,false],
            [true,true,true],
        ]
        
    }
    ,
    {
        'cor': '191, 33, 177',
        'posicao':[
            [true,false,true],
            [true,true,true],
        ]
        
    }
];

const TAGCANVAS = 'tetris'; // guarda o nome da id do canvas



/**
 * 
 * 
 * 
 *  - Variaveis do jogo e suas configurações
 * 
 * 
 * 
 */

tabuleiro = []; //guardará todos os elementos que já subiram
proximo = -1; // guarda o indice do proximo elemento a se jogar
tempoPartida = 0; // guarda o tempo de partida



gameCanvas = null; //guarda o DOM do canvas
tetris = null;  //trata o canvas

rank = []; // guarda o rank
pontuacao = 0; // guarda a pontuacao do jogo
status = 0; // guarda o status atual do game
nivel = 0; // guarda o nível em que o jogador está
linhasEliminadas = 0;// guarda o total de linhas eliminadas


elemAtual = {
    elemento:0,
    posicao:{
        topo:0,
        esquerda:0
    },
    cor:'rgb(255,255,255)',
    bloco:[]
}; // guarda os dados do elemento atual

//configurações do jogo
config = {
    timeout:0, // guarda o tempo de repetição
    alturaElemento:0, //altura para cada bloquinho
    larguraElemento:0,// largura para cada bloquinho
    limiteLargura:0,//limite maximo para a esquerda
    loop:null, // guarda o looping do game
    cronometro:null, //guarda o looping do cronometro
};





/**
 * 
 * 
 * 
 *  - Funções do jogo
 * 
 * 
 */

//calcula o tamanho de cada bloquinho
function carregaConfig(){

    var e = $("#"+TAGCANVAS);

    
    clearInterval(config.cronometro);
    clearInterval(config.loop);

    //verica o tamanho do jogo
    if(e.hasClass('modo-10x20')){
        
        config.limiteLargura =  10;
        config.limiteAltura =  20;
        config.alturaElemento = e.height()/20 ;
        config.larguraElemento = e.width()/10 ;

    }else if(e.hasClass('modo-22x44')){
        config.limiteLargura =  22;
        config.limiteAltura =  44;
        config.alturaElemento = e.height()/44 ;
        config.larguraElemento = e.width()/22; 
    }    

    e.attr('height',e.height());
    e.attr('width',e.width());

    //tempo para que as peças se movam
    config.timeout = 1000;

    //inicializa o jogo
    pontuacao = 0;
    tempoPartida = 0;
    proximo = - 1;
    status = NOVO;

    nivel = 0;
    linhasEliminadas = 0;


    //exibe nivel
    $("#nivel").html(nivel);

    //exibe quantidade de linhas eliminadas
    $("#linhasEliminadas").html(linhasEliminadas);

    //exibe pontuação
    $("#tempo").html(converteTempo(tempoPartida));

    // inicia a pontuação
    $("#pontos").html(pontuacao);

    //gera o tabuleiro original do game
    tabuleiro = inicializaTabuleiro();

    //inicia o bloquinho do game
    criaBlocoAtual();

    //gera tabuleiro inicial
    escreveTabuleiro();
    

    rodarGame();

    

}

//inicia o tabuleiro
function inicializaTabuleiro(){
    var e = $("#"+TAGCANVAS);

    var retorno = [];

    for(i=0;i<config.limiteAltura;i++){
        retorno[i] = [];

        for(j=0;j<config.limiteLargura;j++){
            retorno[i][j] = false;
        }
    }

    return retorno;  
}


//vai diminiuir o intervalo de tempo
function diminuirIntervalo(){
    clearInterval(config.loop);

    nivel = Math.floor(pontuacao/500);

    //exibe nivel
    $("#nivel").html(nivel);


    if(config.timeout > 300)
        config.timeout = config.timeout - (nivel * 100);  

    //roda o looping do game
    config.loop = setInterval(
        function(){ 
            moveBloco(CIMA); 
        },config.timeout
    );

}


function converteTempo(tempo){
    var retorno = '';
    min = Math.floor(tempo/60);
    if(min < 10)
        retorno += "0";

    retorno+=min;

    seg = tempo%60;
    retorno+= ":";
    if(seg < 10)
        retorno += "0";
    retorno+=seg;

    return retorno;

}


//fazer o game startar/continuar após pausa/inicio
function rodarGame(){ 
       
      
    //roda o looping do cronometro
    config.cronometro = setInterval(
        function(){ 
            ++tempoPartida;
            $('#tempo').html(converteTempo(tempoPartida));
            //colocar a fun��o imprimir
        },1000
    );


    //roda o looping do game
    config.loop = setInterval(
        function(){ 
            moveBloco(CIMA); 
        },config.timeout
    );

    status = JOGANDO;

}

//pausar game
function pausaGame(){ 
    clearInterval(config.cronometro);
    clearInterval(config.loop);

    status = PAUSADO;
}

//chama a função quando der game over
function gameOver(){
    pausaGame();
    status = GAMEOVER;
    nomeJogador = prompt("Iniciais do jogador", "digite 3 caracters").trim();
    while(nomeJogador.length != 3){
        nomeJogador = prompt("Iniciais do jogador", "digite 3 caracters, por favor!");
    }
    rankSet(pontuacao,nomeJogador);
}


/**
 * 
 * 
 * 
 * - Funções ligada à dinamica do jogo
 * 
 * 
 * 
 */

//verifica se deu ponto
 function verificaLinha(linhas){

    var pontos = [];

    for(i=0;i<linhas.length;i++){

        var ponto = true;
        for(j=0;j<tabuleiro[linhas[i]].length;j++){
            if(tabuleiro[linhas[i]][j] === false){
                ponto = false;
                break;
            }
        }

        //caso tenha feito o ponto, adiciona na lista 
        if(ponto)
            pontos[pontos.length] = (linhas[i]);

    }

    //se houver pontos
    if(pontos.length){        

        //remove a linha, adiciona ao inicio da lista
        for(i=0;i<pontos.length;i++){
            tabuleiro.splice(pontos[i],1);
            tabuleiro.unshift([]);
        }

        for(i=0;i<pontos.length;i++){
            tabuleiro[i] = [];
            for(j=0;j<config.limiteLargura;j++){
                tabuleiro[i][j] = (false);
            }
        }

        linhasEliminadas += pontos.length;

        //exibe quantidade de linhas eliminadas
        $("#linhasEliminadas").html(linhasEliminadas);


        pontuacao += ((PONTO*pontos.length)*pontos.length);
        $("#pontos").html(pontuacao);

        diminuirIntervalo();
    }

    
    return true;


 }


//checa a existencia de outro bloco na frente
function criaBlocoAtual(){

    //caso -1, significa que ainda não há um proximo elemento(jogo novo)
    if(proximo == -1)
        proximo = Math.floor(Math.random()*ELEMENTOSGAME.length);//gera bloco aleatorio

    //resgata o proximo bloco
    var elemento = ELEMENTOSGAME[proximo];
        

    //seta o elemento atual
    elemAtual = {
        elemento: proximo,
        posicao:{
            topo:0,
            esquerda:0,
        },
        cor: 'rgb('+elemento.cor+')',
        bloco:elemento.posicao
    }; 



    //deixa no meio do tabuleiro
    elemAtual.posicao.esquerda = Math.floor(config.limiteLargura/2) - Math.floor(elemAtual.bloco[0].length/2) ;
    
    proximo = Math.floor(Math.random()*ELEMENTOSGAME.length);

    
    //checa se não haverá gameOver
    if(colisaoCima(elemAtual.bloco)){
        gameOver();
        return false;
    }
    /**elemProx = elemAtual;
    $("#peca").html(elemProx);**/
    return true;    
    
}

//aqui gerará o tabuleiro
function escreveTabuleiro(){

    //limpa a tela
    tetris.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    //pega o elemento atual
    var blocos = elemAtual.bloco;


    //caso dê gameover - não escreve o ultimo bloco
    if(status != GAMEOVER){

        //desenha o elemento atual
        for(var i=0; i < blocos.length;i++){
            for(var j=0; j < blocos[i].length;j++){
                if(blocos[i][j]){


                    var eixo = {
                        'x': (config.larguraElemento * (j+elemAtual.posicao.esquerda)),
                        'y': (config.alturaElemento  * (config.limiteAltura-1)) - 
                            (config.alturaElemento  * (elemAtual.posicao.topo+i))
                    } ;

                    tetris.fillStyle=elemAtual.cor;
                    tetris.fillRect(
                        eixo.x,
                        eixo.y,
                        config.alturaElemento,
                        config.larguraElemento
                    );
                                
                }
            }
        }

    }

    // desenha os blocos do tabuleiro
    // desenha as linhas
    for(var i=0; i < config.limiteAltura;i++){
        for(var j=0; j < config.limiteLargura;j++){

            var eixo = {
                'x': config.larguraElemento * j,
                'y': (config.alturaElemento  * (config.limiteAltura-1)) - 
                     (config.alturaElemento  * i)
            } ;

            if(tabuleiro[i][j] !== false){

                tetris.fillStyle=tabuleiro[i][j] ;
                tetris.fillRect(
                    eixo.x,
                    eixo.y,
                    config.alturaElemento,
                    config.larguraElemento
                );

            }

            //desenha as linhas do jogo
            tetris.strokeStyle = 'black';
            tetris.strokeRect(
                eixo.x,
                eixo.y,
                config.alturaElemento, 
                config.larguraElemento
            );

            

            
        }
    }


    //caso dê gameouver - avise na tela
    if(status == GAMEOVER){
        tetris.textAlign = "center";
        tetris.fillStyle = 'black';
        tetris.font="2em Tetris";
        tetris.fillText("GAME",(config.larguraElemento*config.limiteLargura)/2,205,(config.larguraElemento*config.limiteLargura)/2);
        tetris.fillText("OVER",(config.larguraElemento*config.limiteLargura)/2,255,(config.larguraElemento*config.limiteLargura)/2);    
    }

    //caso dê gameouver - avise na tela
    if(status == PAUSADO){
        tetris.textAlign = "center";
        tetris.fillStyle = 'black';
        tetris.font="2em Tetris";
        tetris.fillText("PAUSADO",(config.larguraElemento*config.limiteLargura)/2,205,(config.larguraElemento*config.limiteLargura)/2);
    }

}

//transforma da peça atual, para o tabuleiro
function gravaTabuleiro(matriz){

    var linhas = [];
    for(var i = 0; i < matriz.length;i++){

        linhas[linhas.length]=elemAtual.posicao.topo+i;

        for(var j = 0; j < matriz[i].length;j++){

            //verifica se o campo tem cor ou false
            if(matriz[i][j] !== false){
                topo =     elemAtual.posicao.topo+i;
                esquerda = elemAtual.posicao.esquerda+j;

                tabuleiro[topo][esquerda] = elemAtual.cor ;
            }

        }
    }

    
    
    //vê se gerou pontos
    verificaLinha(linhas);

}


//verifica se há uma colisão na direita
function colisaoDireita(matriz){

    var colidiu = false;

    for(var i = 0; i < matriz.length;i++){
        for(var j = 0; j < matriz[i].length;j++){

            if(
                matriz[i][j] &&
                tabuleiro[elemAtual.posicao.topo+i][elemAtual.posicao.esquerda+j+1] !== false
            ){
                colidiu = true;
                break;
            }

        }

        if(colidiu)
            break;

    }

    return colidiu;

}


//verifica se há uma colisão na esquerda
function colisaoEsquerda(matriz){

    var colidiu = false;

    for(var i = 0; i < matriz.length;i++){
        for(var j = 0; j < matriz[i].length;j++){

            if(
                matriz[i][j] &&
                tabuleiro[elemAtual.posicao.topo+i][elemAtual.posicao.esquerda+j-1] !== false
            ){
                colidiu = true;
                break;
            }

        }

        if(colidiu)
            break;

    }

    return colidiu;

}

//checa se há colisão de frente
function colisaoCima(matriz){

    var colidiu = false;

    for(var i = 0; i < matriz.length;i++){
        for(var j = 0; j < matriz[i].length;j++){

            //sempre entrará nesse ponto
            if(
                (
                   matriz[i][j] &&
                   tabuleiro[elemAtual.posicao.topo+i+1][elemAtual.posicao.esquerda+j] !== false                          
                ) ||
                (elemAtual.posicao.topo == config.limiteAltura - elemAtual.bloco.length)
            ){
                colidiu = true;
                break;
            }

        }

        if(colidiu)
            break;

    }
    return colidiu;

}


//rotaciona em 90 graus a matriz atual
function rotacionaMatriz(){

    var blocoAtual = elemAtual.bloco;

    //matriz auxiliar para a rotação
    var blocoNovo = [];

    for(var i = 0; i < blocoAtual.length;i++){
        for(var j = 0; j < blocoAtual[i].length;j++){ 
            
            index = blocoAtual[i].length - j - 1;

            // gera um array dentro doutro
            if(i == 0)
                blocoNovo[index] = [];   

            //inverte as posições    
            blocoNovo[index][i] 
                = blocoAtual[i][j];
        }
    }


    //verifica se não chocará com nada, caso choque, não gira
    if(
        colisaoCima(blocoNovo) && colisaoDireita(blocoNovo) ||
        !(elemAtual.posicao.topo + blocoNovo.length - 1 < config.limiteAltura)  ||
        !(elemAtual.posicao.esquerda <= config.limiteLargura - blocoNovo[0].length)   
    ){
        return false;
    }
    //salva o bloco girado em 90 graus
    elemAtual.bloco = blocoNovo;

    //sem erro
    return true;

}

function musica(){
    var x = document.getElementById("som");
    var y = document.getElementById("som-image");
    if(y.getAttribute("src") == "image/som.jpg"){
        x.pause();
        y.setAttribute("src","image/sem-som.jpg")
    }
    else{
        x.play();
        y.setAttribute("src","image/som.jpg")
    }
}

function rankSet(pontos,nome){
    
    rank[rank.length] = {
        'ponto': pontos,
        'nome': nome,
        'nivel': nivel,
        'linhasEliminadas': linhasEliminadas,
        'tempo': tempoPartida,
    };

    // ordena por bolha
    for(var i=0;i<rank.length;i++){
        for(var j=0;j<i;j++){
            if(rank[i].ponto > rank[j].ponto){
                var temp = rank[j];
                rank[j] = rank[i];
                rank[i] = temp;
            }
        }
    }

    if(rank.length - 5 > 0){
        rank.splice(i,rank.length - 5);
    }

    html = 'Rank<br><br>';
    html+= '<span>Nome Ponto Nivel Linhas E.<span><br>';
    for(var i=0;i<rank.length;i++){
        html+= '<p class="ranked">'+rank[i].nome+"..."+rank[i].ponto+"..."+rank[i].nivel+"..."+rank[i].linhasEliminadas+"..."+rank[i].tempo+'</p><br>';
    }

    $("#rank").html(html);

}


//tratará os movimentos dos bloquinhos
function moveBloco(tipo){
    switch(tipo){
        case CIMA:
            if(elemAtual.posicao.topo + elemAtual.bloco.length < config.limiteAltura && !colisaoCima(elemAtual.bloco)){
                ++elemAtual.posicao.topo;
            }else if(status == JOGANDO){
                gravaTabuleiro(elemAtual.bloco);
                criaBlocoAtual();
            }
                
            break;
        case ESQUERDA:
            if(elemAtual.posicao.esquerda > 0 && !colisaoEsquerda(elemAtual.bloco))
                --elemAtual.posicao.esquerda;
            break;
        case DIREITA:
            if(elemAtual.posicao.esquerda <= config.limiteLargura - elemAtual.bloco[0].length - 1  && !colisaoDireita(elemAtual.bloco))
                ++elemAtual.posicao.esquerda;
            break;
        case BAIXO:
            rotacionaMatriz();
            break;

        case P:
            
            var pause = document.getElementById("pause").getAttribute("src")
            
            if( pause == "image/pause.jpg")
                document.getElementById("pause").setAttribute( "src", "image/play.jpg");
            else
                document.getElementById("pause").setAttribute( "src", "image/pause.jpg");
                            
            if(status == PAUSADO)
                rodarGame();
            else if(status == JOGANDO)
                pausaGame();
            break;
            
        case ESPACO:
            while(elemAtual.posicao.topo + elemAtual.bloco.length < config.limiteAltura && !colisaoCima(elemAtual.bloco))
                moveBloco(CIMA);
            break;
    }

    escreveTabuleiro();

}




$(document).ready(function(){
   


    /**
     * 
     * 
     * 
     *  - Tratamento do canvas
     * 
     * 
     * 
     */
    gameCanvas = document.getElementById(TAGCANVAS);
    tetris = gameCanvas.getContext('2d');   





    /**
     * 
     * 
     *  - Inicialização
     * 
     * 
     * 
     */

    //inicializa as variaveis do game
    carregaConfig();
    
    


    /**
     * 
     * 
     * 
     *  - Tratamento dos eventos
     * 
     * 
     */
    //pega os botões a ser precionados
    $(window).on('keyup',function(e){
        moveBloco(e.keyCode);        
    });

    $("#rk").click(function(){
        var visivel = $("#rank").is(":visible");
        if(!visivel){
            $("#rank").show();
            pausaGame();
        }
        else{
            $("#rank").hide();
            rodarGame();
        }
    });
    
    $("#tamanhoP").on('click',function(e){
       $("#tetris").removeClass('modo-22x44').removeClass('modo-10x20').addClass('modo-10x20');
        carregaConfig();
    });
    $("#tamanhoG").on('click',function(e){
       $("#tetris").removeClass('modo-22x44').removeClass('modo-10x20').addClass('modo-22x44');
        carregaConfig();
    });
});
