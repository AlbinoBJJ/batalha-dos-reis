/**
 * Representação estrita das coordenadas dentro da matriz do tabuleiro.
 * Exemplo: { linha: 0, coluna: 4 }
 */
export interface ICoordenada {
    linha: number;
    coluna: number;
}

/**
 * Definição dos tipos de peças suportadas pela nossa engine.
 * Podemos expandir essa lista conforme novos mini-jogos forem criados.
 */
export type TipoPeca = 'REI_BRANCO' | 'REI_PRETO' | 'PEAO_HEROI' | 'PEAO_RIVAL' | 'OBSTACULO';

/**
 * Representação de uma peça em jogo.
 */
export interface IPeca {
    id: string;          // Identificador único (ex: 'b_rei_1')
    tipo: TipoPeca;      // Tipo para validação de regras
    cor: 'BRANCO' | 'PRETO' | 'NEUTRO';
}

/**
 * Definição dos tipos de terreno que uma casa do tabuleiro pode assumir.
 * Essencial para mudar o comportamento físico da casa dependendo do mini-jogo.
 */
export type TipoTerreno = 'NORMAL_CLARA' | 'NORMAL_ESCURA' | 'FLORESTA' | 'BLOQUEADO';

/**
 * Representação de cada quadrado (célula) do tabuleiro na memória.
 */
export interface ICasa {
    coordenada: ICoordenada;
    terreno: TipoTerreno;
    peca: IPeca | null;   // Null significa que a casa está vazia
}

/**
 * Estrutura do arquivo de configuração que cada mini-jogo deve fornecer
 * para inicializar o motor dinamicamente.
 */
export interface IConfiguracaoJogo {
    id: string;
    nome: string;
    linhas: number;
    colunas: number;
    temaClasseCSS: string; // Ex: 'tema-floresta' ou 'tema-classico'
    dadosCustomizados?: any; // Para parâmetros específicos de cada jogo (ex: chances da IA)
}