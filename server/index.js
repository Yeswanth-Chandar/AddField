const http = require('http').createServer();
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://yeswanth:yeswanth@cluster0.0syeeew.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const Message = mongoose.model('Message', {
    text: String,
    created_at: { type: Date, default: Date.now }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Retrieve chat history from the database and send to the client
    Message.find().sort({ created_at: -1 }).limit(10).exec((err, messages) => {
        if (err) {
            console.error(err);
            return;
        }
        messages.reverse().forEach((message) => {
            socket.emit('message', message.text);
        });
    });

    // Receive message from the client and store in the database
    socket.on('message', (message) => {
        console.log(message);
        const newMessage = new Message({ text: message });
        newMessage.save((err) => {
            if (err) {
                console.error(err);
                return;
            }
            io.emit('message', message);
        });
    });
});

http.listen(443, () => {
    console.log('listening on http://localhost:8080');
});


