var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
const nocache = require('nocache')

var indexRouter = require('./routes');
const tasksRouter = require('./routes/tasks')
const linesRouter = require('./routes/lines')
const cartsRouter = require('./routes/carts')
const logsRouter = require('./routes/logs')
const taskInstructionsRouter = require('./routes/taskInstructions')
const settingsRouter = require('./routes/settings')
const workerGroupsRouter = require('./routes/workerGroups')
const workersRouter = require('./routes/workers')
const workingInfoRouter = require('./routes/workingInfo')

var app = express();


app.use(cors())
app.use(nocache())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/workerGroups', workerGroupsRouter);
app.use('/workingInfo', workingInfoRouter);
app.use('/taskInstructions', taskInstructionsRouter);
app.use('/tasks', tasksRouter)
app.use('/lines', linesRouter)
app.use('/carts', cartsRouter)
app.use('/logs', logsRouter)
app.use('/settings', settingsRouter)
app.use('/workers', workersRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
/*const server = app.listen(process.env.PORT || 5000, () => {
  const port = server.address().port;
  console.log(`Express is working on port ${port}`);
});*/
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
