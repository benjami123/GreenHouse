#!/bin/bash

config-pin -a P9_16 pwm

config-pin -a P9_21 pwm

echo "1" > "/sys/class/pwm/pwmchip3/export"
echo "1" > "/sys/class/pwm/pwmchip3/export"
echo "49" > "/sys/class/gpio/export"

node server.js
