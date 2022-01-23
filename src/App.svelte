<script>
    import LetterGrid from './Components/LetterGrid.svelte'
    import Keyboard from './Components/Keyboard.svelte'
    import Modal from './Components/Modal.svelte'
    import Timer from './Components/Timer.svelte'
    import WsHandler from './websocketHandler.js'
    import colorList from './stores/stores.js'
    let guessGrid, opponentGrid
    let waitingModal = window.location.href.includes('/game')
    let gameOverModal = false
    let gameOverText = ''
    let gameOverDescription = ''
    let win = false
    let guessCount = 0
    let timer
    const url = new URL(window.location.href)
    url.protocol = url.protocol.replace('http', 'ws')

    const ws = new WsHandler(url.href, (err, e) => {
        if (err) {
            switch (err.message) {
                case 'roomNotFound':
                    waitingModal = false
                    gameOverText = 'Game not found!'
                    gameOverModal = true
                    setTimeout(() => {
                        window.reload()
                    }, 2000)
                    break
                case 'roomFull':
                    waitingModal = false
                    gameOverText = 'Game is full!'
                    gameOverModal = true
                    setTimeout(() => {
                        window.reload()
                    }, 2000)
                    break
                case 'invalidWord':
                case 'notInList':
                    guessGrid.shakeRow()
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
                            if ($colorList[letter] !== 'var(--bg-correct)') {
                                $colorList[letter] = e.colorMap[letter]
                            }
                        })
                    }
                    guessGrid.setColorRow(e.colorArray)
                    guessGrid.incrementRow()
                    guessCount++
                } else {
                    opponentGrid.setColorRow(e.colorArray)
                    opponentGrid.incrementRow()
                }
                break
            case 'gameStart':
                waitingModal = false
                timer.startTimer()
                break
            case 'gameOver':
                timer.stopTimer()
                if (e.win) {
                    win = true
                    gameOverText = 'You Won!'
                    if (!e.word || e.word === guessGrid.getWord()) {
                        guessGrid.setColorRow(Array(5).fill('green'))
                    }
                } else {
                    gameOverText = 'You Lost…'
                    if (guessCount !== 6) {
                        opponentGrid.setColorRow(Array(5).fill('green'))
                    }
                }
                gameOverDescription = `The word was ${e.word || guessGrid.getWord()}.`
                gameOverModal = true
                break
            case 'matchMakeFound':
                window.location.href = `/game/${e.gameId}`
                break
            case 'roomFull':
                waitingModal = false
                gameOverText = 'Room is full!'
                gameOverModal = true
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
    const matchMake = () => {
        ws.matchMake()
    }
</script>

<!-- <svelte:window on:beforeunload={beforeUnload}/> -->

<main>
    <header>
        <h1>Wordle Together</h1>
        <div><Timer bind:this={timer}/></div>
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
        title={'Waiting for Opponent'}
    >
        <div class="actions">
            <button on:click={() => { matchMake() }}>Play With Anyone</button>
            <button on:click={() => {
                if ('share' in navigator) {
                    navigator.share({
                    title: 'Wordle Together',
                    text: 'I\'m playing Wordle Together! Can you beat me?',
                    url: window.location.href
                    })
                } else {
                    navigator.clipboard.writeText(window.location.href)
                }
            }}>{'share' in navigator ? 'Share Game' : 'Copy Link'}</button>   
        </div>
    </Modal>
    <Modal bind:modalShow={gameOverModal} bind:title={gameOverText} bind:description={gameOverDescription}>
        <div class="actions">
            <button on:click={() => {
                const message = `I just ${win
                    ? `won a game of Wordle Together in ${timer.getTime()}! Can you beat me?`
                    : 'lost a game of Wordle Together...'} \n${guessGrid.emojify()}`

                if ('share' in navigator) {
                    navigator.share({
                    title: 'Wordle Together',
                    text: message,
                    url: 'https://wordletogether.com'
                    })
                } else {
                    navigator.clipboard.writeText(message + '\nhttps://wordletogether.com')
                }
            }}>Share</button>
            <button on:click={() => { window.location.href = '/game/' }}>Play again</button>
        </div>
    </Modal>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        height: 99%;
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
