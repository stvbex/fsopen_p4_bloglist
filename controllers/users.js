const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
require('express-async-errors')

usersRouter.get('/', async (req, res) => {
    const users = await User
        .find({})
        .populate('blogs', {
            url: 1,
            title: 1,
            author: 1,
            id: 1
        })
    
    res.json(users)
})

usersRouter.post('/', async (req, res) => {
    const password = req.body.password

    // Password should be at least 3 characters long
    if (!password || password.length < 3) {
        res.status(400).json({
            error: 'password should be at least 3 characters long'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const newUserData = {
        username: req.body.username,
        name: req.body.name,
        password: passwordHash,
    }
    const createdUser = await User.create(newUserData)

    res
        .status(201)
        .json(createdUser)
})

usersRouter.delete('/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

module.exports = usersRouter