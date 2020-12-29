const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
require('express-async-errors')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', {
      username: 1,
      name: 1,
      id: 1
    })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const token = request.token

  if (!token) {
    return response.status(401).json({
      error: 'token missing'
    })
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  }
  catch (error) {
    return response.status(401).json({
      error: 'token invalid'
    })
  }

  const creator = await User.findById(decodedToken.id)
  if (!creator) {
    return response.status(401).json({
      error: 'token invalid'
    })
  }

  const body = request.body
  const newBlogData = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: creator._id
  }

  // If likes are missing, default to 0
  if (!newBlogData.likes) {
    newBlogData.likes = 0
  }

  // Ensure title & author are not missing
  if (newBlogData.title && newBlogData.author) {
    let createdBlog = await Blog
      .create(newBlogData)

    createdBlog = await createdBlog
      .populate('user', {
        username: 1,
        name: 1,
        id: 1
      })
      .execPopulate()

    creator.blogs = creator.blogs.concat(createdBlog._id)
    await creator.save()

    response.status(201).json(createdBlog)
  }
  else {
    response.status(400).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const newBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog = await Blog
    .findByIdAndUpdate(
      request.params.id,
      newBlog,
      { new: true }
    )
    .populate('user', {
      username: 1,
      name: 1,
      id: 1
    })

  response.json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const token = request.token

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  }
  catch (error) {
    return response.status(401).json({
      error: 'token invalid'
    })
  }

  const blogToDelete = await Blog.findById(request.params.id)

  // If logged in user is not the creator --> unauthorized
  if (decodedToken.id !== blogToDelete.user.toString()) {
    return response.status(401).end()
  }

  // Delete blog
  await Blog.findByIdAndDelete(request.params.id)

  // Delete from user's blogs
  const creator = await User.findById(decodedToken.id)
  creator.blogs = creator.blogs.filter(blogId => blogId !== request.params.id)
  await creator.save()

  response.status(204).end()
})

blogsRouter.post('/:id/comments', async (req, res) => {
  const token = req.token

  // Verify authorization token
  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  }
  catch (error) {
    return res.status(401).json({
      error: 'token invalid'
    })
  }

  // Check that user exists
  const userFound = await User.findById(decodedToken.id)
  if (!userFound) {
    return res.status(401).end()
  }

  const blog = await Blog.findById(req.params.id)
  blog.comments = blog.comments.concat(req.body.comment)

  const savedBlog = await blog.save()
  res.json(savedBlog)
})

module.exports = blogsRouter