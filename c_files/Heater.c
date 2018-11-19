#include <stdio.h>
#include <stdlib.h>
#define VERIF "/sys/class/gpio/export"
#define DIRECTION "/sys/class/gpio/gpio49/direction"
#define VALUE "/sys/class/gpio/gpio49/value"

void setValue(int i);
void setDirection();
void verifConfig(int num);
FILE* analog;
int main(int argc, char** argv)
{
    if(argc != 2){
        printf("Error: wrong number of arguments");
        return 1;
    }
    verifConfig(49);//To analyse the configuration
	setDirection();
    int value;
    sscanf(argv[1], "%d", &value);
    if(value > 1){
        value = 1;
    } else if(value < 0){
        value = 0;
    }
    setValue(value);
    return 0;
}
void setDirection()
{
    analog = fopen(DIRECTION,"w+");
    if(analog == NULL){
        printf("Error: file %s not found\n", DIRECTION);
        return;
    }
    fprintf(analog,"out");
    fclose(analog);
}


void setValue(int i)
{
    analog = fopen(VALUE,"w+");
    if(analog == NULL){
        printf("Error: file %s not found\n", VALUE);
        return;
    }
    fprintf(analog, "%d", i);
    fclose(analog);
}

void verifConfig(int num)
{
    if(fopen(DIRECTION, "r") != NULL){
        return;
    }
    analog = fopen(VERIF,"w+");
    if(analog == NULL){
        printf("Error: file %s not found\n", VERIF);
        return;
    }
    fprintf(analog,"%d",num);	
    fclose(analog);
}
