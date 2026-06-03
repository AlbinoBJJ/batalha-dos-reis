/**
 * Representação estrita das coordenadas dentro da matriz do tabuleiro.
 */
export interface ICoordenada {
    linha: number;
    coluna: number;
}

/**
 * Definição dos tipos de peças suportadas pela nossa engine.
 */
export type TipoPeca = 'REI_BRANCO' | 'REI_PRETO' | 'PEAO_HEROI' | 'PEAO_RIVAL' | 'OBSTACULO';

/**
 * Representação de uma peça em jogo.
 */
export interface IPeca {
    id: string;
    tipo: TipoPeca;
    cor: 'BRANCO' | 'PRETO' | 'NEUTRO';
}

/**
 * Definição dos tipos de terreno que uma casa do tabuleiro pode assumir.
 */
export type TipoTerreno = 'NORMAL_CLARA' | 'NORMAL_ESCURA' | 'FLORESTA' | 'BLOQUEADO';

/**
 * Representação de cada quadrado (célula) do tabuleiro na memória.
 */
export interface ICasa {
    coordenada: ICoordenada;
    terreno: TipoTerreno;
    peca: IPeca | null;
}

/**
 * Estrutura do arquivo de configuração.
 */
export interface IConfiguracaoJogo {
    id: string;
    nome: string;
    linhas: number;
    colunas: number;
    temaClasseCSS: string;
    dadosCustomizados?: any;
}