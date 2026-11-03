
/**
 * Página de resultado.
 * Lê a resposta da API ou os dados de exemplo
 * e monta os cards de carreiras.
 */

const secaoResultado = document.querySelector('#resultado');
const secaoSemResultado = document.querySelector('#sem-resultado');

const nomeUsuario = document.querySelector('#nome-usuario');
const sintese = document.querySelector('#sintese');
const listaCarreiras = document.querySelector('#lista-carreiras');

const modeloCarreira = document.querySelector('#modelo-carreira');

// Descobre de onde vêm os dados
function obterResultado() {
    const parametros = new URLSearchParams(window.location.search);

    // Dados de exemplo para testar sem backend
    if (parametros.has('exemplo')) {
        return DADOS_EXEMPLO;
    }

    // Dados recebidos da API
    try {
        const dadosSalvos = sessionStorage.getItem(
            CONFIG.CHAVE_RESULTADO
        );

        return dadosSalvos ? JSON.parse(dadosSalvos) : null;

    } catch (erro) {
        console.error('Erro ao recuperar o resultado:', erro);
        return null;
    }
}

// Cria uma lista HTML com os itens recebidos
function preencherLista(elemento, itens) {
    elemento.replaceChildren();

    if (!Array.isArray(itens)) {
        return;
    }

    itens.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        elemento.appendChild(li);
    });
}

// Monta um card para cada carreira
function criarCardCarreira(carreira, indice) {
    const card = modeloCarreira.content
        .firstElementChild
        .cloneNode(true);

    card.querySelector('.carreira__titulo').textContent =
        carreira.title || 'Carreira não informada';

    const pontuacao = Number(carreira.match_score);
    const percentual = Number.isFinite(pontuacao)
        ? Math.min(100, Math.max(0, pontuacao))
        : 0;

    card.querySelector('.carreira__percentual').textContent =
        `${percentual}%`;

    card.querySelector('.barra__nivel').style.setProperty(
        '--nivel',
        `${percentual}%`
    );

    card.querySelector('.carreira__resumo').textContent =
        carreira.summary || '';

    // Destaca a primeira carreira
    if (indice === 0) {
        card.classList.add('carreira--principal');
        card.querySelector('.carreira__selo').hidden = false;
    }

    // Competências
    preencherLista(
        card.querySelector('.chips'),
        carreira.key_skills
    );

    // Roteiro de estudos
    preencherLista(
        card.querySelector('.roteiro'),
        carreira.learning_path
    );

    return card;
}

// Mostra o resultado na tela
function mostrarResultado(dados) {
    nomeUsuario.textContent = dados.user_name;
    sintese.textContent = dados.career_identity_statement;

    listaCarreiras.replaceChildren();

    // Ordena da maior para a menor compatibilidade
    const carreirasOrdenadas = [...dados.recommended_careers]
        .sort((a, b) => Number(b.match_score) - Number(a.match_score));

    carreirasOrdenadas.forEach((carreira, indice) => {
        const card = criarCardCarreira(carreira, indice);
        listaCarreiras.appendChild(card);
    });

    secaoSemResultado.hidden = true;
    secaoResultado.hidden = false;
}

// Inicialização
const dados = obterResultado();

if (
    dados &&
    typeof dados.user_name === 'string' &&
    typeof dados.career_identity_statement === 'string' &&
    Array.isArray(dados.recommended_careers) &&
    dados.recommended_careers.length > 0
) {
    mostrarResultado(dados);
} else {
    secaoResultado.hidden = true;
    secaoSemResultado.hidden = false;
}
