import path from 'path'
import fs from 'fs'
import uws from 'uWebSockets.js'
import { serveDir } from 'uwebsocket-serve'
import { fileURLToPath } from 'url'
import { createRoom, roomExists, createPlayer, getRoom, validateWord, tryDeleteRoom } from './utils.js'
import codes, { wsCodes } from './statusCodes.js'
import dotenv from 'dotenv'
dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { App, DEDICATED_COMPRESSOR_3KB } = uws
const publicPath = path.resolve(__dirname, 'public')
const serveStatic = serveDir(publicPath)
const indexHTML = fs.readFileSync(path.resolve(__dirname, 'public/index.html'), 'utf8')

const baseURL = process.env.BASE_URL || 'http://localhost:8080/game/'
const redirectGame = (res) => {
    res.writeStatus('301').writeHeader('Location', baseURL + createRoom()).end()
}
App()
    .get('/', (res, req) => redirectGame(res))
    .get('/game', (res, req) => redirectGame(res))
    .get('/game/', (res, req) => redirectGame(res))
    .get('/*', serveStatic)
    .get('/game/:room', (res, req) => {
        res.onAborted(() => {
            console.log('aborted')
        })
        const room = req.getParameter(0)
        if (!roomExists(room) || !room) {
            redirectGame(res)
        } else {
            res.writeStatus('200').end(indexHTML)
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
            if (!room) { ws.end(wsCodes.roomNotFound) } else if (Object.keys(room.players).length < 2) { return ws.send(codes.roomNotFilled, true) } else {
                const player = room.players[ws.id]
                if (message.byteLength !== 5) {
                    ws.send(codes.invalidWord, true)
                } else if (!validateWord(message)) {
                    ws.send(codes.notInList, true)
                } else {
                    const messageArray = new Uint8Array(message)
                    const returnArray = [0, 0, 0, 0, 0]
                    const testCounts = {}
                    player.guessCount++
                    messageArray.forEach((letter, i) => {
                        if (!testCounts[letter]) { testCounts[letter] = 0 }
                        if (letter < 65 || letter > 122) {
                            ws.send(codes.invalidWord, true)
                            return
                        } if (room.word[i] === letter) {
                            returnArray[i] = 2 // Green
                            testCounts[letter] = testCounts[letter] += 1
                        }
                    })
                    messageArray.forEach((letter, i) => {
                        if (testCounts[letter] < room.letterCounts[letter]) {
                            returnArray[i] = 1 // Yellow
                            testCounts[letter] = testCounts[letter] += 1
                        }
                    })
                    console.log(player, Int8Array.from(returnArray))
                    if (returnArray.every(color => color === 2)) {
                        // disconnect all players
                        delete player.ws
                        ws.end(wsCodes.win)
                    } else {
                        if (player.guessCount === 6) {
                            delete player.ws
                            ws.send(Int8Array.from(returnArray), true)
                            ws.end(wsCodes.lost)
                            // send win to everyone
                            Object.values(room.players).forEach(player => {
                                player.ws?.end(wsCodes.win)
                            })
                        } else {
                            // send guess to everyone
                            Object.keys(room.players).forEach(id => {
                                if (id !== ws.id) {
                                    room.players[id].ws?.send(Int8Array.from(returnArray), true)
                                } else {
                                    ws.send(Int8Array.of(...messageArray, ...returnArray), true)
                                }
                            })
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
            const players = getRoom(ws.room).players
            players[ws.id].ws = ws
            if (Object.keys(players).length > 2) {
                ws.end(wsCodes.roomFull)
            } else if (Object.keys(players).length === 2) {
                Object.values(players).forEach(player => {
                    player?.ws.send(codes.roomReady, true)
                })
            }
        },

        close: (ws, code, message) => {
            const room = getRoom(ws.room)
            if (code === wsCodes.win) {
                Object.values(room.players).forEach(player => {
                    player.ws?.end(wsCodes.lost)
                })
            } else if (code === 1001) {
                Object.keys(room.players).forEach(id => {
                    if (id !== ws.id) { room.players[id].ws?.end(wsCodes.winLastPlayer) }
                })
            }
            delete room.players[ws.id]

            setTimeout(() => {
                tryDeleteRoom(ws.room)
            }, 1000)
        }

    }).listen(7777, () => {
        console.log('Listening on port 8080')
    })
