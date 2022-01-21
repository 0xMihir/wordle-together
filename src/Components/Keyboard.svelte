<script>    
    import colorList from '../stores/stores.js'
    import { createEventDispatcher } from 'svelte'
    
    const keyboard = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'bksp']
    ]
    const dispatch = createEventDispatcher()
</script>

<div class="keyboard">
    {#each keyboard as row}
        <div class="keyboard-row">
            {#each row as letter}
                {#if letter === 'enter'}
                    <button
                        class="keyboard-enter key"
                        name="enter"
                        on:click={() => dispatch('enter')}
                    >
                        {letter}
                    </button>
                {:else if letter === 'bksp'}
                    <button
                        class="keyboard-backspace key"
                        aria-label="backspace"
                        on:click={() => dispatch('backspace')}
                    >
                    <span class="material-icons-outlined">
                        backspace
                        </span>
                    </button>
                {:else}
                <!-- ($isDark ? "#60686c" : "#dbdbdb") -->
                    <button
                        class="keyboard-letter key"
                        name="{letter}"
                        style="{$colorList[letter] ? `background-color: ${$colorList[letter]};` : ""}  { $colorList[letter] ? "color: #fff;" : "" }"
                        on:click={() => dispatch('key', letter)}
                    >
                        {letter}
                    </button>
                {/if}
            {/each}
        </div>
    {/each}
</div>

<style>
    .keyboard {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .keyboard-row {
        display: flex;
        flex-direction: row;
        gap: 3px;
        align-items: center;
        justify-content: center;
    }
    .key {
        text-align: center;
        background-color: #dbdbdb;
        border-radius: 8px;
        margin: 0;
        flex-grow: 1;
        padding: 0;
        font-weight: bold;
        user-select: none;
        text-transform: uppercase;
        color: inherit;
    }
    @media (prefers-color-scheme: dark) {
        .key {
            background-color: gray;
        }
    }
    @media (min-width: 900px) {
        .key {
            height: 64px;
            line-height: 64px;

            max-width: 48px;
        }
    }
    @media (max-width: 900px) {
        .key {
            height: 48px;
            line-height: 48px;
            max-width: 32px;
        }
    }
    @media (max-width: 350px) {
        .key {
            font-size: 8pt;
        }
    }
    .key:hover {
        filter: brightness(0.9);
    }
    .key:active {
        filter: brightness(0.7);
    }
    .key {
        border: 0;
    }
    .keyboard-enter,
    .keyboard-backspace {
        max-width: 60px;
    }

    .keyboard-backspace {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
