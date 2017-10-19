NB: Title of the pull request should be as below this line
#152110488 Stabilize ABC for XYZ Section

### What does this PR do?
Ensures the front end has all functionality work the way it was intended

### Description of Task to be completed?
Shows the functionalities working as expected and those not, provided they are defined in the test specifications.

### How should this be manually tested?
- Install all dependencies after pulling `npm install` or `npm update`
- Install *karma-cli* globally `npm i -g karma-cli`
- Ensure your test files are created inside **test/client/** directory
- run `karma start`

### Any background context you want to provide?
- test folder was restructured to have *client* and *server* subfolder
- therefore, all frontend test can go into *client* subfolder

### What are the relevant pivotal tracker stories?
#151168171 Setup unit testing for the front end

### Screenshots (if appropriate)
A Sample test run **checking if 2+2 is equal to 4**
<img width="1175" alt="screen shot 2017-09-19 at 3 19 04 pm" src="https://user-images.githubusercontent.com/20375577/30597816-04329f26-9d50-11e7-9378-19f2a7663262.png">


### Questions:
N/A
