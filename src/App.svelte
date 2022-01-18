<script>
    import LetterGrid from './Components/LetterGrid.svelte'
    import Keyboard from './Components/Keyboard.svelte'
    import Modal from './Components/Modal.svelte'
    import WsHandler from './websocketHandler.js'
    import colorList from './stores/stores.js'
    let guessGrid, opponentGrid
    let waitingModal = true
    let gameOverModal = false
    let gameOverText = ''
    const url = new URL(window.location.href)
    url.protocol = url.protocol.replace('http', 'ws')
    const ws = new WsHandler(url.href, (err, e) => {
        if (err) {
            switch (err.message) {
            case 'gameNotFound':
                gameOverText = 'Game not found!'
                gameOverModal = true
                setTimeout(() => {
                    window.reload()
                }, 2000)
                break
            case 'invalidWord':
                guessGrid.shakeRow()
                console.log(guessGrid)
                break
            case 'notInList':
                guessGrid.shakeRow()
                console.log(guessGrid)
                break
            default:
                break
            }
            return
        }
        switch (e.event) {
        case 'guess':
            console.log(e)
            if (e.player === 0) {
                if (e.colorMap) {
                    Object.keys(e.colorMap).forEach((letter) => {
                        $colorList[letter] = e.colorMap[letter]
                    })
                }
                guessGrid.setColorRow(e.colorArray)
                guessGrid.incrementRow()
            } else {
                opponentGrid.setColorRow(e.colorArray)
                opponentGrid.incrementRow()
            }
            break
        case 'gameStart':
            waitingModal = false
            break
        case 'gameOver':
            gameOverModal = true
            if (e.win) {
                gameOverText = 'You Win!'
            } else {
                gameOverText = 'You Lost...'
            }
            break
        default:
            break
        }
    })
    const handleEnter = () => {
        const word = guessGrid.getWord()
        if (word) {
            ws.sendWord(word)
        }
    }
    document.addEventListener('keydown', (event) => {
        if (
            waitingModal ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey ||
            event.key === ' ' ||
            !/[a-zA-Z]/.test(event.key)
        ) {
            return
        }
        if (event.key === 'Backspace') {
            guessGrid.handleBackspace()
        }
        if (event.key === 'Enter') {
            handleEnter()
        }
        if (event.key.length === 1) {
            guessGrid.setLetter(event.key)
        }
    })
    // function beforeUnload (event) {
    //     event.preventDefault()
    //     event.returnValue = ''
    //     return '...'
    // }
</script>

<!-- <svelte:window on:beforeunload={beforeUnload}/> -->

<main>
    <header>
        <h1>Wordle Together</h1>
    </header>

    <div class="game-container">
        <div class="grid-container">
            <div class="player-container">
                <h2>You</h2>
                <LetterGrid bind:this={guessGrid} />
            </div>
            <div class="opponent-container">
                <h2>Opponent</h2>
                <LetterGrid bind:this={opponentGrid} />
            </div>
        </div>
        <Keyboard
            on:key={(event) => guessGrid.setLetter(event.detail)}
            on:backspace={guessGrid.handleBackspace}
            on:enter={handleEnter}
        />
    </div>
    <Modal
        bind:modalShow={waitingModal}
        text={'Waiting for opponent to join...'}
    />
    <Modal bind:modalShow={gameOverModal} bind:text={gameOverText} />
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        height: 99%;
    }
    header {
        padding: 8px;
        border-bottom: 1px solid var(--color-border);
    }
    .game-container {
        display: flex;
        flex-flow: column;
        justify-content: center;
        flex: 1;
    }

    .player-container,
    .opponent-container {
        display: flex;
        flex-flow: column;
        align-items: center;
        margin: 0;
        width: 100%;
        justify-content: center;
    }

    .grid-container {
        display: flex;
        flex-flow: row;
        justify-content: space-evenly;
        margin-bottom: 16px;
        flex: 1;
    }
    @media (max-width: 600px) {
        .grid-container {
            flex-flow: column-reverse;
        }
        .player-container {
            flex: 1;
        }
    }
    
</style>
