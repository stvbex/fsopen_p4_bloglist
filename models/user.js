const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        unique: true
    },
    password: String,
    name: String,
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ]
})

userSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        ret.id = ret._id.toString(),
        delete ret._id
        delete ret.__v

        // Should not show password
        delete ret.password
    }
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)