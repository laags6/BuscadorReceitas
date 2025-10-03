let caixaTexto = document.getElementById('caixa-texto');
let botaoBuscar = document.getElementById('botao-buscar');
let listaReceitas = document.getElementById('lista-receitas');
let camera = document.getElementById('camera');
let foto = document.getElementById('foto');
let ligarCamera = document.getElementById('ligar-camera');
let tirarFoto = document.getElementById('tirar-foto');
let desligarCamera = document.getElementById('desligar-camera');
let popup = document.getElementById('popup');
let detalhes = document.getElementById('detalhes');
let fechar = document.getElementById('fechar');

// Variável para guardar a câmera ligada
let cameraLigada = null;

// Quando clicar no botão buscar
botaoBuscar.onclick = function() {
    buscar();
};

// Quando apertar Enter no campo de texto
caixaTexto. onkeypress = function(e) {
    if (e.key === 'Enter') {
        buscar();
    }
};

// Função que busca receitas na internet
function buscar() {
    let texto = caixaTexto.value;
    
    // Se não digitou nada, avisa
    if (texto === '') {
        alert('Digite o nome de uma receita!');
        return;
    }
    
    // Mostra mensagem de carregamento
    listaReceitas.innerHTML = '<p>Procurando receitas...</p>';
    
    // Busca na API (site que tem receitas)
    fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + texto)
        .then(function(resposta) {
            return resposta.json();
        })
        .then(function(dados) {
            mostrarReceitas(dados.meals);
        })
        .catch(function() {
            listaReceitas.innerHTML = '<p>Erro ao buscar receitas :(</p>';
        });
}

// Função que mostra as receitas na tela
function mostrarReceitas(receitas) {
    listaReceitas.innerHTML = '';
    
    // Se não achou nada
    if (!receitas) {
        listaReceitas.innerHTML = '<p>Nenhuma receita encontrada.</p>';
        return;
    }
    
    // Para cada receita encontrada
    for (let i = 0; i < receitas.length; i++) {
        let receita = receitas[i];
        
        // Cria um card
        let card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = 
            '<img src="' + receita.strMealThumb + '">' +
            '<div class="card-texto">' +
            '<h3>' + receita.strMeal + '</h3>' +
            '<button onclick="verDetalhes(\'' + receita.idMeal + '\')">Ver Receita Completa</button>' +
            '</div>';
        
        listaReceitas.appendChild(card);
    }
}

// Função que mostra os detalhes de uma receita
function verDetalhes(id) {
    // Busca os detalhes da receita
    fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
        .then(function(resposta) {
            return resposta.json();
        })
        .then(function(dados) {
            let receita = dados.meals[0];
            
            // Pega os ingredientes
            let ingredientes = '';
            for (let i = 1; i <= 20; i++) {
                let ingrediente = receita['strIngredient' + i];
                let quantidade = receita['strMeasure' + i];
                
                if (ingrediente && ingrediente !== '') {
                    ingredientes += '<div class="ingrediente">' + quantidade + ' ' + ingrediente + '</div>';
                }
            }
            
            // Monta o HTML com os detalhes
            detalhes.innerHTML = 
                '<h2>'+ receita.strMeal +'</h2>' +
                '<p><strong>Categoria:</strong> ' + receita.strCategory + '</p>' +
                '<h3>📝 Ingredientes:</h3>' +
                ingredientes +
                '<h3>👨‍🍳 Como fazer?</h3>' +
                '<p>' + receita.strInstructions + '</p>';
            
            // Mostra o popup
            popup.style.display = 'block';
        });
}

// Fechar popup
fechar.onclick = function() {
    popup.style.display = 'none';
};

// Fechar popup clicando fora
window.onclick = function(e) {
    if (e.target === popup) {
        popup.style.display = 'none';
    }
};

// PARTE DA CÂMERA

// Ligar a câmera
ligarCamera.onclick = function() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            cameraLigada = stream;
            camera.srcObject = stream;
            tirarFoto.disabled = false;
            desligarCamera.disabled = false;
            ligarCamera.disabled = true;
        })
        .catch(function() {
            alert('Não consegui acessar a câmera!');
        });
};

// Tirar foto
tirarFoto.onclick = function() {
    // Prepara o canvas (tela de desenho)
    let ctx = foto.getContext('2d');
    foto.width = camera.videoWidth;
    foto.height = camera.videoHeight;
    
    // Desenha a imagem da câmera no canvas
    ctx.drawImage(camera, 0, 0);
    
    // Esconde câmera e mostra foto
    camera.style.display = 'none';
    foto.style.display = 'block';
    
};

// Desligar câmera
desligarCamera.onclick = function() {
    if (cameraLigada) {
        // Para todos os streams da câmera
        let tracks = cameraLigada.getTracks();
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].stop();
        }
        
        camera.srcObject = null;
        cameraLigada = null;
        tirarFoto.disabled = true;
        desligarCamera.disabled = true;
        ligarCamera.disabled = false;
        camera.style.display = 'block';
        foto.style.display = 'none';
    }
};