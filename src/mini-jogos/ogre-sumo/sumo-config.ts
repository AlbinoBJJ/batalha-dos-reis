import { IConfiguracaoJogo } from '../../contratos/itabuleiro';

export const CONFIG_SUMO: IConfiguracaoJogo = {
    id: 'ogre-sumo',
    nome: 'Batalha dos Reis',
    linhas: 8,
    colunas: 8,
    temaClasseCSS: 'tema-floresta', // Conecta diretamente com css/themes/floresta.css
    dadosCustomizados: {
        // Miolo central restrito para o sorteio de setup (índices baseados em 0)
        centro: {
            linhaMin: 2, // Linha 3 real
            linhaMax: 5, // Linha 6 real
            colunaMin: 2, // Coluna C real
            colunaMax: 5  // Coluna F real
        }
    }
};