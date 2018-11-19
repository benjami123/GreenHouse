#include <stdio.h>
#include <stdlib.h>
#define verif "/sys/class/pwm/pwmchip3/export"
#define duty "/sys/class/pwm/pwmchip3/pwm-3:1/duty_cycle"
#define period "/sys/class/pwm/pwmchip3/pwm-3:1/period"
#define Run "/sys/class/pwm/pwmchip3/pwm-3:1/enable"
#define Unexport "/sys/class/pwm/pwmchip3/export"

void setDuty(int);
void setPeriod(int);
void run();
void verifConfig();
int calculDuty(int);
FILE* pwm;
int periodValue = 100000;
int main(int argc, char* argv[])
{
    verifConfig();//To analyse the configuration
    if(argc == 2)
    {
        setPeriod(periodValue);// initialise the period
        int d = 0;
        sscanf(argv[1],"%d",&d);// recover the duty
        if(d<=100 && d>=0)
        {
            setDuty(calculDuty(d));// set the duty
        }
        else
        {
            printf("Error duty argument value\n");
            return 1;
        }
        run();
    }
    else
    {
        printf("Less or Too many arguments\n");
        return 1;
    }

    return 0;
}
void setDuty(int num)
{
    pwm = fopen(duty,"w+");
    fprintf(pwm,"%d",num);
    fclose(pwm);
}

void setPeriod(int num)
{
    pwm = fopen(period,"w+");// open the file
    fprintf(pwm,"%d",num);// write in the file
    fclose(pwm);// close the file
}


void run()
{
    pwm = fopen(Run,"w+");
    fprintf(pwm,"1");
    fclose(pwm);
}
int calculDuty(int val)
{
    printf("duty = %d\n",val*periodValue/100);
    return val*periodValue/100;
}

void verifConfig()
{
    system("config-pin -a P9_16 pwm");
    if(fopen(period,"r") == NULL)
    {
        pwm = fopen(verif,"w+");
        fprintf(pwm,"1");
        fclose(pwm);
    }
}
