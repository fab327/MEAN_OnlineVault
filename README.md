# README #

Welcome to Online Vault. A smaller scale LastPass implementation accessible at https://online-vault.herokuapp.com/

### How do I get set up? ###

* I recommend using https://www.atlassian.com/software/sourcetree/overview as git client
* Clone the Repo via git client https://user@bitbucket.org/fab327/online-vault.git (replace with your username)
* Make sure you are setup with NodeJS and MongoDB
* Use IntelliJ as IDE if possible. Bracket and SublimeText would do as well.

### Contribution guidelines ###

* The node module directory not being part of version control, MAKE SURE TO RUN npm install on the directory every time you make a pull request to insure having the most up to date dependencies. It will install the most recent dependencies from the package.json file.
* When ADDING A NEW DEPENDENCY, make sure to do "npm install --save <nameOfModule>". This way, the module name is added to the package.json file so other developers can download it as well.

### Who do I talk to? ###

* Fabrice Ahebee fab@justfabcodes.com
* Marcel Starosielsky mstarosi@students.kennesaw.edu
