# Simple Student Web Server Client 

In this repo, we used: 

* use `javaScript` to write function 
* use `express-generator`, to quickly create an application skeleton
* use `google chart api` to draw chart
* use `sendgrid` for transactional email
* use `tailwind css` for css
* use `sequelize` and `mysql` for database

### What's in the download?
The download includes :
```
Skeleton/
├── README.md
├── apps.js
├── gulpfile.js
├── package.json
├── bin
│   └── www
├── public
│   └── stylesheets
│        └── style.css
├── routes
│   ├── admin.js
│   ├── index.js
│   ├── login.js
│   ├── register.js
│   ├── statistic.js
│   ├── students.js
│   └── users.js
├── src
│   ├── db_connect.js
│   ├── joi_student.js
│   ├── model_students.js
│   ├── model_users.js
│   └── seq_db_connect.js
└── views
    ├── adminList.pug
    ├── edit.pug
    ├── error.pug
    ├── forgot.pug
    ├── index.pug
    ├── input.pug
    ├── inputUser.pug
    ├── layout.pug
    ├── login.pug 
    ├── register_next.pug
    ├── register.pug
    ├── reset.pug
    ├── statistic.pug
    └── students.pug
```
### How to Use
1. Make sure you have installed `npm` in your PC
2. Make sure you have installed `mysql` in your PC
3. Make sure you have `sendgrid` account
4. Install `google chart api` with command :
    `npm i -D google-charts`
5. Install `sendgrid` with this command :
    `npm install --save @sendgrid/mail`
6. Update the development environment with your `SENDGRID_API_KEY`, for example:
    ```
    echo "export SENDGRID_API_KEY='YOUR_API_KEY'" > sendgrid.env
   echo "sendgrid.env" >> .gitignore
   source ./sendgrid.env
   ```
7. Download file in this repo or clone this repo, with command :
    `https://github.com/Qisti/CRUD-HTML-NodeJs`
8. Import `crud.sql` to your database 
9. running in CLI with command :
    `DEBUG=databaseApp:* npm start`
10. Open in your browser with url `localhost:3000/students`