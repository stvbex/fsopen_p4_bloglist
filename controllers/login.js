const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')
require('express-async-errors')

loginRouter.post('/', async (req, res) => {
    const user = await User.findOne({ username: req.body.username })

    const passwordCorrect = user
        ? await bcrypt.compare(req.body.password, user.password)
        : false

    if (!user || !passwordCorrect) {
        return res
            .status(401)
            .json({
                error: 'invalid username or password'
            })
    }

    // if all ok, generate token
    const tokenData = {
        // username: user.username,
        id: user._id
    }
    
    const token = jwt.sign(tokenData, process.env.SECRET)

    res
        .status(200)
        .send({
            token,
            // username: user.username,
            // name: user.name
        })
})

module.exports = loginRouter