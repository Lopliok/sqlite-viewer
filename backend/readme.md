I'll help you create API documentation for your endpoints. I'll create a README.md file with detailed API documentation:

```markdown:/Users/maxpayne/apps/db-app/backend/README.md
# DB App API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require authentication using a database name and password in the request body.

## Endpoints

### Login
Creates a new database or authenticates with an existing one.

- **URL:** `/login`
- **Method:** `POST`
- **Body:**
```json
{
    "dbName": "string",
    "password": "string"
}
```
- **Success Response:**
  - **Code:** 200
  - **Content:** 
```json
{
    "success": true,
    "randomNum": number  // Only present for new databases
}
```
- **Error Response:**
  - **Code:** 401
  - **Content:** `{ "error": "Invalid password" }`
  - **Code:** 500
  - **Content:** `{ "error": "Authentication error" }`

### Get Tables
Retrieves all tables in the specified database.

- **URL:** `/tables`
- **Method:** `POST`
- **Body:**
```json
{
    "dbName": "string",
    "password": "string"
}
```
- **Success Response:**
  - **Code:** 200
  - **Content:** 
```json
{
    "tables": ["table1", "table2", ...]
}
```
- **Error Response:**
  - **Code:** 500
  - **Content:** `{ "error": "error message" }`

### Get Table Data
Retrieves all data from a specified table.

- **URL:** `/table-data`
- **Method:** `POST`
- **Body:**
```json
{
    "dbName": "string",
    "password": "string",
    "tableName": "string"
}
```
- **Success Response:**
  - **Code:** 200
  - **Content:** 
```json
{
    "data": [
        {
            "column1": "value1",
            "column2": "value2",
            ...
        },
        ...
    ]
}
```
- **Error Response:**
  - **Code:** 500
  - **Content:** `{ "error": "error message" }`

### Update Table Data
Updates multiple rows in a specified table.

- **URL:** `/update-data`
- **Method:** `POST`
- **Body:**
```json
{
    "dbName": "string",
    "password": "string",
    "tableName": "string",
    "updates": [
        {
            "id": number,
            "changes": {
                "column1": "new_value1",
                "column2": "new_value2",
                ...
            }
        },
        ...
    ]
}
```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true }`
- **Error Response:**
  - **Code:** 500
  - **Content:** `{ "error": "error message" }`

## Error Handling
All endpoints follow a consistent error response format:
```json
{
    "error": "Description of the error"
}
```

## Notes
- All database files are stored in the `data` directory
- Passwords are stored in plain text files with `.txt` extension
- Database files use `.sqlite` extension
- All endpoints require authentication via the database name and password
```

This documentation provides a clear overview of your API endpoints, including:
- Request/response formats
- Authentication requirements
- Error handling
- Example payloads
- Success and error responses

You can place this README.md file in your backend directory for easy reference. Consider also generating this documentation in a more interactive format using tools like Swagger/OpenAPI if you need a more sophisticated documentation system.