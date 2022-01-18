import { codes, wsCodes } from '../statusCodes'

class wsHandler {
    constructor (url, cb) {
        this.url = url
        this.cb = cb
        try {
            this.ws = new WebSocket(url)
        } catch (error) {
            // cb(new Error('wsConnFailure'), null)
            window.location.href = '/game'
        }
        this.textEncoder = new TextEncoder()
        this.textDecoder = new TextDecoder()
        this.ws.binaryType = 'arraybuffer'
        this.ws.addEventListener('open', () => {
            console.log('connected')
        })
        this.sendWordPromise = null
        this.ws.addEventListener('message', (event) => {
            const data = event.data
            if (data instanceof ArrayBuffer) {
                const dataArray = new Int8Array(data)
                if (data.byteLength === 1) {
                    const code = dataArray[0]
                    switch (code) {
                    case codes.roomNotFilled:
                        cb(new Error('roomNotFilled'), null)
                        break
                    case codes.invalidWord:
                        cb(new Error('invalidWord'), null)
                        break
                    case codes.notInList:
                        cb(new Error('notInList'), null)
                        break
                    case codes.win:
                        cb(null, { event: 'gameOver', win: true })
                        break
                    case codes.roomReady:
                        cb(null, { event: 'gameStart' })
                        break
                    default:
                        break
                    }
                } else if (data.byteLength === 10) {
                    const colorArray = Array.from(dataArray.slice(5)).map(color => color === 0 ? 'var(--bg-incorrect)' : color === 1 ? 'var(--bg-misplaced)' : 'var(--bg-correct)')
                    const word = this.textDecoder.decode(dataArray.slice(0, 5))
                    const colorMap = word.split('').reduce((acc, letter, i) => {
                        if (!acc[letter]) { acc[letter] = colorArray[i] }
                        return acc
                    }, {})
                    cb(null, { event: 'guess', colorArray, colorMap, player: 0 })
                } else if (data.byteLength === 5) {
                    const colorArray = Array.from(dataArray).map(color => color === 0 ? 'var(--bg-incorrect)' : color === 1 ? 'var(--bg-misplaced)' : 'var(--bg-correct)')
                    cb(null, { event: 'guess', colorArray, player: 1 })
                }
            }
        })
        this.ws.addEventListener('close', (event) => {
            const code = event.code
            switch (code) {
            case wsCodes.roomNotFound:
                console.log('room not found')
                break
            case wsCodes.roomFull:
                console.log('room full')
                break
            case wsCodes.win:
                cb(null, { event: 'guess', colorArray: Array(5).fill('var(--bg-correct)'), player: 0 })
                cb(null, { event: 'gameOver', win: true })
                console.log('win')
                break
            case wsCodes.winLastPlayer:
                cb(null, { event: 'gameOver', win: true })
                console.log('win last player')
                break
            case wsCodes.lost:
                cb(null, { event: 'guess', colorArray: Array(5).fill('var(--bg-correct)'), player: 1 })
                cb(null, { event: 'gameOver', win: false })
                console.log('lost')
                break
            default:
                break
            }
        })
    }

    sendWord (word) {
        const wordBuffer = this.textEncoder.encode(word)
        this.ws.send(wordBuffer)
    }
}

export default wsHandler
