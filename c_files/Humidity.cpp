//============================================================================
// Name        : Humidity.cpp
// Author      : Markus Enqvist and Benjamin DRAN
// Version     : 1
// Description : Humidity and temperature sensor (HIH8120 module) in C++, Ansi-style
//============================================================================

#include <iostream>
#include "I2CDevice.cpp"
using namespace std;
using namespace exploringBB;

class I2CDriver{
	unsigned int bus = 2;
	unsigned int address = 0x27;
	int *verif = new int[1];
	I2CDevice* I2c = new I2CDevice(bus,address,verif);
public:
	bool close()//function close
	{
		I2c->close();
		return 1;
	}
	int getVerif()
	{
		return *verif;
	}
	unsigned char* read()
	{
		unsigned char* data = new unsigned char[4];
		data = I2c->readRegisters(4,address);
		return data;
	}
	//get Hummidity
	double getHum(unsigned char* data)
	{
		int readHum = (data[0] << 8) + data[1];
		double humidity = readHum / 16382.0 * 100.0;//Conversion
		return humidity;
	}
	//Get Temperature
	double getTemp(unsigned char* data)
	{
		int readTemp = (data[2] <<6) + (data[3] >> 2);
		double temp = readTemp / 16382.0 *165.0 -40;//Conversion
		return temp;
	}
};
int main()
{
	I2CDriver* i2c = new I2CDriver();
	if(i2c->getVerif()==1)
	{
		cout << "Error connection with the module" << endl;
		return 1;
	}
	unsigned char* data = i2c->read();
	double humidity = i2c->getHum(data);
	double temp = i2c->getTemp(data);
    cout << humidity << "% " << temp << "°C" << endl;
	i2c->close();
	return 0;
}

