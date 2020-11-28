const info = (...data) => {
    if (process.env.NODE_ENV !== 'test'){
        console.log(...data)
    }
}

const error = (...data) => {
    console.error(...data)
}

module.exports = {
    info,
    error
}