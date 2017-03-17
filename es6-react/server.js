var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var swig  = require('swig');
var React = require('react');
var Router = require('react-router');
var routes = require('./public/app/routes');
var config = require('./config');

var app = express();

mongoose.connect(config.database);
mongoose.connection.on('error', function() {
    console.info('连接数据库失败. Did you forget to run `mongod`?');
});


app.set('port', process.env.PORT || 8899);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'))); //设置存放视图文件或者说模版文件的目录
app.use(function(req, res) {
	Router.run(routes, req.path, function(Handler) { // 启动路由
	    var html = React.renderToString(React.createElement(Handler));
	    var page = swig.renderFile('views/index.html', { html: html });
	    res.send(page);
	});
});

/**
 * Socket.io stuff.
 */
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var onlineUsers = 0;

io.sockets.on('connection',function (socket) {
    onlineUsers++;
    io.sockets.emit('onlineUsers',{onlineUsers: onlineUsers});
    
    socket.on('disconnect',function () {
        onlineUsers--;
        io.sockets.emit('onlineUsers',{onlineUsers: onlineUsers});
    });
});

server.listen(app.get('port'), function() {
	console.log('++++++++++++++++++++++++++++++++++node服务已经启动+++++++++++++++++++++++++++++' + app.get('port'));
});