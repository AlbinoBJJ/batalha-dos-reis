import { GerenciadorJogo } from './core/gerenciador-jogo.js';
import { CONFIG_SUMO } from './mini-jogos/ogre-sumo/sumo-config.js';
import { SumoRegras } from './mini-jogos/ogre-sumo/sumo-regras.js';
// Inicializa o Controlador Central apontando para o ID do HTML container
const engine = new GerenciadorJogo('tabuleiro-container');
/**
 * Função responsável por ler qual jogo está selecionado na tela
 * e dar o "boot" inicial nele.
 */
function inicializarJogoSelecionado() {
    const seletor = document.getElementById('seletor-jogo');
    const jogoDesejado = seletor ? seletor.value : 'ogre-sumo';
    switch (jogoDesejado) {
        case 'ogre-sumo':
            // Injeta dinamicamente a configuração e a classe de regras do Sumô
            engine.iniciarNovoJogo(CONFIG_SUMO, new SumoRegras());
            break;
        case 'captura-peao':
            // Aqui plugaremos o segundo mini-jogo quando criarmos
            alert('O mini-jogo Captura de Peão será integrado na próxima sprint!');
            break;
        default:
            console.error(`Erro: Mini-jogo com ID "${jogoDesejado}" não implementado.`);
    }
}
// --- Vinculação de Eventos da Interface Gráfica (Listeners) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicia o jogo padrão assim que a página carregar
    inicializarJogoSelecionado();
    // 2. Escuta mudanças no Dropdown de seleção para trocar de jogo em tempo real
    const seletorJogo = document.getElementById('seletor-jogo');
    seletorJogo === null || seletorJogo === void 0 ? void 0 : seletorJogo.addEventListener('change', () => {
        inicializarJogoSelecionado();
    });
    // 3. Escuta o clique no botão "Reiniciar Partida"
    const btnReiniciar = document.getElementById('btn-reiniciar');
    btnReiniciar === null || btnReiniciar === void 0 ? void 0 : btnReiniciar.addEventListener('click', () => {
        inicializarJogoSelecionado();
    });
});
