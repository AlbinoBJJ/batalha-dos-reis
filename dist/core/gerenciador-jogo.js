import { Tabuleiro } from './tabuleiro.js';
import { Renderizador } from './renderizador.js';
export class GerenciadorJogo {
    constructor(containerId) {
        this.coordenadaSelecionada = null;
        this.movimentosValidosAtuais = [];
        this.turnoAtual = 'JOGADOR';
        this.jogoFinalizado = false;
        this.lancesRestantes = 15;
        this.renderizador = new Renderizador(containerId);
    }
    iniciarNovoJogo(config, regras) {
        this.configAtual = config;
        this.regraAtual = regras;
        this.tabuleiro = new Tabuleiro(config.linhas, config.colunas);
        this.tablero = this.tabuleiro;
        this.renderizador.configurarEstiloTabuleiro(config.linhas, config.colunas, config.temaClasseCSS);
        this.regraAtual.inicializarCenario(this.tabuleiro);
        this.coordenadaSelecionada = null;
        this.movimentosValidosAtuais = [];
        this.turnoAtual = 'JOGADOR';
        this.jogoFinalizado = false;
        this.lancesRestantes = 15;
        // 1. Alimenta os textos dinâmicos e títulos na nova interface
        this.renderizador.atualizarTextosInterface(config.nome, this.regraAtual.getObjetivoTutorial(), this.regraAtual.getExplicacaoExtraTutorial());
        // 2. Acopla o funcionamento do Slider de volume
        const sliderVolume = document.getElementById('slider-volume');
        if (sliderVolume) {
            this.renderizador.atualizarVolumeGlobal(parseFloat(sliderVolume.value));
            sliderVolume.oninput = (e) => {
                const alvo = e.target;
                this.renderizador.atualizarVolumeGlobal(parseFloat(alvo.value));
            };
        }
        // 3. Vincula o clique do botão de reiniciar localizado abaixo do tabuleiro
        const btnReiniciar = document.getElementById('btn-reiniciar');
        if (btnReiniciar) {
            btnReiniciar.onclick = () => {
                this.iniciarNovoJogo(this.configAtual, this.regraAtual);
            };
        }
        // 4. Mecanismo de Abrir e Fechar da Sidebar Esquerda
        const sidebar = document.getElementById('sidebar-config');
        const btnAbrir = document.getElementById('btn-sidebar');
        const btnFechar = document.getElementById('btn-sidebar-fechar');
        if (sidebar && btnAbrir && btnFechar) {
            btnAbrir.onclick = () => {
                sidebar.classList.add('ativa');
            };
            btnFechar.onclick = () => {
                sidebar.classList.remove('ativa');
            };
        }
        this.renderizador.reproduzirSomInicio();
        this.notificarStatusTurnoAtual();
        this.renderizarNovamente();
    }
    renderizarNovamente() {
        this.renderizador.renderizarTabuleiroCompleto(this.tabuleiro, (coord) => this.tratarCliqueCasa(coord), (origem, destino) => this.processarMovimentoDireto(origem, destino));
    }
    tratarCliqueCasa(coord) {
        var _a;
        if (this.jogoFinalizado || this.turnoAtual !== 'JOGADOR')
            return;
        const casaClicada = this.tabuleiro.getCasa(coord.linha, coord.coluna);
        if (!casaClicada)
            return;
        if (this.coordenadaSelecionada && this.movimentosValidosAtuais.some(m => m.linha === coord.linha && m.coluna === coord.coluna)) {
            this.executarTurnoJogador(this.coordenadaSelecionada, coord);
            return;
        }
        if (this.coordenadaSelecionada) {
            const grade = this.tabuleiro.getGrade();
            let lOgro = -1, cOgro = -1;
            for (let l = 0; l < this.tabuleiro.linhas; l++) {
                for (let c = 0; c < this.tabuleiro.colunas; c++) {
                    if (((_a = grade[l][c].peca) === null || _a === void 0 ? void 0 : _a.tipo) === 'REI_PRETO') {
                        lOgro = l;
                        cOgro = c;
                        break;
                    }
                }
            }
            if (lOgro !== -1) {
                const distOgroL = Math.abs(coord.linha - lOgro);
                const distOgroC = Math.abs(coord.coluna - cOgro);
                if (distOgroL <= 1 && distOgroC <= 1) {
                    this.dispararDialogoProfessora();
                    this.limparSelecao();
                    return;
                }
            }
        }
        if (casaClicada.peca && casaClicada.peca.cor === 'BRANCO') {
            this.coordenadaSelecionada = coord;
            this.movimentosValidosAtuais = this.calcularMovimentosPossiveis(coord);
            this.renderizador.destacarMovimentosValidos(this.coordenadaSelecionada, this.movimentosValidosAtuais);
        }
        else {
            this.limparSelecao();
        }
    }
    processarMovimentoDireto(origem, destino) {
        const grade = this.tabuleiro.getGrade();
        if (this.regraAtual.validarMovimento(origem, destino, grade)) {
            this.executarTurnoJogador(origem, destino);
        }
        else {
            this.tratarCliqueCasa(destino);
            this.limparSelecao();
        }
    }
    calcularMovimentosPossiveis(origem) {
        const validos = [];
        const grade = this.tabuleiro.getGrade();
        for (let l = 0; l < this.tabuleiro.linhas; l++) {
            for (let c = 0; c < this.tabuleiro.colunas; c++) {
                if (this.regraAtual.validarMovimento(origem, { linha: l, coluna: c }, grade)) {
                    validos.push({ linha: l, coluna: c });
                }
            }
        }
        return validos;
    }
    executarTurnoJogador(origem, destino) {
        const casasModificadas = this.regraAtual.executarMovimento(origem, destino, this.tabuleiro);
        this.renderizador.renderizarTabuleiroCompleto(this.tabuleiro, (c) => this.tratarCliqueCasa(c), (orig, dest) => this.processarMovimentoDireto(orig, dest));
        this.renderizador.reproduzirSomMovimento();
        this.limparSelecao();
        this.lancesRestantes--;
        if (this.verificarFimDePartida())
            return;
        this.turnoAtual = 'IA';
        this.notificarStatusTurnoAtual();
        setTimeout(() => this.executarTurnoIA(), 600);
    }
    executarTurnoIA() {
        if (this.jogoFinalizado)
            return;
        const movimentoIA = this.regraAtual.calcularTurnoIA(this.tabuleiro);
        if (movimentoIA) {
            this.regraAtual.executarMovimento(movimentoIA.origem, movimentoIA.destino, this.tabuleiro);
            this.renderizador.renderizarTabuleiroCompleto(this.tabuleiro, (c) => this.tratarCliqueCasa(c), (orig, dest) => this.processarMovimentoDireto(orig, dest));
            this.renderizador.reproduzirSomMovimento();
        }
        if (this.verificarFimDePartida())
            return;
        this.turnoAtual = 'JOGADOR';
        this.notificarStatusTurnoAtual();
    }
    verificarFimDePartida() {
        const resultado = this.regraAtual.verificarFimDeJogo(this.tabuleiro);
        if (resultado.terminou) {
            this.declararFimDoJogo(resultado.vencedor, resultado.motivo);
            return true;
        }
        if (this.lancesRestantes <= 0) {
            this.declararFimDoJogo('IA', 'Esgotou o limite de 15 lances! O Ogro cansou você.');
            return true;
        }
        return false;
    }
    declararFimDoJogo(vencedor, motivo = "") {
        this.jogoFinalizado = true;
        if (vencedor === 'JOGADOR') {
            this.atualizarInterfaceStatus("🏆 VITÓRIA! " + motivo, "text-success");
            this.renderizador.renderizarTabuleiroFimDeJogo(this.tabuleiro, 'VITORIA', (c) => this.tratarCliqueCasa(c));
            this.renderizador.reproduzirSomVitoria();
        }
        else if (vencedor === 'IA') {
            this.atualizarInterfaceStatus("❌ DERROTA! " + motivo, "text-danger");
            this.renderizador.renderizarTabuleiroFimDeJogo(this.tabuleiro, 'DERROTA', (c) => this.tratarCliqueCasa(c));
            this.renderizador.reproduzirSomDerrota();
        }
        else {
            this.atualizarInterfaceStatus("⚖️ EMPATE!", "text-muted");
        }
    }
    notificarStatusTurnoAtual() {
        if (this.turnoAtual === 'JOGADOR') {
            this.atualizarInterfaceStatus("Sua vez", "text-success");
        }
        else {
            this.atualizarInterfaceStatus("Ogro decidindo o seu lance...", "text-warning animate-pulse");
        }
    }
    limparSelecao() {
        this.coordenadaSelecionada = null;
        this.movimentosValidosAtuais = [];
        this.renderizador.destacarMovimentosValidos(null, []);
    }
    atualizarInterfaceStatus(mensagem, classeTexto = "text-info") {
        const elemento = document.getElementById("status-turno");
        if (elemento) {
            elemento.className = `fs-5 fw-bold text-center ${classeTexto}`;
            if (!this.jogoFinalizado) {
                elemento.innerText = `${mensagem} (${this.lancesRestantes} lances restantes)`;
            }
            else {
                elemento.innerText = mensagem;
            }
        }
    }
    dispararDialogoProfessora() {
        const textoMensagem = "Opa, reizinho! Cuidado! Os Reis não podem se encostar! Lembre-se que o seu objetivo é encurralar o Ogro, mas chegar perto demais dele é perigoso, ele pode te acertar! Use a astúcia: mova-se contornando o Ogro pelos lados para ganhar a Oposição e dominar o espaço!";
        alert(textoMensagem);
    }
}
