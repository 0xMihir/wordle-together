export const mapColor = (color) => {
    switch (color) {
        case 'gray':
            return 'var(--bg-incorrect)'
        case 'green':
            return 'var(--bg-correct)'
        case 'yellow':
            return 'var(--bg-misplaced)'
    }
}
