import { nanoid } from 'nanoid'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const wordList = fs.readFileSync(path.resolve(__dirname, 'wordlist.txt'), 'utf8').split('\n')

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
const rooms = {}

export const createRoom = () => {
    const id = nanoid()
    const word = textEncoder.encode(wordList[Math.floor(Math.random() * wordList.length)])
    const letterCounts = {}
    word.forEach(letter => {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1
    })
    rooms[id] = {
        word: word,
        players: {},
        letterCounts: letterCounts,
        matchMake: false
    }
    return id
}

export const matchMake = () => {
    const keys = Object.keys(rooms)
    for (let i = 0; i < keys.length; i++) {
        const room = rooms[keys[i]]
        if (room.matchMake) {
            return keys[i]
        }
    }
    return null
}

export const getRoom = (id) => {
    return rooms[id]
}

export const roomExists = (id) => {
    return rooms[id] !== undefined
}

export const createPlayer = (room) => {
    if (!roomExists(room)) { return false } else {
        const id = nanoid()
        rooms[room].players[id] = {
            guessCount: 0
        }
        return id
    }
}

export const validateWord = (array) => {
    return wordList.includes(textDecoder.decode(array))
}

export const tryDeleteRoom = (id) => {
    if (roomExists(id) && Object.keys(rooms[id].players).length === 0) {
        delete rooms[id]
        return true
    }
    return false
}

export const getRoomCount = () => {
    return Object.keys(rooms).length
}
