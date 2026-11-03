/**
 * Página do formulário (index.html).
 * Valida os dados, envia para a API e abre o modal
 * quando o serviço não está disponível.
 */


// Elementos do formulário
const formulario = document.querySelector('#form-perfil');

const campoNome = document.querySelector('#nome');
const campoHobbies = document.querySelector('#hobbies');
const campoInteresses = document.querySelector('#interesses');

const botaoEnviar = document.querySelector('#botao-enviar');


// Elementos do modal
const modal = document.querySelector('#modal-indisponivel');
const mensagemModal = document.querySelector('#modal-mensagem');
const botaoEntendi = document.querySelector('#botao-entendi');


// Fecha o modal ao clicar no botão Entendi
botaoEntendi.addEventListener('click', () => {
    modal.close();
});


// Quando o modal fechar, devolve o foco ao botão de envio
modal.addEventListener('close', () => {
    botaoEnviar.focus();
});


// Função para mostrar o modal
function abrirModal(mensagem) {

    mensagemModal.textContent = mensagem;

    if (!modal.open) {
        modal.showModal();
    }

    botaoEntendi.focus();
}


// Função para mostrar erros nos campos
function mostrarErro(campo, mensagem) {

    const elementoErro = document.querySelector(`#${campo.id}-erro`);

    elementoErro.textContent = mensagem;

    campo.setAttribute('aria-invalid', 'true');
}


// Função para limpar erros dos campos
function limparErro(campo) {

    const elementoErro = document.querySelector(`#${campo.id}-erro`);

    elementoErro.textContent = '';

    campo.removeAttribute('aria-invalid');
}


// Limpa a mensagem de erro quando o usuário começa a digitar
[campoNome, campoHobbies, campoInteresses].forEach(campo => {

    campo.addEventListener('input', () => {
        limparErro(campo);
    });

});


// Função para transformar o texto em uma lista
function transformarEmLista(texto) {

    return texto
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

}


// Validação dos campos
function validarFormulario() {

    let formularioValido = true;

    const nome = campoNome.value.trim();

    const hobbies = transformarEmLista(campoHobbies.value);

    const interesses = transformarEmLista(campoInteresses.value);


    // Valida o nome
    if (nome.length < 2 || nome.length > 60) {

        mostrarErro(
            campoNome,
            'Digite um nome com pelo menos 2 caracteres e no máximo 60.'
        );

        formularioValido = false;

    } else {

        limparErro(campoNome);

    }


    // Valida os hobbies
    if (hobbies.length === 0) {

        mostrarErro(
            campoHobbies,
            'Informe pelo menos um hobby.'
        );

        formularioValido = false;

    } else {

        limparErro(campoHobbies);

    }


    // Valida os interesses
    if (interesses.length === 0) {

        mostrarErro(
            campoInteresses,
            'Informe pelo menos uma área de interesse.'
        );

        formularioValido = false;

    } else {

        limparErro(campoInteresses);

    }


    return formularioValido;

}


// Evento de envio do formulário
formulario.addEventListener('submit', async (evento) => {

    evento.preventDefault();


    // Verifica se os campos estão preenchidos corretamente
    if (!validarFormulario()) {

        const primeiroCampoInvalido = formulario.querySelector(
            '[aria-invalid="true"]'
        );

        primeiroCampoInvalido.focus();

        return;

    }


    // Verifica se o endereço da API foi configurado
    if (!CONFIG.API_URL) {

        abrirModal(
            'Nosso serviço ainda não está disponível. Tente novamente em instantes.'
        );

        return;

    }


    // Monta os dados que serão enviados para a API
    const perfil = {

        name: campoNome.value.trim(),

        hobbies: transformarEmLista(campoHobbies.value),

        interests: transformarEmLista(campoInteresses.value)

    };


    // Impede vários envios ao mesmo tempo
    botaoEnviar.disabled = true;

    botaoEnviar.textContent = 'Enviando...';


    // Controla o tempo limite da requisição
    const controlador = new AbortController();

    const tempoLimite = setTimeout(() => {

        controlador.abort();

    }, CONFIG.TEMPO_LIMITE_MS);


    try {

        // Envia os dados para a API
        const resposta = await fetch(CONFIG.API_URL, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(perfil),

            signal: controlador.signal

        });


        // Verifica se a API respondeu corretamente
        if (!resposta.ok) {

            throw new Error('Erro ao comunicar com o servidor.');

        }


        // Converte a resposta para JSON
        const dados = await resposta.json();


        // Verifica se a resposta possui os dados esperados
        if (
            !dados.user_name ||
            !dados.career_identity_statement ||
            !Array.isArray(dados.recommended_careers)
        ) {

            throw new Error('A resposta da API está em formato inválido.');

        }


        // Salva o resultado no navegador
        sessionStorage.setItem(
            CONFIG.CHAVE_RESULTADO,
            JSON.stringify(dados)
        );


        // Redireciona para a página de resultado
        window.location.href = 'resultado.html';


    } catch (erro) {

        console.error('Erro na requisição:', erro);


        // Verifica se a requisição ultrapassou o tempo limite
        if (erro.name === 'AbortError') {

            abrirModal(
                'O tempo de resposta foi excedido. Tente novamente.'
            );

        } else {

            abrirModal(
                'Não foi possível acessar o serviço. Verifique sua conexão e tente novamente.'
            );

        }


    } finally {

        // Cancela o temporizador
        clearTimeout(tempoLimite);


        // Restaura o botão
        botaoEnviar.disabled = false;

        botaoEnviar.textContent = 'Descobrir minha carreira';

    }

});
