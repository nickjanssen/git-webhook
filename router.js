var http = require('http')
var createHandler = require('github-webhook-handler')
var handler = createHandler(require('./config.json'))
var execFile = require('child_process').execFile;
var spawn = require('child_process').spawn;

http.createServer(function (req, res) {
	handler(req, res, function (err) {
		res.statusCode = 404
		res.end('no such location')
	})
}).listen(8080)

handler.on('error', function (err) {
	console.error('Error:', err.message)
})

handler.on('*', function (event) {

	console.log('Received a push event for %s to %s',
		event.payload.repository.name,
		event.payload.ref)

	var env = event.payload.ref.substr(11);

    var child = spawn('./hooks/' + env + '/' + event.payload.repository.name + '.sh');

    child.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
    });

    child.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
    });

    child.on('close', function (code) {
            console.log('child process exited with code ' + code);
    });

})

handler.on('issues', function (event) {
  console.log('Received an issue event for % action=%s: #%d %s',
    event.payload.repository.name,
    event.payload.action,
    event.payload.issue.number,
    event.payload.issue.title)
})
