const express = require('express')
const handlebars = require('express-handlebars')
const { Server } = require('socket.io')

const viewsRouter = require('./routes/views.router')

const app = express()

// configurar handlebars
app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')

app.use(express.static(`${__dirname}/../public`))

// permitir envío de información mediante formularios y JSON
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use('/', viewsRouter)

const httpServer = app.listen(8080, () => {
    console.log('Servidor listo!')
})

const io = new Server(httpServer)

const messagesHistory = []

io.on('connection', (clientSocket) => {
    console.log(`Nuevo cliente conectado => ${clientSocket.id}`)

    // enviarle todos los mensajes hasta ese momento
    for (const data of messagesHistory) {
        clientSocket.emit('message', data)
    }

    
    clientSocket.on('message', (data) => {
        messagesHistory.push(data)
        
        io.emit('message', data)
    })
    
    clientSocket.on('user-connected', (username) => {
        // notificar a los otros usuarios que se conectó!
        clientSocket.broadcast.emit('user-joined-chat', username)
    })

})