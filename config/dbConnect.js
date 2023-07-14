const mongoose = require('mongoose')

const dbConnect = () => {
    try {
        const connection = mongoose.connect(process.env.MONGODB_URL)
        console.log("Database Connected Successfully")
    } catch (err) {
        console.log("Database error")
    }
}

module.exports = dbConnect