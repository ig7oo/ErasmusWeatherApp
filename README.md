# ErasmusWeatherApp


## Startup 

To start the App use the "make startup" command in the terminal,
for restarting the containers etc. please refer to the Makefile.

Sometimes it doesn't work (i don't know why yet), so use : make build_dev, make install and make run  instead. 

make install will install the vendor folder wich contains chart.js

To run the make commands you will need Linux or WSL (Ne, Jakob. Zwinkersmiley) 

## Development

Once the database container is running you can connect to it locally with following login data: 

host: localhost
port: 3306
user: user 
password: pass 

you will need to create two tables with the following command (i am too lazy to write a script to do this on startup) : 
```
create table weather_data_fin (
    id INT auto_increment primary key,
    avg_temp_c float,
    avg_temp_f float,
    avg_airpressure float,
    avg_humidity float,
    date date
) 
```
```
create table weather_data_ger (
    id INT auto_increment primary key,
    avg_temp_c float,
    avg_temp_f float,
    avg_airpressure float,
    avg_humidity float,
    date date
) 
```

and then add example data.

## TechStack 

### Frontend 
    Javascript: https://developer.mozilla.org/en-US/docs/Web/JavaScript
    ChartJS: https://www.chartjs.org/docs/latest/

### Backend 
    PHP: https://www.php.net/docs.php
    Docker: https://docs.docker.com/

### Database 
    MySQL: https://dev.mysql.com/doc/


