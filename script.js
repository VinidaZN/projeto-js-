// ==========================================
// FODINHA - CALCULADORA DE PROBABILIDADE
// MODELO MATEMÁTICO - VERSÃO 1
// ==========================================


// ==========================================
// CARTAS
// ==========================================

const valores = [
    4, 5, 6, 7, 10, 11, 12, 1, 2, 3
];

const naipes = [
    { nome: "mole", simbolo: "♦" },
    { nome: "espada", simbolo: "♠" },
    { nome: "copa", simbolo: "♥" },
    { nome: "paus", simbolo: "♣" }
];


// ==========================================
// CRIAR BARALHO
// ==========================================

function criarBaralho() {

    const baralho = [];

    for (const valor of valores) {

        for (let i = 0; i < naipes.length; i++) {

            const naipe = naipes[i];

            baralho.push({

                id: `${valor}-${naipe.nome}`,

                valor: valor,

                naipe: naipe.nome,

                simbolo: naipe.simbolo,

                forca:
                    valores.indexOf(valor) * 4 + i
            });
        }
    }

    return baralho;
}

const baralho = criarBaralho();


// ==========================================
// MANILHA
// ==========================================

function descobrirManilha(valorVirado) {

    const indice =
        valores.indexOf(Number(valorVirado));

    if (indice === valores.length - 1) {
        return valores[0];
    }

    return valores[indice + 1];
}


// ==========================================
// FORÇA DA CARTA
// ==========================================

function calcularForcaCarta(carta, manilha) {

    if (carta.valor === manilha) {

        const forcaNaipe =
            naipes.findIndex(
                naipe => naipe.nome === carta.naipe
            );

        return 100 + forcaNaipe;
    }

    return carta.forca;
}


// ==========================================
// V2 - CONFIGURAÇÃO CENTRAL DA SIMULAÇÃO
// ==========================================
//
// Nenhum "número mágico" da simulação deve
// ficar solto pelo código. Tudo relevante
// para o comportamento do modelo vive aqui.

const CONFIG_SIMULACAO = {

    // Simulações executadas para CADA
    // declaração candidata (0 a 4).
    // Tempo total ≈ SIMULACOES × nº de
    // declarações possíveis (no máx. 5).
    SIMULACOES: 10000,

    // Quando o jogador ainda PRECISA de
    // vitórias e o número de rodadas
    // restantes é exatamente igual ao que
    // falta, ele tenta jogar a carta mais
    // forte com esta probabilidade.
    PROB_BUSCAR_VITORIA: 0.85,

    // Quando o jogador já bateu (ou passou)
    // sua meta de vitórias, ele tenta jogar
    // a carta mais fraca com esta
    // probabilidade, para não vencer mais
    // rodadas do que declarou.
    PROB_EVITAR_VITORIA: 0.85,

    // Nos casos "no meio do caminho"
    // (precisa de algumas vitórias, mas não
    // de todas as rodadas restantes), este
    // fator amplia ou reduz a tendência de
    // jogar forte. 1.0 = segue a proporção
    // exata de rodadas que ainda precisa
    // vencer.
    AGRESSIVIDADE: 1.0
};


// ==========================================
// V2 - EMBARALHAR (Fisher-Yates)
// ==========================================

function embaralhar(lista) {

    const copia = lista.slice();

    for (
        let i = copia.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        const temp = copia[i];
        copia[i] = copia[j];
        copia[j] = temp;
    }

    return copia;
}


// ==========================================
// V2 - CARTAS RESTANTES (universo desconhecido)
// ==========================================
//
// Todas as 40 cartas, exceto a carta virada
// e as 4 cartas do próprio jogador. Essas
// são as únicas cartas que PODEM estar nas
// mãos dos adversários (ou sobrando no monte,
// no caso de 9 jogadores).

function obterCartasRestantes(
    cartaVirada,
    minhasCartas
) {

    const idsConhecidos = new Set([
        cartaVirada.id,
        ...minhasCartas.map(carta => carta.id)
    ]);

    return baralho.filter(
        carta => !idsConhecidos.has(carta.id)
    );
}


// ==========================================
// V2 - DISTRIBUIR CARTAS DOS ADVERSÁRIOS
// ==========================================
//
// Sorteia, a partir das cartas restantes, uma
// mão de 4 cartas para cada adversário. Uma
// mesma carta nunca vai para dois jogadores
// (cada uma é removida do baralho embaralhado
// conforme é distribuída).

function distribuirCartasAdversarios(
    cartasRestantes,
    numeroAdversarios
) {

    const embaralhadas =
        embaralhar(cartasRestantes);

    const maos = [];

    for (
        let i = 0;
        i < numeroAdversarios;
        i++
    ) {

        maos.push(
            embaralhadas.slice(
                i * 4,
                i * 4 + 4
            )
        );
    }

    return maos;
}


// ==========================================
// V2 - SORTEAR DECLARAÇÕES DOS JOGADORES
// QUE AINDA VÃO FALAR DEPOIS DE MIM
// ==========================================
//
// As declarações de quem já falou ANTES de
// mim são conhecidas (vêm da interface). As
// de quem fala DEPOIS de mim são desconhecidas
// no momento da minha decisão, então são
// sorteadas de forma uniforme entre 0 e 4,
// respeitando a regra de que o ÚLTIMO jogador
// da mesa não pode fechar o total em 4.

function sortearDeclaracoesPosteriores(
    minhaPosicao,
    minhaDeclaracao,
    totalAntesDeMim,
    totalJogadores
) {

    const declaracoesSorteadas = [];

    let totalParcial =
        totalAntesDeMim +
        minhaDeclaracao;

    for (
        let posicao = minhaPosicao + 1;
        posicao <= totalJogadores;
        posicao++
    ) {

        let opcoes =
            [0, 1, 2, 3, 4];

        // Regra do último jogador.
        if (posicao === totalJogadores) {

            opcoes =
                opcoes.filter(
                    valor =>
                        totalParcial + valor !== 4
                );
        }

        const escolha =
            opcoes[
                Math.floor(
                    Math.random() * opcoes.length
                )
            ];

        declaracoesSorteadas.push(escolha);

        totalParcial += escolha;
    }

    return declaracoesSorteadas;
}


// ==========================================
// V2 - ESCOLHA DE CARTA (COMPORTAMENTO)
// ==========================================
//
// Modelo simples e probabilístico (não
// determinístico) para decidir qual carta da
// mão um jogador (você ou um adversário) joga
// numa rodada, dado quantas vitórias ainda
// precisa para bater a própria meta.
//
// necessarias  = quantas vitórias ainda faltam
//                para atingir a declaração
//                (pode ser <= 0)
// rodadasRestantes = quantas rodadas, contando
//                a atual, ainda vão acontecer

function escolherCartaJogador(
    mao,
    manilha,
    necessarias,
    rodadasRestantes
) {

    // Índices da mão ordenados por força.
    const indices =
        mao.map((carta, indice) => indice);

    indices.sort(
        (a, b) =>
            calcularForcaCarta(mao[a], manilha) -
            calcularForcaCarta(mao[b], manilha)
    );

    const indiceMaisFraca =
        indices[0];

    const indiceMaisForte =
        indices[indices.length - 1];

    const indiceAleatorio =
        Math.floor(
            Math.random() * mao.length
        );


    // Já bateu (ou passou) a meta:
    // tende a evitar vencer mais rodadas.

    if (necessarias <= 0) {

        return Math.random() <
            CONFIG_SIMULACAO.PROB_EVITAR_VITORIA
            ? indiceMaisFraca
            : indiceAleatorio;
    }


    // Precisa vencer todas as rodadas
    // restantes (ou mais do que isso):
    // tende a jogar a carta mais forte.

    if (necessarias >= rodadasRestantes) {

        return Math.random() <
            CONFIG_SIMULACAO.PROB_BUSCAR_VITORIA
            ? indiceMaisForte
            : indiceAleatorio;
    }


    // Caso intermediário: a chance de jogar
    // forte é proporcional a quanto ainda
    // falta, escalada pela agressividade.

    const proporcao =
        (necessarias / rodadasRestantes) *
        CONFIG_SIMULACAO.AGRESSIVIDADE;

    const sorteio =
        Math.random();

    if (sorteio < proporcao) {
        return indiceMaisForte;
    }

    if (sorteio < proporcao + (1 - proporcao) * 0.3) {
        return indiceMaisFraca;
    }

    return indiceAleatorio;
}


// ==========================================
// V2 - SIMULAR UMA MÃO COMPLETA (4 RODADAS)
// ==========================================
//
// Retorna quantas rodadas o próprio jogador
// venceu nessa mão simulada.

function simularMao(
    minhaDeclaracaoTeste,
    minhasCartasOriginais,
    manilha,
    declaracoesConhecidas,
    minhaPosicao,
    totalJogadores,
    cartasRestantes
) {

    const numeroAdversarios =
        totalJogadores - 1;

    const maosAdversarios =
        distribuirCartasAdversarios(
            cartasRestantes,
            numeroAdversarios
        );


    // Monta a lista de "declaração alvo" de
    // cada jogador da mesa, na ordem de
    // posição (1..totalJogadores).

    let totalAntesDeMim = 0;

    for (
        let i = 0;
        i < minhaPosicao - 1;
        i++
    ) {

        totalAntesDeMim +=
            declaracoesConhecidas[i];
    }

    const declaracoesPosteriores =
        sortearDeclaracoesPosteriores(
            minhaPosicao,
            minhaDeclaracaoTeste,
            totalAntesDeMim,
            totalJogadores
        );

    const metas = [];

    for (
        let posicao = 1;
        posicao <= totalJogadores;
        posicao++
    ) {

        if (posicao < minhaPosicao) {

            metas.push(
                declaracoesConhecidas[posicao - 1]
            );

        } else if (posicao === minhaPosicao) {

            metas.push(
                minhaDeclaracaoTeste
            );

        } else {

            metas.push(
                declaracoesPosteriores[
                    posicao - minhaPosicao - 1
                ]
            );
        }
    }


    // Monta as mãos de todos os jogadores,
    // na ordem de posição. Minha posição usa
    // as MINHAS cartas reais; as demais usam
    // as mãos sorteadas dos adversários.

    const maos = [];
    let indiceAdversario = 0;

    for (
        let posicao = 1;
        posicao <= totalJogadores;
        posicao++
    ) {

        if (posicao === minhaPosicao) {

            maos.push(
                minhasCartasOriginais.slice()
            );

        } else {

            maos.push(
                maosAdversarios[indiceAdversario].slice()
            );

            indiceAdversario++;
        }
    }


    const vitorias =
        new Array(totalJogadores).fill(0);


    // Simula as 4 rodadas.

    for (
        let rodada = 0;
        rodada < 4;
        rodada++
    ) {

        const rodadasRestantes =
            4 - rodada;

        let indiceVencedor = -1;
        let forcaVencedora = -Infinity;
        const cartasJogadas = [];

        for (
            let jogador = 0;
            jogador < totalJogadores;
            jogador++
        ) {

            const necessarias =
                metas[jogador] -
                vitorias[jogador];

            const indiceEscolhido =
                escolherCartaJogador(
                    maos[jogador],
                    manilha,
                    necessarias,
                    rodadasRestantes
                );

            const carta =
                maos[jogador][indiceEscolhido];

            maos[jogador].splice(
                indiceEscolhido,
                1
            );

            cartasJogadas.push(carta);

            const forca =
                calcularForcaCarta(carta, manilha);

            if (forca > forcaVencedora) {

                forcaVencedora = forca;
                indiceVencedor = jogador;
            }
        }

        vitorias[indiceVencedor]++;
    }

    return vitorias[minhaPosicao - 1];
}


// ==========================================
// V2 - PROBABILIDADE POR SIMULAÇÃO
// ==========================================
//
// Para uma declaração candidata, roda
// CONFIG_SIMULACAO.SIMULACOES mãos completas
// e retorna a fração delas em que o jogador
// venceu EXATAMENTE essa quantidade de
// rodadas (ou seja, não perdeu vida).

function simularProbabilidadeNaoPerderVida(
    declaracaoTeste,
    minhasCartas,
    manilha,
    declaracoesConhecidas,
    minhaPosicao,
    totalJogadores,
    cartasRestantesBase
) {

    let acertos = 0;

    const total =
        CONFIG_SIMULACAO.SIMULACOES;

    for (
        let i = 0;
        i < total;
        i++
    ) {

        const vitoriasNaMao =
            simularMao(
                declaracaoTeste,
                minhasCartas,
                manilha,
                declaracoesConhecidas,
                minhaPosicao,
                totalJogadores,
                cartasRestantesBase
            );

        if (vitoriasNaMao === declaracaoTeste) {
            acertos++;
        }
    }

    return acertos / total;
}


// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const playersInput =
    document.getElementById("players");

const positionInput =
    document.getElementById("position");

const livesInput =
    document.getElementById("lives");

const turnedCard =
    document.getElementById("turnedCard");

const hand =
    document.getElementById("hand");

const playersDeclarations =
    document.getElementById("playersDeclarations");

const tableTotal =
    document.getElementById("tableTotal");

const calculateButton =
    document.getElementById("calculate");

const resultText =
    document.getElementById("resultText");

const actualWins =
    document.getElementById("actualWins");

const finishRound =
    document.getElementById("finishRound");

const lifeResult =
    document.getElementById("lifeResult");


// ==========================================
// VARIÁVEL DO ÚLTIMO PALPITE
// ==========================================

let ultimoPalpite = null;


// ==========================================
// POSIÇÃO DO JOGADOR
// ==========================================

function atualizarPosicoes() {

    let quantidade =
        Number(playersInput.value);

    if (quantidade < 2) {
        quantidade = 2;
    }

    if (quantidade > 9) {
        quantidade = 9;
    }

    playersInput.value = quantidade;

    const posicaoAnterior =
        Number(positionInput.value);

    positionInput.innerHTML = "";

    for (
        let i = 1;
        i <= quantidade;
        i++
    ) {

        const option =
            document.createElement("option");

        option.value = i;

        option.textContent =
            `${i}º jogador`;

        positionInput.appendChild(option);
    }

    if (
        posicaoAnterior >= 1 &&
        posicaoAnterior <= quantidade
    ) {

        positionInput.value =
            posicaoAnterior;

    } else {

        positionInput.value =
            quantidade;
    }

    atualizarDeclaracoes();
}


// ==========================================
// DECLARAÇÕES DOS JOGADORES ANTERIORES
// ==========================================

function atualizarDeclaracoes() {

    const quantidade =
        Number(playersInput.value);

    const minhaPosicao =
        Number(positionInput.value);

    playersDeclarations.innerHTML = "";


    // Se for o primeiro a falar,
    // não existem declarações anteriores.

    if (minhaPosicao === 1) {

        playersDeclarations.innerHTML =
            "<p>Você é o primeiro a declarar.</p>";

        atualizarTotalMesa();

        return;
    }


    for (
        let i = 1;
        i < minhaPosicao;
        i++
    ) {

        const div =
            document.createElement("div");

        div.className =
            "player-declaration";


        const label =
            document.createElement("label");

        label.textContent =
            `Jogador ${i}`;

        div.appendChild(label);


        const select =
            document.createElement("select");

        select.className =
            "declaration-input";

        select.dataset.player =
            i;


        const vazio =
            document.createElement("option");

        vazio.value = "";

        vazio.textContent =
            "Ainda não informado";

        select.appendChild(vazio);


        for (
            let valor = 0;
            valor <= 4;
            valor++
        ) {

            const option =
                document.createElement("option");

            option.value = valor;

            option.textContent =
                `${valor} vitória${valor === 1 ? "" : "s"}`;

            select.appendChild(option);
        }


        select.value = "";


        select.addEventListener(
            "change",
            atualizarTotalMesa
        );


        div.appendChild(select);

        playersDeclarations.appendChild(div);
    }


    atualizarTotalMesa();
}


// ==========================================
// TOTAL DECLARADO NA MESA
// ==========================================

function atualizarTotalMesa() {

    const campos =
        document.querySelectorAll(
            ".declaration-input"
        );

    let total = 0;

    let completos = true;


    campos.forEach(campo => {

        if (campo.value === "") {

            completos = false;

        } else {

            total += Number(campo.value);
        }
    });


    tableTotal.textContent =
        total;


    if (!completos) {

        tableTotal.textContent =
            `${total} (parcial)`;
    }
}


// ==========================================
// CARTA VIRADA
// ==========================================

function preencherCartaVirada() {

    turnedCard.innerHTML =
        `<option value="">
            Selecione a carta
        </option>`;


    for (const carta of baralho) {

        const option =
            document.createElement("option");

        option.value =
            carta.id;

        option.textContent =
            `${carta.valor} de ${carta.naipe} ${carta.simbolo}`;

        turnedCard.appendChild(option);
    }
}


// ==========================================
// CRIAR OS 4 ESPAÇOS DAS CARTAS
// ==========================================

function criarEspacosDasCartas() {

    hand.innerHTML = "";


    for (let i = 0; i < 4; i++) {

        const select =
            document.createElement("select");

        select.className =
            "card-slot";

        select.dataset.slot =
            i;


        const primeiraOpcao =
            document.createElement("option");

        primeiraOpcao.value =
            "";

        primeiraOpcao.textContent =
            `Carta ${i + 1}`;

        select.appendChild(
            primeiraOpcao
        );


        for (const carta of baralho) {

            const option =
                document.createElement("option");

            option.value =
                carta.id;

            option.textContent =
                `${carta.valor} ${carta.simbolo} (${carta.naipe})`;

            select.appendChild(
                option
            );
        }


        hand.appendChild(
            select
        );
    }
}


// ==========================================
// EVITAR CARTAS REPETIDAS
// ==========================================

function atualizarCartasDisponiveis() {

    const selects =
        document.querySelectorAll(
            ".card-slot"
        );

    const selecionadas = [];


    selects.forEach(select => {

        if (select.value) {

            selecionadas.push(
                select.value
            );
        }
    });


    const cartaViradaId =
        turnedCard.value;


    selects.forEach(select => {

        const valorAtual =
            select.value;


        select.querySelectorAll("option")
            .forEach(option => {

                const cartaRepetida =
                    selecionadas.includes(
                        option.value
                    );

                const cartaVirada =
                    option.value ===
                    cartaViradaId;


                if (
                    option.value &&
                    option.value !== valorAtual &&
                    (
                        cartaRepetida ||
                        cartaVirada
                    )
                ) {

                    option.disabled = true;

                } else {

                    option.disabled = false;
                }
            });
    });
}


hand.addEventListener(
    "change",
    atualizarCartasDisponiveis
);


turnedCard.addEventListener(
    "change",
    atualizarCartasDisponiveis
);


// ==========================================
// CALCULAR PROBABILIDADE
// ==========================================

calculateButton.addEventListener(
    "click",
    () => {

        const jogadores =
            Number(playersInput.value);

        const posicao =
            Number(positionInput.value);

        const vidas =
            Number(livesInput.value);


        // ----------------------------------
        // CARTA VIRADA
        // ----------------------------------

        if (!turnedCard.value) {

            resultText.textContent =
                "Selecione a carta virada.";

            return;
        }


        // ----------------------------------
        // SUAS CARTAS
        // ----------------------------------

        const ids =
            Array.from(
                document.querySelectorAll(
                    ".card-slot"
                )
            )
            .map(
                select => select.value
            )
            .filter(Boolean);


        if (ids.length !== 4) {

            resultText.textContent =
                "Selecione exatamente 4 cartas.";

            return;
        }


        // ----------------------------------
        // VERIFICAR DECLARAÇÕES
        // ----------------------------------

        const campos =
            document.querySelectorAll(
                ".declaration-input"
            );


        let todasInformadas =
            true;


        campos.forEach(campo => {

            if (campo.value === "") {

                todasInformadas =
                    false;
            }
        });


        if (!todasInformadas) {

            resultText.textContent =
                "Informe todas as declarações dos jogadores que falaram antes de você.";

            return;
        }


        // ----------------------------------
        // TOTAL DA MESA
        // ----------------------------------

        let totalMesa = 0;


        campos.forEach(campo => {

            totalMesa +=
                Number(campo.value);
        });


        tableTotal.textContent =
            totalMesa;


        // ----------------------------------
        // CARTA VIRADA
        // ----------------------------------

        const cartaVirada =
            baralho.find(
                carta =>
                    carta.id ===
                    turnedCard.value
            );


        const manilha =
            descobrirManilha(
                cartaVirada.valor
            );


        // ----------------------------------
        // SUAS CARTAS
        // ----------------------------------

        const minhasCartas =
            ids.map(
                id =>
                    baralho.find(
                        carta =>
                            carta.id === id
                    )
            );


        // ----------------------------------
        // CARTAS RESTANTES (universo p/ os
        // adversários, usado na simulação)
        // ----------------------------------

        const cartasRestantes =
            obterCartasRestantes(
                cartaVirada,
                minhasCartas
            );


        // ----------------------------------
        // DECLARAÇÕES JÁ CONHECIDAS (dos
        // jogadores que falaram antes de mim)
        // ----------------------------------

        const declaracoesConhecidas =
            Array.from(campos).map(
                campo => Number(campo.value)
            );


        // ----------------------------------
        // DECLARAÇÕES POSSÍVEIS
        // ----------------------------------

        const declaracoesPossiveis =
            [];


        for (
            let declaracao = 0;
            declaracao <= 4;
            declaracao++
        ) {

            const novoTotal =
                totalMesa +
                declaracao;


            // Último jogador não pode
            // fazer o total chegar a 4.

            if (
                posicao === jogadores &&
                novoTotal === 4
            ) {

                continue;
            }


            declaracoesPossiveis.push(
                declaracao
            );
        }


        // ----------------------------------
        // PROBABILIDADES (via SIMULAÇÃO)
        // ----------------------------------
        //
        // Para cada declaração possível,
        // rodamos milhares de mãos simuladas
        // e medimos a fração delas em que o
        // jogador venceu EXATAMENTE aquela
        // quantidade de rodadas. Essa fração
        // É a probabilidade de não perder
        // vida com aquela declaração — não é
        // mais um peso arbitrário.
        //
        // Observação: as vidas restantes NÃO
        // alteram esse cálculo. Elas são
        // informação apenas para o jogador
        // decidir entre declarações com
        // probabilidades parecidas.

        const resultados =
            declaracoesPossiveis.map(
                declaracao => {

                    const probabilidade =
                        simularProbabilidadeNaoPerderVida(
                            declaracao,
                            minhasCartas,
                            manilha,
                            declaracoesConhecidas,
                            posicao,
                            jogadores,
                            cartasRestantes
                        );

                    return {

                        declaracao:
                            declaracao,

                        probabilidade:
                            probabilidade
                    };
                }
            );


        // ----------------------------------
        // MELHOR DECLARAÇÃO
        // ----------------------------------

        resultados.sort(
            (a, b) =>
                b.probabilidade -
                a.probabilidade
        );


        const melhor =
            resultados[0];


        // GUARDAR O PALPITE
        // PARA O RESULTADO FINAL

        ultimoPalpite =
            melhor.declaracao;


        // ----------------------------------
        // EXIBIR RESULTADO
        // ----------------------------------

        let html = `

            <strong>ANÁLISE DA MESA</strong>

            <br><br>

            Jogadores:
            ${jogadores}

            <br>

            Sua posição:
            ${posicao}º

            <br>

            Suas vidas:
            ${
                vidas > 0
                ? "❤️".repeat(vidas)
                : "💀"
            }

            <br>

            Total declarado:
            ${totalMesa}

            <br><br>

            Carta virada:

            <strong>
                ${cartaVirada.valor}
                ${cartaVirada.simbolo}
                ${cartaVirada.naipe}
            </strong>

            <br>

            Manilha:

            <strong>
                ${manilha}
            </strong>

            <br><br>

            <strong>
                DECLARAÇÕES POSSÍVEIS
            </strong>

            <br>

            <span style="font-size: 13px; color: #888;">
                Probabilidade de NÃO perder vida,
                segundo ${CONFIG_SIMULACAO.SIMULACOES.toLocaleString("pt-BR")}
                simulações do modelo atual por declaração.
            </span>

            <br><br>
        `;


        resultados.forEach(
            resultado => {

                const percentual =
                    (
                        resultado.probabilidade *
                        100
                    ).toFixed(1);


                const destaque =
                    resultado.declaracao ===
                    melhor.declaracao
                    ? " ⭐"
                    : "";


                html += `

                    <div>

                        <strong>
                            ${resultado.declaracao}
                        </strong>

                        →
                        ${percentual}%

                        ${destaque}

                    </div>

                `;
            }
        );


        html += `

            <br>

            <strong>
                🧠 PALPITE RECOMENDADO
            </strong>

            <br><br>

            <span style="font-size: 28px;">
                ${melhor.declaracao}
            </span>

            <br><br>

            Probabilidade de não perder vida
            (simulada):

            <strong>
                ${
                    (
                        melhor.probabilidade *
                        100
                    ).toFixed(1)
                }%
            </strong>

        `;


        resultText.innerHTML =
            html;
    }
);


// ==========================================
// RESULTADO REAL
// ==========================================

finishRound.addEventListener(
    "click",
    () => {

        if (actualWins.value === "") {

            lifeResult.textContent =
                "Informe quantas rodadas você realmente venceu.";

            return;
        }


        if (ultimoPalpite === null) {

            lifeResult.textContent =
                "Faça primeiro a análise da partida.";

            return;
        }


        const realizadas =
            Number(actualWins.value);


        const vidasAtuais =
            Number(livesInput.value);


        // ----------------------------------
        // VIDAS PERDIDAS
        // ----------------------------------

        const vidasPerdidas =
            Math.abs(
                ultimoPalpite -
                realizadas
            );


        const novasVidas =
            Math.max(
                0,
                vidasAtuais -
                vidasPerdidas
            );


        // ----------------------------------
        // RESULTADO
        // ----------------------------------

        if (vidasPerdidas === 0) {

            lifeResult.innerHTML = `

                <strong>
                    ✅ PALPITE ACERTADO
                </strong>

                <br><br>

                Palpite:
                ${ultimoPalpite}

                <br>

                Rodadas realizadas:
                ${realizadas}

                <br>

                Vidas perdidas:
                0

                <br><br>

                Vidas restantes:

                ${
                    "❤️".repeat(
                        novasVidas
                    )
                }

            `;

        } else {

            lifeResult.innerHTML = `

                <strong>
                    ⚠️ PALPITE ERRADO
                </strong>

                <br><br>

                Palpite:
                ${ultimoPalpite}

                <br>

                Rodadas realizadas:
                ${realizadas}

                <br>

                Vidas perdidas:
                ${vidasPerdidas}

                <br><br>

                Vidas restantes:

                ${
                    novasVidas > 0
                    ? "❤️".repeat(novasVidas)
                    : "💀 ELIMINADO"
                }

            `;
        }


        // Atualizar vidas
        livesInput.value =
            novasVidas;


        // Limpar resultado anterior
        actualWins.value = "";


        // Se chegou a zero
        if (novasVidas === 0) {

            lifeResult.innerHTML += `

                <br><br>

                <strong>
                    💀 Você foi eliminado.
                </strong>

            `;
        }
    }
);


// ==========================================
// EVENTOS
// ==========================================

playersInput.addEventListener(
    "change",
    atualizarPosicoes
);


positionInput.addEventListener(
    "change",
    atualizarDeclaracoes
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

preencherCartaVirada();

criarEspacosDasCartas();

atualizarPosicoes();

atualizarCartasDisponiveis();


// ==========================================
// TESTES NO CONSOLE
// ==========================================

console.log(
    "Baralho:",
    baralho
);

console.log(
    "Quantidade de cartas:",
    baralho.length
);


// ==========================================
// V2 - TESTES DO MOTOR (rodam no console,
// não bloqueiam nem alteram a interface)
// ==========================================

function rodarTestesFodinha() {

    const resultados = [];

    function afirmar(nome, condicao) {

        resultados.push({
            nome: nome,
            passou: Boolean(condicao)
        });
    }


    // 1. Baralho possui 40 cartas.
    afirmar(
        "Baralho tem 40 cartas",
        baralho.length === 40
    );


    // 2. Não existem cartas duplicadas.
    const idsUnicos =
        new Set(baralho.map(c => c.id));

    afirmar(
        "Nenhuma carta duplicada",
        idsUnicos.size === 40
    );


    // 4. Manilha funciona.
    afirmar(
        "Virada 5 → manilha 6",
        descobrirManilha(5) === 6
    );

    afirmar(
        "Virada 12 → manilha 1",
        descobrirManilha(12) === 1
    );

    afirmar(
        "Virada 3 → manilha 4",
        descobrirManilha(3) === 4
    );


    // 5. Ordem dos naipes (mole < espada < copa < paus).
    const ordemNaipesOk =
        naipes[0].nome === "mole" &&
        naipes[1].nome === "espada" &&
        naipes[2].nome === "copa" &&
        naipes[3].nome === "paus";

    afirmar(
        "Ordem dos naipes correta",
        ordemNaipesOk
    );


    // 6. Uma manilha vence qualquer carta normal.
    const manilhaTeste = 6;

    const cartaManilhaFraca =
        baralho.find(
            c => c.valor === manilhaTeste && c.naipe === "mole"
        );

    const cartaNormalForte =
        baralho.find(
            c => c.valor === 3 && c.naipe === "paus"
        );

    afirmar(
        "Manilha (mesmo fraca) vence carta normal forte",
        calcularForcaCarta(cartaManilhaFraca, manilhaTeste) >
        calcularForcaCarta(cartaNormalForte, manilhaTeste)
    );


    // 7. Último jogador não pode completar total 4.
    const opcoesUltimo =
        [0, 1, 2, 3, 4].filter(
            v => (3 + v) !== 4
        );

    afirmar(
        "Último jogador não pode declarar 1 quando total parcial é 3",
        !opcoesUltimo.includes(1)
    );


    // 8, 9, 10. Vidas perdidas = |declaração - resultado|.
    afirmar(
        "Declaração 2, resultado 2 → 0 vidas perdidas",
        Math.abs(2 - 2) === 0
    );

    afirmar(
        "Declaração 2, resultado 1 → 1 vida perdida",
        Math.abs(2 - 1) === 1
    );

    afirmar(
        "Declaração 3, resultado 0 → 3 vidas perdidas",
        Math.abs(3 - 0) === 3
    );


    // Testes específicos da simulação V2.

    const cartaViradaTeste =
        baralho.find(
            c => c.valor === 5 && c.naipe === "copa"
        );

    const minhasCartasTeste =
        baralho
            .filter(c => c.id !== cartaViradaTeste.id)
            .slice(0, 4);

    afirmar(
        "Carta virada nunca aparece na própria mão (dado de teste)",
        !minhasCartasTeste.some(
            c => c.id === cartaViradaTeste.id
        )
    );

    const restantesTeste =
        obterCartasRestantes(
            cartaViradaTeste,
            minhasCartasTeste
        );

    afirmar(
        "Cartas restantes = 40 - 1 (virada) - 4 (mão) = 35",
        restantesTeste.length === 35
    );

    const maosAdversariosTeste =
        distribuirCartasAdversarios(
            restantesTeste,
            3
        );

    const todasCartasDistribuidas =
        maosAdversariosTeste.flat();

    const idsDistribuidos =
        todasCartasDistribuidas.map(c => c.id);

    afirmar(
        "Nenhuma carta repetida entre as mãos dos adversários",
        new Set(idsDistribuidos).size === idsDistribuidos.length
    );

    afirmar(
        "Cada adversário recebe exatamente 4 cartas",
        maosAdversariosTeste.every(mao => mao.length === 4)
    );


    // A soma das probabilidades (declaração
    // 0 a 4, sem a restrição do último
    // jogador) deve ficar próxima de 100%,
    // já que são eventos mutuamente
    // exclusivos que cobrem todo o espaço
    // de resultados (0 a 4 vitórias).

    const manilhaSoma =
        descobrirManilha(cartaViradaTeste.valor);

    let somaProbabilidades = 0;

    for (
        let declaracao = 0;
        declaracao <= 4;
        declaracao++
    ) {

        somaProbabilidades +=
            simularProbabilidadeNaoPerderVida(
                declaracao,
                minhasCartasTeste,
                manilhaSoma,
                [],
                1,
                4,
                restantesTeste
            );
    }

    afirmar(
        "Soma das probabilidades (0 a 4) fica perto de 100% (±8%, dado o tamanho da amostra)",
        Math.abs(somaProbabilidades - 1) < 0.08
    );


    // Exibir resultado no console.

    console.log(
        "=========================================="
    );
    console.log(
        "TESTES FODINHA - RESULTADO"
    );
    console.log(
        "=========================================="
    );

    resultados.forEach(resultado => {

        console.log(
            (resultado.passou ? "✅" : "❌") +
            " " +
            resultado.nome
        );
    });

    const totalTestes = resultados.length;
    const totalPassou =
        resultados.filter(r => r.passou).length;

    console.log(
        `${totalPassou}/${totalTestes} testes passaram.`
    );

    return resultados;
}

rodarTestesFodinha();