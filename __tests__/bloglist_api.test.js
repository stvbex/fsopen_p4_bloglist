const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)
jest.setTimeout(30000)

let testerToken
let nonTesterToken
let deletedUserToken

beforeAll(async () => {
    await User.deleteMany({})

    // Create tester
    const testerData = {
        username: 'tester',
        password: 'nq113ee'
    }

    await api
        .post('/api/users')
        .send(testerData)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const testerResponse = await api
        .post('/api/login')
        .send(testerData)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    testerToken = testerResponse.body.token

    // Create nonTester
    const nonTesterData = {
        username: 'nonTester',
        password: 'nq113edde'
    }

    await api
        .post('/api/users')
        .send(nonTesterData)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const nonTesterResponse = await api
        .post('/api/login')
        .send(nonTesterData)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    nonTesterToken = nonTesterResponse.body.token

    // Create and delete
    const deleteMeData = {
        username: 'deleteMe',
        password: '134252ee'
    }

    const deleteMeUserResponse = await api
        .post('/api/users')
        .send(deleteMeData)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const deleteMeLoginResponse = await api
        .post('/api/login')
        .send(deleteMeData)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    deletedUserToken = deleteMeLoginResponse.body.token

    await api
        .delete(`/api/users/${deleteMeUserResponse.body.id}`)
        .expect(204)
})

beforeEach(async () => {
    await Blog.deleteMany({})

    // Internal server error
    // suspect: creator.blogs = creator.blogs.concat(createdBlog._id)
    // concurrency issues
    // const listOfBlogs = helper.listWithManyBlogs.map(blog => 
    //     api.post('/api/blogs')
    //         .set('Authorization', 'bearer ' + testerToken)
    //         .send(blog)
    //         .expect(201)
    //         .expect('Content-Type', /application\/json/)
    // )
    // await Promise.all(listOfBlogs)

    // unhandled promise
    // helper.listWithManyBlogs.forEach(async blog => {
    //     await api.post('/api/blogs')
    //         .set('Authorization', 'bearer ' + testerToken)
    //         .send(blog)
    //         .expect(201)
    //         .expect('Content-Type', /application\/json/)
    // })

    for (i = 0; i < helper.listWithManyBlogs.length; i++) {
        await api.post('/api/blogs')
            .set('Authorization', 'bearer ' + testerToken)
            .send(helper.listWithManyBlogs[i])
            .expect(201)
            .expect('Content-Type', /application\/json/)
    }
})

describe('retrieving the blogs', () => {
    test('returns the correct amount of blogs', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toHaveLength(helper.listWithManyBlogs.length)
    })

    test('unique identifier should be named id', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    
        expect(response.body[0].id).toBeDefined()
    })
})


describe('creating a blog', () => {
    test('succeeds if blog is valid and user is authorized', async () => {
        const newBlogPost = {
            title: 'New blogpost title here',
            author: 'Mememe von Mememeem',
            url: 'http://www.newblogpostpage.asd',
            likes: 3
        }

        const postResult = await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + testerToken)
            .send(newBlogPost)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(postResult.body.title).toEqual(newBlogPost.title)
        expect(postResult.body.author).toEqual(newBlogPost.author)
        expect(postResult.body.url).toEqual(newBlogPost.url)
        expect(postResult.body.likes).toEqual(newBlogPost.likes)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(
            helper.listWithManyBlogs.length + 1
        )

        const blogTitles = (await blogsAtEnd).map(b => b.title)
        expect(blogTitles).toContain(newBlogPost.title)
    })

    test('fails with status code 401 if the user is unauthorized', async () => {
        const newBlogPost = {
            title: 'New blogpost title hereee',
            author: 'Mememe von Mememeem',
            url: 'http://www.newblogpostpage.asd',
            likes: 3
        }

        await api
            .post('/api/blogs')
            .send(newBlogPost)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length)

        const blogTitles = blogsAtEnd.map(b => b.title)
        expect(blogTitles).not.toContain(newBlogPost.title)
    })

    test('fails with status code 401 if the user token is invalid', async () => {
        const newBlogPost = {
            title: 'New blogpost title hereee',
            author: 'Mememe von Mememeem',
            url: 'http://www.newblogpostpage.asd',
            likes: 3
        }

        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + deletedUserToken)
            .send(newBlogPost)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.listWithManyBlogs.length)

        const blogTitles = blogsAtEnd.map(b => b.title)
        expect(blogTitles).not.toContain(newBlogPost.title)
    })

    test('without likes should result in a blog with 0 likes', async () => {
        const newLikesMissingBlog = {
            title: 'New blogpost title here',
            author: 'Mememe von Mememeem',
            url: 'http://www.newblogpostpage.asd',
        }

        const postResult = await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + testerToken)
            .send(newLikesMissingBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(postResult.body.likes).toBeDefined()
        expect(postResult.body.likes).toEqual(0)
    })

    test('fails with status code 400 if title is missing', async () => {
        const newTitleMissingBlogPost = {
            author: 'Mememe von Mememeem',
            url: 'http://www.newblogpostpage.asd',
            likes: 3
        }

        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + testerToken)
            .send(newTitleMissingBlogPost)
            .expect(400)
    })

    test('fails with status code 400 if author is missing', async () => {
        const newAuthorMissingBlogPost = {
            title: 'New blogpost title here',
            url: 'http://www.newblogpostpage.asd',
            likes: 3
        }

        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + testerToken)
            .send(newAuthorMissingBlogPost)
            .expect(400)
    })
})

describe('updating a blog', () => {
    test('succeeds with valid id and blog', async () => {
        const blogsAtStart = await helper.blogsInDb()

        const updId = blogsAtStart[0].id

        const newBlog = {
            title: 'sadffhiwhfoewofonweo',
            author: blogsAtStart[0].author,
            url: blogsAtStart[0].url,
            likes: 44222
        }

        const response = await api
            .put(`/api/blogs/${updId}`)
            .send(newBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.title).toEqual('sadffhiwhfoewofonweo')
        expect(response.body.likes).toEqual(44222)

        const blogsAtEnd = await helper.blogsInDb()
        
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
        
        const blogTitles = blogsAtEnd.map(b => b.title)
        expect(blogTitles).toContain(newBlog.title)
    })
})

describe('deleting a blog', () => {
    test('succeeds with status code 204 if deleted by it\'s creator', async () => {
        const blogsAtStart = await helper.blogsInDb()

        const delId = blogsAtStart[0].id
        const delTitle = blogsAtStart[0].title

        await api
            .delete(`/api/blogs/${delId}`)
            .set('Authorization', 'bearer ' + testerToken)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        // length was reduced
        expect(blogsAtEnd.length).toEqual(blogsAtStart.length - 1)

        // does not contain delTitle
        const titles = blogsAtEnd.map(b => b.title)
        expect(titles).not.toContain(delTitle)
    })

    test('fails with status code 400 if id is invalid', async () => {
        const blogsAtStart = await helper.blogsInDb()

        await api
            .delete('/api/blogs/134q9e9d99')
            .set('Authorization', 'bearer ' + testerToken)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd.length).toEqual(blogsAtStart.length)

    })

    // fails with 400 if id valid (well-formed) but does not exist ???

    test('fails with status code 401 if it is not deleted by it\'s creator', async () => {
        const blogsAtStart = await helper.blogsInDb()

        const delId = blogsAtStart[0].id
        const delTitle = blogsAtStart[0].title

        await api
            .delete(`/api/blogs/${delId}`)
            .set('Authorization', 'bearer ' + nonTesterToken)
            .expect(401)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd.length).toEqual(blogsAtStart.length)

        // contains delTitle
        const titles = blogsAtEnd.map(b => b.title)
        expect(titles).toContain(delTitle)
    })

    test('fails with status code 401 if invalid token', async () => {
        const blogsAtStart = await helper.blogsInDb()

        const delId = blogsAtStart[0].id
        const delTitle = blogsAtStart[0].title

        await api
            .delete(`/api/blogs/${delId}`)
            .set('Authorization', 'bearer ' + deletedUserToken)
            .expect(401)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd.length).toEqual(blogsAtStart.length)

        // contains delTitle
        const titles = blogsAtEnd.map(b => b.title)
        expect(titles).toContain(delTitle)
    })

    test('fails with status code 401 if there is no token', async () => {
        const blogsAtStart = await helper.blogsInDb()

        const delId = blogsAtStart[0].id
        const delTitle = blogsAtStart[0].title

        await api
            .delete(`/api/blogs/${delId}`)
            .expect(401)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd.length).toEqual(blogsAtStart.length)

        // contains delTitle
        const titles = blogsAtEnd.map(b => b.title)
        expect(titles).toContain(delTitle)
    })

    
})

afterAll(() => {
    mongoose.connection.close()
})