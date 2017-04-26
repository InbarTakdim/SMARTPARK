# smart park server


## report:

path :

https://smartserver1.herokuapp.com/addNewParking/


#### you must pass in body request params:


reporter_id - number

time- string in format: yyyy-mm-dd%20hh:mm:ss

street- string

number- number

city- string

lat- number

lng- number

img- string

description- string

## search:

path :

https://smartserver1.herokuapp.com/searchParking/


#### you must pass in body request params:


time- string in format: yyyy-mm-dd%20hh:mm:ss

lat- number

lng- number

diff- number


## marks:


1. time strcture : yyyy-mm-dd%20hh:mm:ss

2. latitude range is : -85<latitude<85

3. longtitude range is : -180<longtitude<180


