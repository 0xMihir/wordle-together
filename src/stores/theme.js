import { writable } from 'svelte/store'

const darkQuery = window.matchMedia('(prefers-color-scheme:dark)')

const isDark = writable(darkQuery.matches)

export default isDark

darkQuery.addEventListener('change', () => {
    if (darkQuery.matches) {
        isDark.set(true)
    } else {
        isDark.set(false)
    }
})
