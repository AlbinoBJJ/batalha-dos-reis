import { GerenciadorJogo } from './core/gerenciador-jogo.js';
import { CONFIG_SUMO } from './mini-jogos/ogre-sumo/sumo-config.js';
import { SumoRegras } from './mini-jogos/ogre-sumo/sumo-regras.js';
console.log("App iniciado!");
const engine = new GerenciadorJogo('tabuleiro-container');
// Sidebar logic
const sidebar = document.getElementById('sidebar-config');
const btnAbrir = document.getElementById('btn-sidebar');
const btnFechar = document.getElementById('btn-sidebar-fechar');
if (sidebar && btnAbrir && btnFechar) {
    btnAbrir.onclick = () => sidebar.classList.add('ativa');
    btnFechar.onclick = () => sidebar.classList.remove('ativa');
    // ADICIONE AQUI O NOVO EVENTO:
    document.addEventListener('click', (e) => {
        const alvo = e.target;
        // Se a sidebar está ativa E o clique foi fora da sidebar E fora do botão de abrir
        if (sidebar.classList.contains('ativa') &&
            !sidebar.contains(alvo) &&
            alvo !== btnAbrir) {
            sidebar.classList.remove('ativa');
        }
    });
}
function inicializarJogoSelecionado() {
    const seletor = document.getElementById('seletor-jogo');
    const jogoDesejado = seletor ? seletor.value : 'ogre-sumo';
    switch (jogoDesejado) {
        case 'ogre-sumo':
            engine.iniciarNovoJogo(CONFIG_SUMO, new SumoRegras());
            break;
        default:
            console.error(`Erro: Mini-jogo "${jogoDesejado}" não encontrado.`);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    inicializarJogoSelecionado();
    const seletorJogo = document.getElementById('seletor-jogo');
    seletorJogo === null || seletorJogo === void 0 ? void 0 : seletorJogo.addEventListener('change', inicializarJogoSelecionado);
});
