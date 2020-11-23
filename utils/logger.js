const info = (...data) => {
    console.log(...data)
}

const error = (...data) => {
    console.error(...data)
}

module.exports = {
    info,
    error
}