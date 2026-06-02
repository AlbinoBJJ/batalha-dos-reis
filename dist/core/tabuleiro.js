export class Tabuleiro {
    constructor(linhas, colunas) {
        // Nossa matriz bidimensional que representa a grade de memória do jogo
        this.grade = [];
        this.linhas = linhas;
        this.colunas = colunas;
        this.gerarGradeVazia();
    }
    /**
     * Inicializa a matriz na memória preenchendo as casas com terrenos padrão.
     */
    gerarGradeVazia() {
        this.grade = [];
        for (let l = 0; l < this.linhas; l++) {
            this.grade[l] = [];
            for (let c = 0; c < this.colunas; c++) {
                // Alterna os terrenos padrão entre claro e escuro simulando xadrez
                const terrenoPadrao = (l + c) % 2 === 0 ? 'NORMAL_CLARA' : 'NORMAL_ESCURA';
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
    getGrade() {
        return this.grade;
    }
    /**
     * Verifica se uma determinada coordenada está fisicamente dentro dos limites da matriz.
     */
    estaDentroDosLimites(linha, coluna) {
        return linha >= 0 && linha < this.linhas && coluna >= 0 && coluna < this.colunas;
    }
    /**
     * Obtém uma casa específica de forma segura através de suas coordenadas.
     */
    getCasa(linha, coluna) {
        if (!this.estaDentroDosLimites(linha, coluna))
            return null;
        return this.grade[linha][coluna];
    }
    /**
     * Altera o tipo de terreno de uma casa específica (ex: transformar a borda em pântano ou adicionar um obstáculo).
     */
    definirTerreno(linha, coluna, terreno) {
        const casa = this.getCasa(linha, coluna);
        if (casa) {
            casa.terreno = terreno;
        }
    }
    /**
     * Insere uma peça em uma coordenada específica da memória do tabuleiro.
     */
    colocarPeca(linha, coluna, peca) {
        const casa = this.getCasa(linha, coluna);
        if (casa) {
            casa.peca = peca;
        }
    }
    /**
     * Remove qualquer peça que esteja ocupando a casa indicada.
     */
    removerPeca(linha, coluna) {
        const casa = this.getCasa(linha, coluna);
        if (casa) {
            casa.peca = null;
        }
    }
    /**
     * Move uma peça da origem para o destino na memória, limpando a casa anterior.
     */
    moverPecaEmMemoria(origem, destino) {
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
    reiniciar() {
        this.gerarGradeVazia();
    }
}
