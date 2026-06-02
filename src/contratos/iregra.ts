import { ICoordenada, ICasa } from './itabuleiro.js';
import { Tabuleiro } from '../core/tabuleiro.js';

export interface IResultadoJogo {
    terminou: boolean;
    vencedor: 'JOGADOR' | 'IA' | 'EMPATE' | null;
    motivo?: string;
}

export interface IRegra {
    inicializarCenario(tabuleiro: Tabuleiro): void;
    validarMovimento(origem: ICoordenada, destino: ICoordenada, grade: ICasa[][]): boolean;
    executarMovimento(origem: ICoordenada, destino: ICoordenada, tabuleiro: Tabuleiro): ICoordenada[];
    verificarFimDeJogo(tabuleiro: Tabuleiro): IResultadoJogo;
    calcularTurnoIA(tabuleiro: Tabuleiro): { origem: ICoordenada; destino: ICoordenada } | null;
    
    // NOVO: Permite ao gerenciador ler o status do combo atual do jogo
    getMensagemStatusCustomizada(): string;
}