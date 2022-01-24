import path from 'path'
import fs from 'fs'
import uws from 'uWebSockets.js'
import isbot from 'isbot'
import { serveDir } from 'uwebsocket-serve'
import { fileURLToPath } from 'url'
import {
    createRoom,
    roomExists,
    createPlayer,
    getRoom,
    validateWord,
    tryDeleteRoom,
    matchMake
} from './games.js'
import arrayCodes, { intCodes, wsCodes } from './statusCodes.js'
import dotenv from 'dotenv'
dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { App, DEDICATED_COMPRESSOR_3KB } = uws
const publicPath = path.resolve(__dirname, 'public')
const serveStatic = serveDir(publicPath)
const gameHTML = fs.readFileSync(path.resolve(__dirname, 'public/game.html'), 'utf8')
const indexHTML = fs.readFileSync(path.resolve(__dirname, 'public/index.html'), 'utf8')
const serviceWorker = fs.readFileSync(path.resolve(__dirname, 'public/build/sw.js'), 'utf8')
const baseURL = process.env.BASE_URL || 'http://localhost:8080/game/'
const redirectGame = (res, req) => {
    if (!isbot(req.getHeader('user-agent'))) {
        res.writeStatus('307').writeHeader('Location', baseURL + createRoom()).end()
    } else {
        res.writeStatus('200').writeHeader('Content-Type', 'text/html; charset=UTF-8').end(gameHTML)
    }
}
const port = parseInt(process.env.PORT) || 8080
const textEncoder = new TextEncoder()

App()
    .get('/', (res, req) => res.writeStatus('200')
        .writeHeader('Content-Type', 'text/html; charset=UTF-8').end(indexHTML))
    .get('/game', redirectGame)
    .get('/game/', redirectGame)
    .get('/build/sw.js', (res, req) => res.writeStatus('200')
        .writeHeader('Content-Type', 'text/javascript; charset=UTF-8')
        .writeHeader('Service-Worker-Allowed', '/')
        .end(serviceWorker))
    .get('/*', serveStatic) // look into caching entire public folder,
    .get('/game/:room', (res, req) => { // possibly create separate assets folder
        res.onAborted(() => {
            console.log('aborted')
        })
        const room = req.getParameter(0)
        if (!roomExists(room) || !room) {
            redirectGame(res, req)
        } else {
            res.writeStatus('200')
                .writeHeader('Content-Type', 'text/html; charset=UTF-8').end(gameHTML)
        }
    })
    .ws('/game/:room', {

        /* There are many common helper features */
        idleTimeout: 32,
        maxBackpressure: 1024,
        maxPayloadLength: 512,
        compression: DEDICATED_COMPRESSOR_3KB,

        /* For brevity we skip the other events (upgrade, open, ping, pong, close) */
        message: (ws, message, isBinary) => {
            const room = getRoom(ws.room)
            if (message.byteLength === 1) {
                const dataArray = new Int8Array(message)
                const code = dataArray[0]
                switch (code) {
                    case intCodes.matchMake: {
                        const match = matchMake()
                        if (match) {
                            ws.send(textEncoder.encode(match), true)
                        } else {
                            if (room.players !== 2) {
                                room.matchMake = true
                            }
                        }
                        break
                    }
                }
            } else
            if (!room) {
                ws.end(wsCodes.roomNotFound)
            } else if (Object.keys(room.players).length < 2) {
                return ws.send(arrayCodes.roomNotFilled, true)
            } else {
                const player = room.players[ws.id]
                if (message.byteLength === 5) {
                    if (!validateWord(message)) {
                        ws.send(arrayCodes.notInList, true)
                    } else {
                        const messageArray = new Uint8Array(message)
                        const returnArray = [0, 0, 0, 0, 0]
                        const testCounts = {}
                        player.guessCount++
                        messageArray.forEach((letter, i) => {
                            if (!testCounts[letter]) { testCounts[letter] = 0 }
                            if (letter < 65 || letter > 122) {
                                ws.send(arrayCodes.invalidWord, true)
                                return
                            } if (room.word[i] === letter) {
                                returnArray[i] = 2 // Green
                                testCounts[letter] = testCounts[letter] += 1
                            }
                        })
                        messageArray.forEach((letter, i) => {
                            if (returnArray[i] === 0 && testCounts[letter] < room.letterCounts[letter]) {
                                returnArray[i] = 1 // Yellow
                                testCounts[letter] = testCounts[letter] += 1
                            }
                        })
                        // console.log(player, Int8Array.from(returnArray))
                        if (returnArray.every(color => color === 2)) {
                        // disconnect all players
                            delete player.ws
                            ws.end(wsCodes.win)
                            Object.values(room.players).forEach(player => {
                                player.ws?.end(wsCodes.lost, room.word)
                            })
                        } else {
                            if (player.guessCount === 6) {
                                ws.send(Int8Array.of(...messageArray, ...returnArray), true)
                                delete player.ws
                                ws.end(wsCodes.lost, room.word)
                                // send win to everyone
                                Object.values(room.players).forEach(player => {
                                    player.ws?.send(Int8Array.from(returnArray), true)
                                    player.ws?.end(wsCodes.win, room.word)
                                })
                            } else {
                            // send guess to everyone
                                Object.keys(room.players).forEach(id => {
                                    if (id !== ws.id) {
                                        room.players[id].ws?.send(Int8Array.from(returnArray), true)
                                    } else {
                                        // will need to see if 10 byte message is better or worse
                                        // than many promise approach
                                        ws.send(Int8Array.of(...messageArray, ...returnArray), true)
                                    }
                                })
                            }
                        }
                    }
                }
            }
        },

        upgrade: (res, req, ctx) => {
            res.onAborted(() => {
                console.log('aborted')
            })
            const room = req.getParameter(0)

            if (!room || !roomExists(room)) {
                res.writeStatus('400').end('invalidRoom')
            } else {
                res.upgrade(
                    { room: room, id: createPlayer(room) },
                    req.getHeader('sec-websocket-key'),
                    req.getHeader('sec-websocket-protocol'),
                    req.getHeader('sec-websocket-extensions'),
                    ctx
                )
            }
        },
        open: (ws) => {
            const room = getRoom(ws.room)
            const players = room.players
            if (Object.keys(players).length > 2) {
                return ws.end(wsCodes.roomFull)
            }

            players[ws.id].ws = ws

            if (Object.keys(players).length === 2) {
                room.matchMake = false
                Object.values(players).forEach(player => {
                    player?.ws.send(arrayCodes.roomReady, true)
                })
            }
        },

        close: (ws, code, message) => {
            const room = getRoom(ws.room)
            // if (!wsCodeList.includes(code)) {
            if (code === 1001) {
                Object.keys(room.players).forEach(id => {
                    if (id !== ws.id) { room.players[id].ws?.end(wsCodes.winLastPlayer, room.word) }
                })
            }
            // }
            delete room.players[ws.id]

            setTimeout(() => {
                tryDeleteRoom(ws.room)
            }, 1000)
        }

    }).listen(port, () => {
        console.log('Listening on port ' + port)
    })
