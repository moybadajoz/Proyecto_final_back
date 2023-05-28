const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express()

//Capture the body
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

//db connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('DB Connected'))
  .catch((error) => console.log('Error: ' + error))

// Creacion e importacion de rutas
//const NoteRoutes = require('./routes/note')
const Login = require('./routes/login')
const UserRoutes = require('./routes/user')

// Ruta del middleware
app.use('/user', UserRoutes)
app.use('/login', Login)
//app.use('/note', NoteRoutes)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Server on port: ${PORT}`)
})