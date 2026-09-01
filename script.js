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
// PRESSÃO DA MESA
// ==========================================

function calcularPressao(total) {

    const distancia =
        Math.abs(4 - total);


    if (distancia === 0) {
        return -0.10;
    }

    if (distancia === 1) {
        return 0.05;
    }

    if (distancia === 2) {
        return 0.00;
    }

    if (distancia === 3) {
        return -0.05;
    }

    return -0.10;
}


// ==========================================
// AVALIAR FORÇA DA MÃO
// ==========================================

function calcularForcaMedia(
    minhasCartas,
    manilha
) {

    const forcas =
        minhasCartas.map(
            carta =>
                calcularForcaCarta(
                    carta,
                    manilha
                )
        );


    const media =
        forcas.reduce(
            (a, b) => a + b,
            0
        ) / forcas.length;


    return media;
}


// ==========================================
// ESTIMATIVA INICIAL
// ==========================================

function calcularProbabilidadeBase(
    declaracao,
    forcaMedia,
    totalMesa,
    jogadores
) {

    let probabilidade =
        0.50;


    // --------------------------------------
    // FORÇA DA MÃO
    // --------------------------------------

    const bonusForca =
        (forcaMedia - 50) / 100;

    probabilidade +=
        bonusForca;


    // --------------------------------------
    // QUANTIDADE DECLARADA
    // --------------------------------------

    if (declaracao === 0) {

        probabilidade += 0.10;

    } else if (declaracao === 1) {

        probabilidade += 0.06;

    } else if (declaracao === 2) {

        probabilidade += 0.02;

    } else if (declaracao === 3) {

        probabilidade -= 0.08;

    } else if (declaracao === 4) {

        probabilidade -= 0.20;
    }


    // --------------------------------------
    // PRESSÃO DA MESA
    // --------------------------------------

    probabilidade +=
        calcularPressao(totalMesa);


    // --------------------------------------
    // MAIS JOGADORES
    // --------------------------------------

    if (jogadores >= 7) {

        probabilidade -= 0.04;

    } else if (jogadores >= 5) {

        probabilidade -= 0.02;
    }


    // --------------------------------------
    // LIMITAR PROBABILIDADE
    // --------------------------------------

    probabilidade =
        Math.max(
            0.05,
            Math.min(
                0.95,
                probabilidade
            )
        );


    return probabilidade;
}


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
        // FORÇA MÉDIA
        // ----------------------------------

        const forcaMedia =
            calcularForcaMedia(
                minhasCartas,
                manilha
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
        // PROBABILIDADES
        // ----------------------------------

        const resultados =
            declaracoesPossiveis.map(
                declaracao => {

                    let probabilidade =
                        calcularProbabilidadeBase(
                            declaracao,
                            forcaMedia,
                            totalMesa,
                            jogadores
                        );


                    // Com menos vidas,
                    // valorizamos segurança.

                    if (vidas === 1) {

                        if (
                            declaracao <= 1
                        ) {

                            probabilidade +=
                                0.08;
                        }
                    }


                    if (vidas === 2) {

                        if (
                            declaracao <= 2
                        ) {

                            probabilidade +=
                                0.03;
                        }
                    }


                    probabilidade =
                        Math.max(
                            0.05,
                            Math.min(
                                0.95,
                                probabilidade
                            )
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

            Probabilidade estimada:

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