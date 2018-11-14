#include <stdio.h>
#include <stdlib.h>
#define Value "/sys/bus/iio/devices/iio:device0/in_voltage0_raw"
FILE* analog;
int main()
{
    int value = 0;
    analog = fopen(Value,"r");
    fscanf(analog,"%d",&value);
    printf("%d",value);
    return 0;
}

