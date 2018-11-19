#include <stdio.h>
#include <stdlib.h>
#define Value "/sys/bus/iio/devices/iio:device0/in_voltage0_raw"
FILE* analog;
int main()
{
    int value = 0;
    float res = 0;
    analog = fopen(Value,"r");
    fscanf(analog,"%d",&value);
    if(value < 10){
        res = 0;
    }else if( value > 1500){
        res = 100;
    }else{
        res = (float) value / 1500 * 100;
    }
    printf("%.2f", res);
    return 0;
}

