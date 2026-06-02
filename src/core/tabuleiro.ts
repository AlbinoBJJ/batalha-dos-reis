import { ICoordenada, ICasa, IPeca, TipoTerreno } from '../contratos/itabuleiro.js';

export class Tabuleiro {
    public readonly linhas: number;
    public readonly colunas: number;
    // Nossa matriz bidimensional que representa a grade de memória do jogo
    private grade: ICasa[][] = [];

    constructor(linhas: number, colunas: number) {
        this.linhas = linhas;
        this.colunas = colunas;
        this.gerarGradeVazia();
    }

    /**
     * Inicializa a matriz na memória preenchendo as casas com terrenos padrão.
     */
    private gerarGradeVazia(): void {
        this.grade = [];
        for (let l = 0; l < this.linhas; l++) {
            this.grade[l] = [];
            for (let c = 0; c < this.colunas; c++) {
                // Alterna os terrenos padrão entre claro e escuro simulando xadrez
                const terrenoPadrao: TipoTerreno = (l + c) % 2 === 0 ? 'NORMAL_CLARA' : 'NORMAL_ESCURA';
                
                this.grade[l][c] = {
                    coordenada: { linha: l, coluna: c },
                    terreno: terrenoPadrao,
                    peca: null
                };
            }
        }
    }

    /**
     * Retorna a matriz completa da grade para fins de leitura e validação externa.
     */
    public getGrade(): ICasa[][] {
        return this.grade;
    }

    /**
     * Verifica se uma determinada coordenada está fisicamente dentro dos limites da matriz.
     */
    public estaDentroDosLimites(linha: number, coluna: number): boolean {
        return linha >= 0 && linha < this.linhas && coluna >= 0 && coluna < this.colunas;
    }

    /**
     * Obtém uma casa específica de forma segura através de suas coordenadas.
     */
    public getCasa(linha: number, coluna: number): ICasa | null {
        if (!this.estaDentroDosLimites(linha, coluna)) return null;
        return this.grade[linha][coluna];
    }

    /**
     * Altera o tipo de terreno de uma casa específica (ex: transformar a borda em pântano ou adicionar um obstáculo).
     */
    public definirTerreno(linha: number, coluna: number, terreno: TipoTerreno): void {
        const casa = this.getCasa(linha, coluna);
        if (casa) {
            casa.terreno = terreno;
        }
    }

    /**
     * Insere uma peça em uma coordenada específica da memória do tabuleiro.
     */
    public colocarPeca(linha: number, coluna: number, peca: IPeca): void {
        const casa = this.getCasa(linha, coluna);
        if (casa) {
            casa.peca = peca;
        }
    }

    /**
     * Remove qualquer peça que esteja ocupando a casa indicada.
     */
    public removerPeca(linha: number, coluna: number): void {
        const casa = this.getCasa(linha, coluna);
        if (casa) {
            casa.peca = null;
        }
    }

    /**
     * Move uma peça da origem para o destino na memória, limpando a casa anterior.
     */
    public moverPecaEmMemoria(origem: ICoordenada, destino: ICoordenada): void {
        const casaOrigem = this.getCasa(origem.linha, origem.coluna);
        const casaDestino = this.getCasa(destino.linha, destino.coluna);

        if (casaOrigem && casaDestino && casaOrigem.peca) {
            casaDestino.peca = casaOrigem.peca;
            casaOrigem.peca = null;
        }
    }

    /**
     * Redefine completamente o tabuleiro, limpando as peças e restaurando os terrenos originais.
     */
    public reiniciar(): void {
        this.gerarGradeVazia();
    }
}