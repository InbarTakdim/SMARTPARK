![SMARTPARK](./assets/LOGODAVID3-0.png) 
# SMARTPARK - Server 
###### Final CSE Project 

### REST API
* REPORT:

*path:* https://smartserver1.herokuapp.com/addNewParking/

**you must pass in body request params**

1. reporter_id - number

2. time- string in format: yyyy-mm-dd%20hh:mm:ss

3. street- string

4. number- number

5. city- string

6. lat- number

7. lng- number

8. img- string

9. description- string

* SEARCH:

*path:* https://smartserver1.herokuapp.com/searchParking/

**you must pass in body request params:**

1. time- string in format: yyyy-mm-dd%20hh:mm:ss

2. lat- number

3. lng- number

4. diff- number


* MARK:


1. time strcture : yyyy-mm-dd%20hh:mm:ss

2. latitude range is : -85<latitude<85

3. longtitude range is : -180<longtitude<180


