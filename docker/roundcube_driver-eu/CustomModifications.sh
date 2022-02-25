#!/bin/bash

echo Custom modifications
# export REFRESH_TIME=30
REFRESH_TIME_VALUE="${REFRESH_TIME:=60}" 
echo Set webmail refresh time to $REFRESH_TIME_VALUE seconds
sed -i "s/\$config\['refresh_interval'\] =.*/\$config\['refresh_interval'] = $REFRESH_TIME_VALUE;/g" /var/www/html/config/defaults.inc.php