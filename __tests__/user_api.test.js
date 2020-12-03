const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)
jest.setTimeout(30000)

beforeEach(async () => {
    await User.deleteMany({})

    await User.create({
        username: 'tester',
        password: 'oebfoq'
    })
})

describe('user creation', () => {
    test('succeeds if a valid user is added', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUserData = {
            username: 'newTester',
            password: 'oebfoq'
        }

        await api
            .post('/api/users')
            .send(newUserData)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd.length).toEqual(
            usersAtStart.length + 1
        )

        const userNamesAtEnd = usersAtEnd.map(u => u.username)
        expect(userNamesAtEnd).toContain('newTester')
    })

    test('fails with status code 400 if no password is given', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUserData = {
            username: 'newTester',
        }

        const res = await api
            .post('/api/users')
            .send(newUserData)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(res.body.error).toEqual('password should be at least 3 characters long')

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd.length).toEqual(usersAtStart.length)
    })

    test('fails with status code 400 if no username is given', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUserData = {
            password: 'oebfoq'
        }

        const res = await api
            .post('/api/users')
            .send(newUserData)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(res.body.error).toEqual(
            'User validation failed: username: Path `username` is required.'
        )

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd.length).toEqual(usersAtStart.length)
    })

    test('fails with status code 400 if an invalid password is given', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUserData = {
            username: 'newTester',
            password: 'oe'
        }

        const res = await api
            .post('/api/users')
            .send(newUserData)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(res.body.error).toEqual('password should be at least 3 characters long')
        
        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd.length).toEqual(usersAtStart.length)
    })

    test('fails with status code 400 if an invalid username is given', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUserData = {
            username: 'ne',
            password: 'oefwefe22'
        }

        const res = await api
            .post('/api/users')
            .send(newUserData)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(res.body.error).toEqual(
            'User validation failed: username: Path `username` (`ne`) is shorter than the minimum allowed length (3).'
        )

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd.length).toEqual(usersAtStart.length)
    })

    test('fails with status code 400 if the same username is given', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUserData = {
            username: 'tester',
            password: 'oefwefe22'
        }

        const res = await api
            .post('/api/users')
            .send(newUserData)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(res.body.error).toEqual(
            'User validation failed: username: Error, expected `username` to be unique. Value: `tester`'
        )

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd.length).toEqual(usersAtStart.length)
    })

})

afterAll(() => {
    mongoose.connection.close()
})