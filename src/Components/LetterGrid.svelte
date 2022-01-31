<script>
    import { mapColor } from '../utils.js'
    const letterGrid = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
    ]

    const colorGrid = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
    ]
    const shakeRows = [false, false, false, false, false, false]

    let rowSize
    let gridRow = 0
    let gridCol = 0

    export const handleBackspace = () => {
        if (gridCol > 0) {
            gridCol--
            letterGrid[gridRow][gridCol] = ''
        }
    }
    export const getWord = () => {
        return !letterGrid[gridRow].includes('')
            ? letterGrid[gridRow].join('')
            : ''
    }
    export const setLetter = (letter) => {
        if (gridCol < 5) {
            letterGrid[gridRow][gridCol] = letter.toLowerCase()
            gridCol++
        }
    }
    export const incrementRow = () => {
        if (gridRow < 6) {
            gridRow++
            gridCol = 0
        }
    }
    export const setColorRow = (color) => {
        colorGrid[gridRow] = color
    }

    export const shakeRow = () => {
        shakeRows[gridRow] = true
        setTimeout(() => {
            shakeRows[gridRow] = false
        }, 300)
    }
    export const emojify = () => {
        let string = ''
        for (let i = 0; i < 6; i++) {
            string += colorGrid[i].map((color) => {
                switch (color) {
                    case 'gray':
                        return '⬛'
                    case 'green':
                        return '🟩'
                    case 'yellow':
                        return '🟨'
                    default:
                        return '⬜'
                }
            }).join('')
            string += '\n'
        }
        return string
    }
    const isSafari = window.safari !== undefined
</script>

<div class="guess-grid">
    {#each letterGrid as row, i}
        <div class="guess-row {shakeRows[i] ? "shake-horizontal" : ""}" bind:clientHeight={rowSize}>
            {#each row as letter, j}
                <div class="guess-letter" style="{isSafari ? `width: ${rowSize - 3}px;` : ""} font-size:{
                        rowSize * 0.6
                    }px; {
                        colorGrid[i][j]
                        ? `color: #fff; border: none; background-color: ${mapColor(colorGrid[i][j])};`
                        : ''
                    }">
                    {#if letter}
                        <span>{letter}</span>
                    {:else}
                        <span>&nbsp;</span>
                    {/if}
                </div>
            {/each}
        </div>
    {/each}
</div>

<style>
    .guess-grid {
        display: flex;
        flex-direction: column;
        gap: 1vh;
        flex: 1;
        aspect-ratio: 5/6;
        max-width: 90%;
        user-select: none;
    }
   
    .guess-row {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        flex:1;
        gap: 1vh;
        
    }
    
    .guess-row.shake-horizontal > .guess-letter {
        border: 1.5px solid var(--color-error);
    }
    .guess-letter {
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        text-align: center;
        border-radius: 4px;
        text-transform: uppercase;
        min-width: 16px;
        min-height: 16px;
        flex:1;
        aspect-ratio: 1;
        border: 1.5px solid var(--color-border);
    }
</style>
