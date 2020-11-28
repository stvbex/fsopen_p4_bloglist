const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)
jest.setTimeout(30000)

beforeEach(async () => {
    await Blog.deleteMany({})

    const listOfPromises = helper.listWithManyBlogs.map(b => Blog.create(b))
    await Promise.all(listOfPromises)
})

describe('GET /api/blogs', () => {
    test('returns the correct amount of blogs', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    
        expect(response.body).toHaveLength(helper.listWithManyBlogs.length)
    })
})

test('unique identifier is named id', async () => {
    const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(response.body[0].id).toBeDefined()
})

test('a new blog post is successfully created', async () => {
    const newBlogPost = {
        title: 'New blogpost title here',
        author: 'Mememe von Mememeem',
        url: 'http://www.newblogpostpage.asd',
        likes: 3
    }
    
    const postResult = await api
        .post('/api/blogs')
        .send(newBlogPost)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    expect(postResult.body.title).toEqual(newBlogPost.title)
    expect(postResult.body.author).toEqual(newBlogPost.author)
    expect(postResult.body.url).toEqual(newBlogPost.url)
    expect(postResult.body.likes).toEqual(newBlogPost.likes)

    const blogPostsAtEnd = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(blogPostsAtEnd.body).toHaveLength(
        helper.listWithManyBlogs.length + 1
    )
})

test('likes default to 0', async () => {
    const newLikesMissingBlog = {
        title: 'New blogpost title here',
        author: 'Mememe von Mememeem',
        url: 'http://www.newblogpostpage.asd',
    }

    const postResult = await api
        .post('/api/blogs')
        .send(newLikesMissingBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    expect(postResult.body.likes).toBeDefined()
    expect(postResult.body.likes).toEqual(0)
})

describe('title and url are mandatory for a blog post', () => {
    test('title should not be missing', async () => {
        const newTitleMissingBlogPost = {
            author: 'Mememe von Mememeem',
            url: 'http://www.newblogpostpage.asd',
            likes: 3
        }

        await api
            .post('/api/blogs')
            .send(newTitleMissingBlogPost)
            .expect(400)
    })

    test('title should not be missing', async () => {
        const newAuthorMissingBlogPost = {
            title: 'New blogpost title here',
            url: 'http://www.newblogpostpage.asd',
            likes: 3
        }

        await api
            .post('/api/blogs')
            .send(newAuthorMissingBlogPost)
            .expect(400)
    })
})

afterAll(() => {
    mongoose.connection.close()
})