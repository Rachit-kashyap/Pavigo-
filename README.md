<!-- TO START THIS PROJECT -->
<!-- ADD THE ENVIROMENT VARIABLES -->

<!-- BEFORE RUN THIS PROJECT ENSURE YOU HAVE INSTALL NODE JS IN YOUR SYSTEM -->
<!-- IN BACKEND DIRECTORY WRITE   npm install, then ,   node server.js -->
<!-- IN FRONTEND DIRECTORY WRITE  npm install then npm run dev -->

<!-- THIS IS THE REGISTER ROUTE -->


POST ROUTE :  https://pavigo.onrender.com/api/auth/register

DATA FORMATE REQUIRED TO USE THIS API  :

    "email":"test@gmail.com",
    "password":"rachit@123",
    "name":"xyz"

LIKE THIS ALL THE FIELDS IS CASE SENSITIVE email , name , password 

THIS API SEND THIS 

{
    "success": true,
    "message": "User registered successfully. Verify Your account",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODVlZDNhMGIxMjUzMDUwNzUwZGEzZGIiLCJpYXQiOjE3NTEwNDUwMjUsImV4cCI6MTc1MTA0NTE0NX0.SLiIF4dpZ5XkExlemy2ng8sXU7EfpMd-5rBQpdaujac"
}


NOTE : YOU HAVE TO STORE THIS TOKEN IN LOCAL STORAGE BECAUSE YOU HAVE TO SEND THIS TOKEN IN EVERY REQUEST NOT IN AUTH APIS



<!-- NOW MOVE TO THE LOGIN API -->

POST ROUTE :  https://pavigo.onrender.com/api/auth/login


DATA FORMATE REQUIRED TO USE THIS API  :

    "email":"test@gmail.com",
    "password":"rachit@123",


LIKE THIS ALL THE FIELDS IS CASE SENSITIVE email , password 

THIS API SEND THIS 

{
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODVkNGYyOWM3ZDdjZTY3ZTRjMjBmMWMiLCJpYXQiOjE3NTEwNDU0MDcsImV4cCI6MTc1MTkwOTQwN30.Qlu_2lIz9kLx3ycb9E8V4PhMlPrAd1vPSB9hBOs6wAk"
}


NOTE : YOU HAVE TO STORE THIS TOKEN IN LOCAL STORAGE BECAUSE YOU HAVE TO SEND THIS TOKEN IN EVERY REQUEST NOT IN AUTH APIS




<!-- For socket connection integration i will add it later -->