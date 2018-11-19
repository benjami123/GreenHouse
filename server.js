//Loading modules
const execFile = require('child_process').execFile;
var http = require('http');
var fs = require('fs');
var path = require('path');
var isLogging = false;
var fileCurrentlyLogging  = '<none>';
var timer = 0;
var logRequest = 0;

var stream;

// Initialize the server on port 8888

var server = http.createServer(function (req, res) {
    // requesting files
    var file = '.'+((req.url=='/')?'/index.html':req.url);
    var fileExtension = path.extname(file);
    var contentType = 'text/html';
    // Uncoment if you want to add css to your web page
    if(fileExtension == '.css'){
        contentType = 'text/css';
    }
    fs.exists(file, function(exists){
        if(exists){
            fs.readFile(file, function(error, content){
                if(!error){
                    // Page found, write content
                    res.writeHead(200,{'content-type':contentType});
                    res.end(content);
                }
            });
        }
        else{
            // Page not found
            res.writeHead(404);
            res.end('Page not found');
        }
    });   
    
}).listen(8888);

// Loading socket io module.
// SEE KNOWHOW FILE TO LINK SOCKET.IO
var io = require('socket.io').listen(server);

// When communication is established
io.on('connection', function (socket) {
    socket.on('readSensor', function handleSensor() {
		//receive the data of the sensor by a C++ program
		const child = execFile('./Humidity', (error, stdout, stderr) => {
		if(error) {
			console.error('stderr', stderr);
			throw error;
		}
		//console.log(stdout);
		// Cut out temperature and humidity values from sensor output
		var posHumidity = stdout.indexOf("%");//Find the humidity
		var humi = stdout.slice(0, posHumidity+1);//Pick up the humidity data
		var posTemp = stdout.indexOf("°C");//Find the temperature
		var temp = stdout.slice(posHumidity + 1, posTemp + 2);//Pick up the temperature data
		// Create and send JSON object to browser
		var data = {temperature: temp, humidity: humi};
		var dataJSON = JSON.stringify(data);
		if(isLogging){
			if(timer % 3 == 0){
				var toLog = "T: " + parseFloat(temp).toFixed(2) + "\nH: " +  parseFloat(humi).toFixed(2) + "\n"
				stream.write(toLog);
				console.log("logging T & H");
			}
			timer++;
			if(timer >= 214748364){
				timer = 0;
			}
		}
		io.emit('sensorData', dataJSON);
		});
		const LightSensor = execFile('./LightSensor', (error, stdout, stderr) => {
			if(error) {
				console.error('stderr', stderr);
				throw error;
			}
			io.emit("LightSensor", stdout);
			if(isLogging){
				if(timer % 3 == 0){
					var toLog = "L: " + stdout + "%\n";
					stream.write(toLog);
					console.log("logging L");
				}
			}
			
		});
	});
	//Heater
	socket.on('Heater',function(data){
	 var state = data;
		const heater = execFile('./Heater', [data], (error, stdout, stderr) => {
			if(error) {
				console.error('stderr', stderr);
				throw error;
			}
			
			console.log("heater state changed = " + state);
		});
	});

	socket.on('Light', function(data){
		const Light = execFile('./Light', [parseInt(data)], (error, stdout, stderr) => {
			if(error) {
				console.error('stderr', stderr);
				throw error;
			}
			console.log("light= "+ data + "%");
		});
	});

	socket.on('Servo', function(data){
		const Servo = execFile('./Servo', [data], (error, stdout, stderr) => {
			if(error) {
				console.error('stderr', stderr);
				throw error;
			}
			console.log("Servo= " + data);
		});
	});

	socket.on('startLog', function(data){		
		if(isLogging){
			io.emit('startLogRes', "Logging on file " + fileCurrentlyLogging);
			return;
		}		
		fileCurrentlyLogging = './Log/' + data;
		//startLog();
		writeOnTheFile();
		io.emit('startLogRes',  "Start logging on file " + fileCurrentlyLogging);	
		isLogging = true;	
	});

	socket.on('stopLog', function(data){	
		if(isLogging){
			io.emit('stopLogRes', 'Stopped logging on ' + fileCurrentlyLogging);
			fileCurrentlyLogging = '<none>';
			isLogging = false;
			stream.end();
			return;
		}
		io.emit('stopLogRes', 'There is not logging in progress');
	});	

	
	
});

function writeOnTheFile(){
	var fst = require('fs');
	while (fst.existsSync((fileCurrentlyLogging + '.txt'))) {		
		fileControl();
	}
	while (fst.existsSync(fileCurrentlyLogging)) {		
		fileControl();
	}


	stream = fs.createWriteStream(fileCurrentlyLogging, {flags:'a'});
	var idRequst = '\n------- ' + logRequest + ' -------\n'
	stream.write(idRequst);
	logRequest++;
}

function fileControl(){
	let slashSeparated = fileCurrentlyLogging.split('/');
		let directoryPath = '';
		let lastPart;
		let numberPart
		let extension;
		let nameWithNoNumber;
		for (let index = 0; index < slashSeparated.length - 1; index++) {
			directoryPath = directoryPath + slashSeparated[index] + '/';			
		}
		let name = slashSeparated[slashSeparated.length - 1]; //take out only the file name
		let dotSeparated = name.split('.');
		console.log(dotSeparated);
		if(dotSeparated.length == 1){
			lastPart = dotSeparated[0];
			extension = '.txt';
			fileCurrentlyLogging = fileCurrentlyLogging + extension;
		}else if(dotSeparated.length > 1){
			lastPart = dotSeparated[dotSeparated.length - 2];
			extension = '.' + dotSeparated[dotSeparated.length - 1];
		}else {
			lastPart = 'Log_01';
			extension = '.txt';
		}
		let underScoreSeparated = lastPart.split('_');
		if(underScoreSeparated.length > 1){
			numberPart = underScoreSeparated[underScoreSeparated.length - 1];
		}		
		if(isNaN(numberPart)){
			lastPart = lastPart + '_01';
		}else{
			let indexNumber = lastPart.indexOf('numberPart');			
			nameWithNoNumber = lastPart.slice(0, indexNumber - 2);
			let numberId = parseInt(numberPart) + 1;
			if(numberId < 10){
				lastPart = nameWithNoNumber + '_0' + numberId;
			}else{
				lastPart = nameWithNoNumber + '_' + numberId;
			}
		}
		console.log('File name ' + fileCurrentlyLogging + ' already in use.');
		console.log('Updatatin file name ...');
		fileCurrentlyLogging = directoryPath + lastPart + extension;
		console.log('New file name: ' + fileCurrentlyLogging);
}

// Displaying a console message for user feedback
server.listen(console.log("Server Running ..."));