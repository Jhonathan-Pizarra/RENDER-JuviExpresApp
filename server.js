const express = require('express');
const app = express();
const http = require('http');
const morgan = require('morgan');
const server = http.createServer(app);

const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const multer = require('multer');
const io = require('socket.io')(server);

const ordersSocket = require('./sockets/ordersSocket');
const userRoutes = require('./routes/userRoutes');
const categoriesRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const addressRoutes = require('./routes/addressRoutes');
const ordersRoutes = require('./routes/orderRoutes');

const port = process.env.PORT || 10000;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.disable('x-powered-by');
app.set('port', port);

ordersSocket(io);

const upload = multer({
    storage: multer.memoryStorage()
});

userRoutes(app, upload);
categoriesRoutes(app);
productRoutes(app, upload);
addressRoutes(app);
ordersRoutes(app, upload);

server.listen(port, '0.0.0.0', function(){
    console.log(`Aplicación JuviExpress Backend ${process.pid} iniciada en el puerto ${port}`);
});

app.get('/', (req, res) => {
    res.send('JuviExpress');
});

app.get('/test', (req, res) => {
    res.send('JuviExpress-Test');
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send(err.stack);
});

module.exports = { app, server };
