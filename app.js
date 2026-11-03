
/**
 * Página do formulário (index.html).
 * Lê e valida os dados antes de montar o perfil.
 */

const formulario = document.querySelector('#form-perfil');

// Exibe uma mensagem de erro no campo correspondente
function exibirErro(campo, mensagem) {
    const mensagemErro = document.querySelector(`#${campo.name}-erro`);

    mensagemErro.textContent = mensagem;
    campo.setAttribute('aria-invalid', 'true');
}

// Remove a mensagem de erro
function limparErro(campo) {
    const mensagemErro = document.querySelector(`#${campo.name}-erro`);

    mensagemErro.textContent = '';
    campo.removeAttribute('aria-invalid');
}

// Limpa os erros enquanto a pessoa digita
formulario.addEventListener('input', (evento) => {
    const campo = evento.target;

    if (campo.name) {
        limparErro(campo);
    }
});

formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const campos = formulario.elements;

    // Remove espaços do começo e do fim do nome
    const nome = campos.nome.value.trim();

    // Divide os hobbies, remove espaços e ignora itens vazios
    const hobbies = campos.hobbies.value
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');

    // Faz o mesmo com as áreas de interesse
    const interesses = campos.interesses.value
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');

    // Limpa mensagens anteriores
    limparErro(campos.nome);
    limparErro(campos.hobbies);
    limparErro(campos.interesses);

    let primeiroCampoComErro = null;

    // Valida o nome
    if (nome === '') {
        exibirErro(campos.nome, 'Digite seu nome.');
        primeiroCampoComErro = campos.nome;
    }

    // Valida os hobbies
    if (hobbies.length === 0) {
        exibirErro(
            campos.hobbies,
            'Informe pelo menos um hobby válido.'
        );

        if (primeiroCampoComErro === null) {
            primeiroCampoComErro = campos.hobbies;
        }
    }

    // Valida as áreas de interesse
    if (interesses.length === 0) {
        exibirErro(
            campos.interesses,
            'Informe pelo menos uma área de interesse válida.'
        );

        if (primeiroCampoComErro === null) {
            primeiroCampoComErro = campos.interesses;
        }
    }

    // Se existir algum erro, interrompe o envio
    if (primeiroCampoComErro !== null) {
        primeiroCampoComErro.focus();
        return;
    }

    // Monta o perfil somente com dados válidos
    const perfil = {
        name: nome,
        hobbies: hobbies,
        interests: interesses,
    };

    console.log('Perfil montado:', perfil);

    // TODO: enviar o perfil para a API configurada em CONFIG.API_URL
    // e levar o usuário para a página resultado.html.
    alert('Tente mais tarde');
});
