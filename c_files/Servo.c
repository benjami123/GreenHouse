#include <stdio.h>
#include <stdlib.h>
#define verif "/sys/class/pwm/pwmchip1/export"
#define duty "/sys/class/pwm/pwmchip1/pwm-1:1/duty_cycle"
#define period "/sys/class/pwm/pwmchip1/pwm-1:1/period"
#define Run "/sys/class/pwm/pwmchip1/pwm-1:1/enable"

void setDuty(int);
void setPeriod(int);
void run();
void verifConfig();
int calculDuty(int);
FILE* pwm;

int main(int argc, char* argv[])
{
    int periodValue = 20000000;
    verifConfig();//To analyse the configuration
    if(argc == 2)
    {
        setPeriod(periodValue);// initialise the period
        int d = 0;
        sscanf(argv[1],"%d",&d);// recover the duty
        if(d <= 0){
            setDuty(610000);// set the duty
        }else if(d >= 1){
            setDuty(2370000);// set the duty
            usleep(2000000);
            setDuty(2340000);
        }else{
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
void setDuty(int num){
    pwm = fopen(duty,"w+");
    fprintf(pwm,"%d",num);
    fclose(pwm);
}

void setPeriod(int num){
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

void verifConfig()
{
    system("config-pin -a P9_21 pwm");
    if(fopen(period,"r") == NULL)
    {
        pwm = fopen(verif,"w+");
        fprintf(pwm,"1");
        fclose(pwm);
    }
}
