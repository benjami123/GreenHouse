//Loading modules
const execFile = require('child_process').execFile;
var http = require('http');
var fs = require('fs');
var path = require('path');

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

    // Uncoment if you want to add css to your web page
     
   
    
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
		io.emit('sensorData', dataJSON);
		});
		const LightSensor = execFile('./LightSensor', (error, stdout, stderr) => {
			if(error) {
				console.error('stderr', stderr);
				throw error;
			}
			io.emit("LightSensor",stdout);
		});
	});
	//Heater
	socket.on('Heater',function(data){
	 var state = data;
		/*const heater = execFile('./Heater', (error, stdout, stderr) => {
			if(error) {
				console.error('stderr', stderr);
				throw error;
			}*/
			
			console.log("heater state change = "+state);
		//});
	});
	socket.on('Light',function(data){
		const Light = execFile('./Light',[parseInt(data)],(error, stdout, stderr) => {
			if(error) {
				console.error('stderr', stderr);
				throw error;
			}
			/*console.log("light= "+data+"%");*/
		});
	});
	socket.on('Servo',function(data){
		/*const heater = execFile('./Light', (error, stdout, stderr) => {
			if(error) {
				console.error('stderr', stderr);
				throw error;
			}*/
			console.log("Servo= "+data);
		//});
	});
	
});


// Displaying a console message for user feedback
server.listen(console.log("Server Running ..."));
