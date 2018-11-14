#include <stdio.h>
#include <stdlib.h>
#define verif "/sys/class/gpio/export"
#define direction "/sys/class/gpio/gpio49/direction"
#define Value "/sys/class/gpio/gpio49/value"

void getValue();
void setDirection(int num);
void verifConfig();
FILE* analog;
int main()
{
    verifConfig();//To analyse the configuration
    setDirection(49);
    getValue();
    return 0;
}
void setDirection(int num)
{
    analog = fopen(direction,"w+");
    fprintf(analog,"%d",num);
    fclose(analog);
}


void getValue()
{
    int value = 0;
    analog = fopen(Value,"w+");
    fscanf(analog,"%d",&value);
    fclose(analog);
}

void verifConfig()
{
    if(fopen(direction,"r") == NULL)
    {
        analog = fopen(verif,"w+");
        fprintf(analog,"49");
        fclose(analog);
    }
}
