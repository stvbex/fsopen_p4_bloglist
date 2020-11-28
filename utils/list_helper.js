const dummy = (blogs) => {
    return 1
}

const totalLikes = blogs => {
    let likesSum = 0
    blogs.forEach(blog => {
        likesSum += blog.likes
    })

    return likesSum
}

const favoriteBlog = blogs => {
    const maxLikes = Math.max(...blogs.map(blog => blog.likes))

    // In case list of blogs is empty return null
    if (maxLikes === -Infinity) {
        return null
    }

    const maxLikesBlog = blogs.find(blog => blog.likes === maxLikes)

    const result = {
        title: maxLikesBlog.title,
        author: maxLikesBlog.author,
        likes: maxLikesBlog.likes
    }

    return result
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}