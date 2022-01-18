export default {
    roomNotFound: Int8Array.of(-1),
    invalidWord: Int8Array.of(-2),
    notInList: Int8Array.of(-3),
    roomFull: Int8Array.of(-4),
    roomNotFilled: Int8Array.of(-5),
    win: Int8Array.of(1),
    roomReady: Int8Array.of(2)
}

export const codes = {
    roomNotFound: -1,
    invalidWord: -2,
    notInList: -3,
    roomFull: -4,
    roomNotFilled: -5,
    win: 1,
    roomReady: 2
}

export const wsCodes = {
    roomNotFound: 4100,
    roomFull: 4101,
    win: 4000,
    winLastPlayer: 4001,
    lost: 4002
}
