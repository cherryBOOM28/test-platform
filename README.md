# Test API

## Setup .env file

Create a `.env` file in the root directory and add the following environment variables:

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=test_api
DB_PASSWORD=2002
DB_PORT=5433

PORT=5003
JWT_SECRET=mySuperSecretKey
```



2. Install dependencies

3. Build the app

  
4. Start the app:  
- Production mode:
  
  ```
  npm run start
  ```
- Development mode (with hot reload):
  
  ```
  npm run dev
  ```


## Endpoints

- Get all tests:

```
GET http://localhost:5003/api/tests
```

- Get all tests with answers:

```
GET http://localhost:5003/api/tests/:id
```

- Delete test:

```
DELETE http://localhost:5003/api/tests/:id
```

- Update test:

```
PUT http://localhost:5003/api/tests/:id
```

- Create test:

```
POST http://localhost:5003/api/tests
```

- Create test:

```
POST http://localhost:5003/api/tests
```

- Auth:

- Create user:

```
POST http://localhost:5003/api/auth/register
```

- Log in:

```
POST http://localhost:5003/api/auth/login
```



- Question:

- Create question:
  
```
POST http://localhost:5003/api/questions
```

- Edit question:
  
```
PUT http://localhost:5003/api/questions/:id
```

- Delete question:
  
```
DELETE http://localhost:5003/api/questions/:id
```


- User result:

- Get user results:
  
```
GET http://localhost:5003/api/answers/results/:id/:userId
```

- Create user answer:
  
```
POST http://localhost:5003/api/answers/submit
```
