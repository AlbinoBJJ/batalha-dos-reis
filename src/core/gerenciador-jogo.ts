import { Tabuleiro } from './tabuleiro.js';
import { Renderizador } from './renderizador.js';
import { IRegra } from '../contratos/iregra.js';
import { IConfiguracaoJogo, ICoordenada } from '../contratos/itabuleiro.js';

export class GerenciadorJogo {
    private tablero!: Tabuleiro; 
    private tabuleiro!: Tabuleiro;
    private renderizador: Renderizador;
    private regraAtual!: IRegra;
    private configAtual!: IConfiguracaoJogo;

    private coordenadaSelecionada: ICoordenada | null = null;
    private movimentosValidosAtuais: ICoordenada[] = [];
    private turnoAtual: 'JOGADOR' | 'IA' = 'JOGADOR';
    private jogoFinalizado: boolean = false;
    private lancesRestantes: number = 15;

    constructor(containerId: string) {
        this.renderizador = new Renderizador(containerId);
    }

    public iniciarNovoJogo(config: IConfiguracaoJogo, regras: IRegra): void {
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
        this.renderizador.atualizarTextosInterface(
            config.nome, 
            this.regraAtual.getObjetivoTutorial(),
            this.regraAtual.getExplicacaoExtraTutorial()
        );

        // 2. Acopla o funcionamento do Slider de volume
        const sliderVolume = document.getElementById('slider-volume') as HTMLInputElement;
        if (sliderVolume) {
            this.renderizador.atualizarVolumeGlobal(parseFloat(sliderVolume.value));
            sliderVolume.oninput = (e: Event) => {
                const alvo = e.target as HTMLInputElement;
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

    private renderizarNovamente(): void {
        this.renderizador.renderizarTabuleiroCompleto(
            this.tabuleiro, 
            (coord: ICoordenada) => this.tratarCliqueCasa(coord),
            (origem: ICoordenada, destino: ICoordenada) => this.processarMovimentoDireto(origem, destino)
        );
    }

    private tratarCliqueCasa(coord: ICoordenada): void {
        if (this.jogoFinalizado || this.turnoAtual !== 'JOGADOR') return;

        const casaClicada = this.tabuleiro.getCasa(coord.linha, coord.coluna);
        if (!casaClicada) return;

        if (this.coordenadaSelecionada && this.movimentosValidosAtuais.some(m => m.linha === coord.linha && m.coluna === coord.coluna)) {
            this.executarTurnoJogador(this.coordenadaSelecionada, coord);
            return;
        }

        if (this.coordenadaSelecionada) {
            const grade = this.tabuleiro.getGrade();
            let lOgro = -1, cOgro = -1;
            for (let l = 0; l < this.tabuleiro.linhas; l++) {
                for (let c = 0; c < this.tabuleiro.colunas; c++) {
                    if (grade[l][c].peca?.tipo === 'REI_PRETO') { lOgro = l; cOgro = c; break; }
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
        } else {
            this.limparSelecao();
        }
    }

    private processarMovimentoDireto(origem: ICoordenada, destino: ICoordenada): void {
        const grade = this.tabuleiro.getGrade();
        if (this.regraAtual.validarMovimento(origem, destino, grade)) {
            this.executarTurnoJogador(origem, destino);
        } else {
            this.tratarCliqueCasa(destino); 
            this.limparSelecao();
        }
    }

    private calcularMovimentosPossiveis(origem: ICoordenada): ICoordenada[] {
        const validos: ICoordenada[] = [];
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

    private executarTurnoJogador(origem: ICoordenada, destino: ICoordenada): void {
        const casasModificadas = this.regraAtual.executarMovimento(origem, destino, this.tabuleiro);
        
        this.renderizador.renderizarTabuleiroCompleto(
            this.tabuleiro, 
            (c: ICoordenada) => this.tratarCliqueCasa(c),
            (orig: ICoordenada, dest: ICoordenada) => this.processarMovimentoDireto(orig, dest)
        );
        
        this.renderizador.reproduzirSomMovimento();
        this.limparSelecao();
        this.lancesRestantes--;

        if (this.verificarFimDePartida()) return;

        this.turnoAtual = 'IA';
        this.notificarStatusTurnoAtual();
        
        setTimeout(() => this.executarTurnoIA(), 600);
    }

    private executarTurnoIA(): void {
        if (this.jogoFinalizado) return;

        const movimentoIA = this.regraAtual.calcularTurnoIA(this.tabuleiro);

        if (movimentoIA) {
            this.regraAtual.executarMovimento(movimentoIA.origem, movimentoIA.destino, this.tabuleiro);
            this.renderizador.renderizarTabuleiroCompleto(
                this.tabuleiro, 
                (c: ICoordenada) => this.tratarCliqueCasa(c),
                (orig: ICoordenada, dest: ICoordenada) => this.processarMovimentoDireto(orig, dest)
            );
            this.renderizador.reproduzirSomMovimento();
        }

        if (this.verificarFimDePartida()) return;

        this.turnoAtual = 'JOGADOR';
        this.notificarStatusTurnoAtual();
    }

    private verificarFimDePartida(): boolean {
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

    private declararFimDoJogo(vencedor: 'JOGADOR' | 'IA' | 'EMPATE' | null, motivo: string = ""): void {
        this.jogoFinalizado = true;
        
        if (vencedor === 'JOGADOR') {
            this.atualizarInterfaceStatus("🏆 VITÓRIA! " + motivo, "text-success");
            this.renderizador.renderizarTabuleiroFimDeJogo(this.tabuleiro, 'VITORIA', (c) => this.tratarCliqueCasa(c));
            this.renderizador.reproduzirSomVitoria();
        } else if (vencedor === 'IA') {
            this.atualizarInterfaceStatus("❌ DERROTA! " + motivo, "text-danger");
            this.renderizador.renderizarTabuleiroFimDeJogo(this.tabuleiro, 'DERROTA', (c) => this.tratarCliqueCasa(c));
            this.renderizador.reproduzirSomDerrota();
        } else {
            this.atualizarInterfaceStatus("⚖️ EMPATE!", "text-muted");
        }
    }

    private notificarStatusTurnoAtual(): void {
        if (this.turnoAtual === 'JOGADOR') {
            this.atualizarInterfaceStatus("Sua vez", "text-success");
        } else {
            this.atualizarInterfaceStatus("Ogro decidindo o seu lance...", "text-warning animate-pulse");
        }
    }

    private limparSelecao(): void {
        this.coordenadaSelecionada = null;
        this.movimentosValidosAtuais = [];
        this.renderizador.destacarMovimentosValidos(null, []);
    }

    private atualizarInterfaceStatus(mensagem: string, classeTexto: string = "text-info"): void {
        const elemento = document.getElementById("status-turno");
        if (elemento) {
            elemento.className = `fs-5 fw-bold text-center ${classeTexto}`;
            if (!this.jogoFinalizado) {
                elemento.innerText = `${mensagem} (${this.lancesRestantes} lances restantes)`;
            } else {
                elemento.innerText = mensagem;
            }
        }
    }

    private dispararDialogoProfessora(): void {
        const textoMensagem = "Opa, reizinho! Cuidado! Os Reis não podem se encostar! Lembre-se que o seu objetivo é encurralar o Ogro, mas chegar perto demais dele é perigoso, ele pode te acertar! Use a astúcia: mova-se contornando o Ogro pelos lados para ganhar a Oposição e dominar o espaço!";
        alert(textoMensagem);
    }
}