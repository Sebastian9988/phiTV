# ejemplo-integral-mongo-mysql-express

Ejemplo integral MySQL Mongse y Express

Descargar el proyecto.
En la carpeta raíz typear npm install
Esto instala las dependencias en el packages.json & packages-lock.json
Disponer de .env en la raíz del proyecto

MYSQL_DB = "mysql://root:secret@localhost:3306/mysql-db"
PORT = 3000
BASE_URL = "/api"
PAGING_DEFAULT_RECORD_OFFSET = 0
PAGING_DEFAULT_RECORD_LIMIT = 10
PAGING_DEFAULT_MAX_RECORD_LIMIT = 500
MONGO_CONNECTION_STRING = "mongodb://admin:secure@localhost:27017/admin"




CRUD en MySQL.
•	Sequelize
•	Express

Families

GET http://localhost:3000/api/families?limit=100&offset=0
GET http://localhost:3000/api/families/2
POST http://localhost:3000/api/families
{
    "name":"Perez del Castillo",
    "API_KEY": "1234"
}
PUT http://localhost:3000/api/families/2
{    
    "name" : "otro",
    "API_KEY": "7777"
}
DELETE http://localhost:3000/api/families/2

Categories
GET http://localhost:3000/api/categories?limit=100&offset=0
GET http://localhost:3000/api/categories/1
POST http://localhost:3000/api/categories
{
    "name": "Gastos de energía",
    "description": "Gastops de Ute, Nafta, ect.",
    "providerRegulatoryUnitsLimit": "4500",
    "familyId": 2,
    "inactive": false,
    "image": "http://lindaimagen.com"
}
PUT http://localhost:3000/api/categories/1
{
    "name": "Gastos de energía",
    "description": "Gastops de Ute, Nafta, ect.",
    "providerRegulatoryUnitsLimit": "6000",
    "familyId": 2,
    "inactive": false,
    "image": "http://lindaimagen.com"
}
DELETE http://localhost:3000/api/categories/2

CRUD en MongoDB.
GET http://localhost:3000/api/providerRegulatoryUnits?limit=100&offset=0
GET http://localhost:3000/api/providerRegulatoryUnits/634435b653b485852c72e30d
POST http://localhost:3000/api/providerRegulatoryUnits
{
    "amount": 22222,
    "description": "aaaaaaaaaaaaaa",
    "date": "2022-10-10T15:09:42.381Z",
    "category": {
        "categoryId": 2,
        "name": "categgoria",
        "description": "desc",
        "providerRegulatoryUnitsLimit": 1500
    },
    "family": {"familyId":1, "name":"perez"}
        
     
 }

PUT http://localhost:3000/api/providerRegulatoryUnits/63463bb27bdba82f4137c5bd

 {
    "amount": 888888,
    "description": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "date": "2022-10-10T15:09:42.381Z",
    "category": {
        "categoryId": 2,
        "name": "categgoria",
        "description": "desc",
        "providerRegulatoryUnitsLimit": 1500
    },
    "family": {"familyId":1, "name":"perez"}
        
     
 }

DELETE http://localhost:3000/api/providerRegulatoryUnits/63463bb27bdba82f4137c5bd
