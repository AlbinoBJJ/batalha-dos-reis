import { Tabuleiro } from './tabuleiro.js';
import { ICoordenada, ICasa } from '../contratos/itabuleiro.js';

export class Renderizador {
    private container: HTMLElement;
    
    // Catálogo de Efeitos Sonoros
    private somMovimento: HTMLAudioElement;
    private somInicio: HTMLAudioElement;
    private somDerrota: HTMLAudioElement;
    private somVitoria: HTMLAudioElement;

    constructor(containerId: string) {
        const elemento = document.getElementById(containerId);
        if (!elemento) {
            throw new Error(`Erro Crítico: Container com ID "${containerId}" não foi encontrado no HTML.`);
        }
        this.container = elemento;
        
        // Inicialização dos buffers de áudio nativos
        this.somMovimento = new Audio('assets/sounds/move.mp3');
        this.somInicio = new Audio('assets/sounds/ogro-grito.mp3');
        this.somDerrota = new Audio('assets/sounds/risada.mp3');
        this.somVitoria = new Audio('assets/sounds/tadaa.mp3');
    }

    public reproduzirSomMovimento(): void {
        this.somMovimento.currentTime = 0;
        this.somMovimento.play().catch(() => {});
    }

    public reproduzirSomInicio(): void {
        this.somInicio.currentTime = 0;
        this.somInicio.play().catch(() => {});
    }

    public reproduzirSomDerrota(): void {
        this.somDerrota.currentTime = 0;
        this.somDerrota.play().catch(() => {});
    }

    public reproduzirSomVitoria(): void {
        this.somVitoria.currentTime = 0;
        this.somVitoria.play().catch(() => {});
    }

    public configurarEstiloTabuleiro(linhas: number, colunas: number, temaClasseCSS: string): void {
        this.container.style.setProperty('--total-linhas', linhas.toString());
        this.container.style.setProperty('--total-colunas', colunas.toString());

        const wrapper = document.getElementById('wrapper-tabuleiro');
        if (wrapper) {
            wrapper.className = `p-3 rounded shadow ${temaClasseCSS}`;
        }
    }

    /**
     * Renderiza o tabuleiro no estado padrão (gameplay activa).
     */
    public renderizarTabuleiroCompleto(
        tabuleiro: Tabuleiro, 
        onCasaClique: (coord: ICoordenada) => void,
        onMoverPeca?: (origem: ICoordenada, destino: ICoordenada) => void
    ): void {
        this.renderizarComEstadoVisual(tabuleiro, 'NORMAL', onCasaClique, onMoverPeca);
    }

    /**
     * Renderiza o tabuleiro aplicando as artes específicas de fim de jogo (Vitória ou Derrota do Jogador).
     */
    public renderizarTabuleiroFimDeJogo(
        tabuleiro: Tabuleiro,
        estadoFinal: 'VITORIA' | 'DERROTA',
        onCasaClique: (coord: ICoordenada) => void
    ): void {
        this.renderizarComEstadoVisual(tabuleiro, estadoFinal, onCasaClique);
    }

    /**
     * Motor interno de renderização matricial com suporte a troca dinâmica de caminhos de imagem.
     */
    private renderizarComEstadoVisual(
        tabuleiro: Tabuleiro,
        estadoVisual: 'NORMAL' | 'VITORIA' | 'DERROTA',
        onCasaClique: (coord: ICoordenada) => void,
        onMoverPeca?: (origem: ICoordenada, destino: ICoordenada) => void
    ): void {
        this.container.innerHTML = ''; 
        const grade = tabuleiro.getGrade();

        for (let l = 0; l < tabuleiro.linhas; l++) {
            for (let c = 0; c < tabuleiro.colunas; c++) {
                const dadosCasa = grade[l][c];
                const elementoCasa = this.criarElementoCasa(dadosCasa, estadoVisual, onCasaClique, onMoverPeca);
                this.container.appendChild(elementoCasa);
            }
        }
    }

    private criarElementoCasa(
        dadosCasa: ICasa,
        estadoVisual: 'NORMAL' | 'VITORIA' | 'DERROTA',
        onCasaClique: (coord: ICoordenada) => void,
        onMoverPeca?: (origem: ICoordenada, destino: ICoordenada) => void
    ): HTMLElement {
        const casaDiv = document.createElement('div');
        casaDiv.classList.add('casa');
        
        casaDiv.dataset.linha = dadosCasa.coordenada.linha.toString();
        casaDiv.dataset.coluna = dadosCasa.coordenada.coluna.toString();

        // Passamos as coordenadas para que o renderizador aplique o xadrez por baixo de qualquer terreno
        this.aplicarEstiloTerreno(casaDiv, dadosCasa.terreno, dadosCasa.coordenada.linha, dadosCasa.coordenada.coluna);

        if (dadosCasa.peca) {
            const pecaDiv = document.createElement('div');
            pecaDiv.classList.add('peca');
            pecaDiv.classList.add(`peca-${dadosCasa.peca.tipo.toLowerCase()}`);
            
            let caractereFonte = dadosCasa.peca.tipo === 'REI_BRANCO' ? 'k' : 'l';

            let urlImagem = '';
            if (dadosCasa.peca.tipo === 'REI_BRANCO') {
                if (estadoVisual === 'VITORIA') {
                    urlImagem = 'assets/images/rei-branco-vitoria.png';
                } else if (estadoVisual === 'DERROTA') {
                    urlImagem = 'assets/images/rei-branco-derrota.png';
                } else {
                    urlImagem = 'assets/images/rei-branco.png';
                }
            } else if (dadosCasa.peca.tipo === 'REI_PRETO') {
                if (estadoVisual === 'VITORIA') {
                    urlImagem = 'assets/images/ogro-derrota.png';
                } else if (estadoVisual === 'DERROTA') {
                    urlImagem = 'assets/images/ogro-vitoria.png';
                } else {
                    urlImagem = 'assets/images/ogro-normal.png';
                }
            }

            const imgTeste = new Image();
            imgTeste.src = urlImagem;
            
            imgTeste.onload = () => {
                pecaDiv.style.backgroundImage = `url('${urlImagem}')`;
                pecaDiv.innerText = '';
            };

            imgTeste.onerror = () => {
                pecaDiv.classList.add('peca-usando-fonte');
                pecaDiv.innerText = caractereFonte;
            };

            if (dadosCasa.peca.cor === 'BRANCO' && estadoVisual === 'NORMAL') {
                pecaDiv.setAttribute('draggable', 'true');
                
                pecaDiv.addEventListener('dragstart', (e: DragEvent) => {
                    pecaDiv.classList.add('movendo');
                    e.dataTransfer?.setData('text/plain', JSON.stringify(dadosCasa.coordenada));
                    onCasaClique(dadosCasa.coordenada);
                });

                pecaDiv.addEventListener('dragend', () => {
                    pecaDiv.classList.remove('movendo');
                });

                let coordOrigemTouch = dadosCasa.coordenada;
                let touchMoved = false;
                let clonePeca: HTMLElement | null = null;

                pecaDiv.addEventListener('touchstart', (e: TouchEvent) => {
                    touchMoved = false;
                    const touch = e.touches[0];
                    
                    clonePeca = pecaDiv.cloneNode(true) as HTMLElement;
                    clonePeca.classList.add('peca-drag-ghost');
                    clonePeca.style.position = 'fixed';
                    clonePeca.style.pointerEvents = 'none';
                    clonePeca.style.zIndex = '10000';
                    clonePeca.style.transform = `translate3d(${touch.clientX - 25}px, ${touch.clientY - 60}px, 0) scale(1.2)`;
                    clonePeca.style.filter = 'drop-shadow(0px 15px 10px rgba(0,0,0,0.4))';
                    clonePeca.style.transition = 'transform 0.05s linear';
                    
                    document.body.appendChild(clonePeca);
                    pecaDiv.style.opacity = '0';
                });

                pecaDiv.addEventListener('touchmove', (e: TouchEvent) => {
                    touchMoved = true;
                    const touch = e.touches[0];
                    if (clonePeca) {
                        clonePeca.style.transform = `translate3d(${touch.clientX - 25}px, ${touch.clientY - 60}px, 0) scale(1.2)`;
                    }
                });

                pecaDiv.addEventListener('touchend', (e: TouchEvent) => {
                    pecaDiv.style.opacity = '1';
                    if (clonePeca) { clonePeca.remove(); clonePeca = null; }

                    const touch = e.changedTouches[0];
                    const elementoSobODedo = document.elementFromPoint(touch.clientX, touch.clientY);
                    const casaAlvo = elementoSobODedo?.closest('.casa') as HTMLElement;

                    if (!touchMoved) {
                        onCasaClique(coordOrigemTouch);
                        return;
                    }

                    if (casaAlvo && casaAlvo.dataset.linha && casaAlvo.dataset.coluna && onMoverPeca) {
                        const destino: ICoordenada = {
                            linha: parseInt(casaAlvo.dataset.linha),
                            coluna: parseInt(casaAlvo.dataset.coluna)
                        };
                        onMoverPeca(coordOrigemTouch, destino);
                    }
                });
            }

            casaDiv.appendChild(pecaDiv);
        }

        casaDiv.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault(); 
            if (casaDiv.classList.contains('movimento-valido') && estadoVisual === 'NORMAL') {
                casaDiv.style.backgroundColor = 'rgba(40, 167, 69, 0.4)'; 
            }
        });

        casaDiv.addEventListener('dragleave', () => { casaDiv.style.backgroundColor = ''; });
        casaDiv.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault();
            casaDiv.style.backgroundColor = '';
            if (estadoVisual !== 'NORMAL') return;

            const dadosOrigemRaw = e.dataTransfer?.getData('text/plain');
            if (dadosOrigemRaw && onMoverPeca) {
                const origem: ICoordenada = JSON.parse(dadosOrigemRaw);
                const destino: ICoordenada = dadosCasa.coordenada;
                onMoverPeca(origem, destino);
            }
        });

        casaDiv.addEventListener('click', () => { 
            if (estadoVisual === 'NORMAL') onCasaClique(dadosCasa.coordenada); 
        });

        return casaDiv;
    }

    public atualizarCasasEspecificas(
        coordenadas: ICoordenada[], 
        tabuleiro: Tabuleiro, 
        onCasaClique: (coord: ICoordenada) => void,
        onMoverPeca?: (origem: ICoordenada, destino: ICoordenada) => void
    ): void {
        coordenadas.forEach(coord => {
            const seletor = `.casa[data-linha="${coord.linha}"][data-coluna="${coord.coluna}"]`;
            const casaAntiga = this.container.querySelector(seletor) as HTMLElement;
            
            if (casaAntiga) {
                const dadosCasaNova = tabuleiro.getCasa(coord.linha, coord.coluna);
                if (dadosCasaNova) {
                    const casaNova = this.criarElementoCasa(dadosCasaNova, 'NORMAL', onCasaClique, onMoverPeca);
                    casaAntiga.replaceWith(casaNova);
                }
            }
        });
    }

    public destacarMovimentosValidos(origem: ICoordenada | null, caminhosValidos: ICoordenada[]): void {
        this.container.querySelectorAll('.casa').forEach(casa => {
            casa.classList.remove('selecionada', 'movimento-valido');
            (casa as HTMLElement).style.backgroundColor = '';
        });

        if (origem) {
            const casaOrigem = this.container.querySelector(`.casa[data-linha="${origem.linha}"][data-coluna="${origem.coluna}"]`);
            casaOrigem?.classList.add('selecionada');
        }

        caminhosValidos.forEach(coord => {
            const casaValida = this.container.querySelector(`.casa[data-linha="${coord.linha}"][data-coluna="${coord.coluna}"]`);
            casaValida?.classList.add('movimento-valido');
        });
    }

    private aplicarEstiloTerreno(elemento: HTMLElement, terreno: string, linha: number, coluna: number): void {
        // 1. Aplica o padrão xadrez base (Grama clara ou escura) em todas as casas sem exceção
        if ((linha + coluna) % 2 === 0) {
            elemento.classList.add('casa-clara');
        } else {
            elemento.classList.add('casa-escura');
        }

        // 2. Adiciona as classes especiais por cima da grama mapeada
        switch (terreno) {
            case 'FLORESTA': 
                elemento.classList.add('casa-floresta'); 
                break;
            case 'BLOQUEADO': 
                elemento.classList.add('casa-obstaculo'); 
                break;
        }
    }
}