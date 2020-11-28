const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
require('express-async-errors')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const newBlogData = request.body

    // If likes are missing, default to 0
    if (!newBlogData.likes) {
        newBlogData.likes = 0
    }

    // Ensure title & author are not missing
    if (newBlogData.title && newBlogData.author) {
        const newBlog = await Blog.create(newBlogData)
        response.status(201).json(newBlog)
    }
    else {
        response.status(400).end()
    }
})

module.exports = blogsRouter