import { IRegra, IResultadoJogo } from '../../contratos/iregra.js';
import { Tabuleiro } from '../../core/tabuleiro.js';
import { ICoordenada, ICasa, IPeca } from '../../contratos/itabuleiro.js';

export class SumoRegras implements IRegra {
    private comboOposicao: number = 0;
    private comboNecessarioParaRecuo: number = 4;
    private ultimoMovimentoJogadorGerouOposicao: boolean = false;

    public inicializarCenario(tabuleiro: Tabuleiro): void {
        this.comboOposicao = 0;
        this.comboNecessarioParaRecuo = 4;
        this.ultimoMovimentoJogadorGerouOposicao = false;

        for (let l = 0; l < tabuleiro.linhas; l++) {
            for (let c = 0; c < tabuleiro.colunas; c++) {
                if (l === 0) {
                    // Apenas a fileira do topo vira o terreno especial do gol
                    tabuleiro.definirTerreno(l, c, 'FLORESTA');
                } else {
                    // O resto do tabuleiro INTEIRO segue o padrão matemático
                    if ((l + c) % 2 === 0) {
                        tabuleiro.definirTerreno(l, c, 'NORMAL_CLARA');
                    } else {
                        tabuleiro.definirTerreno(l, c, 'NORMAL_ESCURA');
                    }
                }
            }
        }

        const lPreto = 1;
        const cPreto = Math.floor(Math.random() * 6) + 1;

        const lBranco = 5;
        const opcoesColunaBranco = [2, 3, 4, 5];
        const cBranco = opcoesColunaBranco[Math.floor(Math.random() * opcoesColunaBranco.length)];

        tabuleiro.colocarPeca(lBranco, cBranco, { id: 'r_branco', tipo: 'REI_BRANCO', cor: 'BRANCO' });
        tabuleiro.colocarPeca(lPreto, cPreto, { id: 'r_preto', tipo: 'REI_PRETO', cor: 'PRETO' });
    }

    public validarMovimento(origem: ICoordenada, destino: ICoordenada, grade: ICasa[][]): boolean {
        const deltaLinha = Math.abs(origem.linha - destino.linha);
        const deltaColuna = Math.abs(origem.coluna - destino.coluna);
        
        if (deltaLinha > 1 || deltaColuna > 1 || (deltaLinha === 0 && deltaColuna === 0)) {
            return false;
        }

        const casaDestino = grade[destino.linha][destino.coluna];
        if (casaDestino.peca !== null) return false;

        const pecaOrigem = grade[origem.linha][origem.coluna].peca;
        if (pecaOrigem) {
            const tipoRival = pecaOrigem.cor === 'BRANCO' ? 'REI_PRETO' : 'REI_BRANCO';
            
            let coordRival: ICoordenada | null = null;
            for (let l = 0; l < grade.length; l++) {
                for (let c = 0; c < grade[l].length; c++) {
                    if (grade[l][c].peca?.tipo === tipoRival) {
                        coordRival = { linha: l, coluna: c };
                        break;
                    }
                }
                if (coordRival) break;
            }

            if (coordRival) {
                const distLinhaAoRival = Math.abs(destino.linha - coordRival.linha);
                const distColunaAoRival = Math.abs(destino.coluna - coordRival.coluna);
                if (distLinhaAoRival <= 1 && distColunaAoRival <= 1) {
                    return false; 
                }
            }
        }

        return true;
    }

    public executarMovimento(origem: ICoordenada, destino: ICoordenada, tabuleiro: Tabuleiro): ICoordenada[] {
        // CORRIGIDO: Removido o bug do 'origin' digitado incorretamente
        const peca = tabuleiro.getCasa(origem.linha, origem.coluna)?.peca;
        
        tabuleiro.moverPecaEmMemoria(origem, destino);

        if (peca && peca.cor === 'BRANCO') {
            const coordPreto = this.encontrarPecaPorTipo(tabuleiro, 'REI_PRETO');
            if (coordPreto) {
                const gerouOposicao = this.testarOposicaoDireta(destino, coordPreto);
                if (gerouOposicao) {
                    this.comboOposicao++;
                    this.ultimoMovimentoJogadorGerouOposicao = true;
                } else {
                    this.comboOposicao = 0;
                    this.ultimoMovimentoJogadorGerouOposicao = false;
                }
            }
        }

        return [origem, destino];
    }

    public verificarFimDeJogo(tabuleiro: Tabuleiro): IResultadoJogo {
        const coordBranco = this.encontrarPecaPorTipo(tabuleiro, 'REI_BRANCO');
        const coordPreto = this.encontrarPecaPorTipo(tabuleiro, 'REI_PRETO');

        // O Rei Branco perde se tocar nas bordas limites do quintal
        if (coordBranco && this.ehBordaFisica(coordBranco, tabuleiro)) {
            return { terminou: true, vencedor: 'IA', motivo: 'Você recuou demais e saiu do quintal!' };
        }
        
        // VITÓRIA DO JOGADOR: O Ogro só perde se entrar especificamente na linha da Floresta (linha 0)
        if (coordPreto && coordPreto.linha === 0) {
            return { terminou: true, vencedor: 'JOGADOR', motivo: 'Sensacional! O Ogro foi expulso para a floresta!' };
        }

        return { terminou: false, vencedor: null };
    }

    public calcularTurnoIA(tabuleiro: Tabuleiro): { origem: ICoordenada; destino: ICoordenada } | null {
        const oOrigem = this.encontrarPecaPorTipo(tabuleiro, 'REI_PRETO');
        const oJogador = this.encontrarPecaPorTipo(tabuleiro, 'REI_BRANCO');

        if (!oOrigem || !oJogador) return null;

        const grade = tabuleiro.getGrade();
        const guardaQuebrada = this.comboOposicao >= this.comboNecessarioParaRecuo;
        
        if (guardaQuebrada) {
            this.comboOposicao = 0;
            if (this.comboNecessarioParaRecuo > 1) {
                this.comboNecessarioParaRecuo--;
            }
        }

        const movimentosPossiveis: ICoordenada[] = [];
        for (let l = -1; l <= 1; l++) {
            for (let c = -1; c <= 1; c++) {
                if (l === 0 && c === 0) continue;
                const nL = oOrigem.linha + l;
                const nC = oOrigem.coluna + c;
                
                if (tabuleiro.estaDentroDosLimites(nL, nC) && this.validarMovimento(oOrigem, { linha: nL, coluna: nC }, grade)) {
                    movimentosPossiveis.push({ linha: nL, coluna: nC });
                }
            }
        }

        if (movimentosPossiveis.length === 0) return null;

        let destinoFinal = oOrigem;

        if (!guardaQuebrada) {
            // O Ogro foca matematicamente no centro para proteger o ouro
            movimentosPossiveis.sort((a, b) => {
                const distA = Math.pow(a.linha - 3.5, 2) + Math.pow(a.coluna - 3.5, 2);
                const distB = Math.pow(b.linha - 3.5, 2) + Math.pow(b.coluna - 3.5, 2);
                return distA - distB;
            });
            destinoFinal = movimentosPossiveis[0];
        } else {
            movimentosPossiveis.sort((a, b) => {
                const distA = Math.pow(a.linha - oJogador.linha, 2) + Math.pow(a.coluna - oJogador.coluna, 2);
                const distB = Math.pow(b.linha - oJogador.linha, 2) + Math.pow(b.coluna - oJogador.coluna, 2);
                return distB - distA;
            });
            destinoFinal = movimentosPossiveis[0];
        }

        return { origem: oOrigem, destino: destinoFinal };
    }

    public getMensagemStatusCustomizada(): string {
        return `⚔️ Alvo: Empurre o Ogro para cima!`;
    }

    private testarOposicaoDireta(j: ICoordenada, ia: ICoordenada): boolean {
        const dLinha = Math.abs(j.linha - ia.linha);
        const dColuna = Math.abs(j.coluna - ia.coluna);
        return (dLinha === 2 && dColuna === 0) || (dLinha === 0 && dColuna === 2);
    }

    private ehBordaFisica(coord: ICoordenada, tab: Tabuleiro): boolean {
        return coord.linha === 0 || coord.linha === tab.linhas - 1 || coord.coluna === 0 || coord.coluna === tab.colunas - 1;
    }

    private encontrarPecaPorTipo(tabuleiro: Tabuleiro, tipo: string): ICoordenada | null {
        const grade = tabuleiro.getGrade();
        for (let l = 0; l < tabuleiro.linhas; l++) {
            for (let c = 0; c < tabuleiro.colunas; c++) {
                if (grade[l][c].peca?.tipo === tipo) {
                    return { linha: l, coluna: c };
                }
            }
        }
        return null;
    }
}