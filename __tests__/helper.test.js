const listHelper = require('../utils/list_helper')
const helper = require('./test_helper')


test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
})

describe('total likes', () => {
    test('of empty list to be 0', () => {
        expect(listHelper.totalLikes([])).toBe(0)
    })

    test('of one blog to be that blog\'s likes', () => {
        const result = listHelper.totalLikes(helper.listWithOneBlog)

        expect(result).toBe(5)
    })

    test('of a bigger list is calculated right', () => {
        const result = listHelper.totalLikes(helper.listWithManyBlogs)

        expect(result).toBe(7+5+12+10+2)
    })
})

describe('favoriteBlog', () => {
    test('of an empty list should be null', () => {
        const result = listHelper.favoriteBlog([])

        expect(result).toBe(null)
    })

    test('of one blog should be that blog', () => {
        const result = listHelper.favoriteBlog(helper.listWithOneBlog)
        const expected = {
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            likes: 5
        }

        expect(result).toEqual(expected)
    })

    test('of many blogs should be the blog with most likes', () => {
        const result = listHelper.favoriteBlog(helper.listWithManyBlogs)
        const expected = {
            title: 'Canonical string reduction',
            author: 'Edsger W. Dijkstra',
            likes: 12
        }

        expect(result).toEqual(expected)
    })
})
