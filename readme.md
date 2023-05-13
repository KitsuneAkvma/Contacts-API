# Contacts API

Welcome to the Contacts API! This API provides various endpoints to manage your contacts and user data.

## Navigation

- [Contacts API](#contacts-api)
  - [Navigation](#navigation)
  - [Installation](#installation)
  - [Getting started](#getting-started)
  - [Endpoints](#endpoints)
    - [Contacts](#contacts)
      - [`GET /contacts`](#get-contacts)
      - [`GET /contacts/:contactId`](#get-contactscontactid)
      - [`POST /contacts`](#post-contacts)
      - [`PUT /contacts/:contactId`](#put-contactscontactid)
      - [`PATCH /contacts/:contactId`](#patch-contactscontactid)
      - [`DELETE /contacts/:contactId`](#delete-contactscontactid)
    - [Users](#users)
      - [`POST /users/signup`](#post-userssignup)
      - [`POST /users/verify`](#post-usersverify)
      - [`POST /users/login`](#post-userslogin)
      - [`POST /users/logout`](#post-userslogout)
      - [`GET /users/current`](#get-userscurrent)
      - [`PATCH /users`](#patch-users)
      - [`PATCH /users/avatars`](#patch-usersavatars)
  - [Authentication](#authentication)
    - [Via HTTP Cookie](#via-http-cookie)
    - [Via HTTP Header](#via-http-header)
  - [Query Parameters](#query-parameters)
  - [Error handling](#error-handling)
- [Docker](#docker)
    - [1. Pull the Docker Image](#1-pull-the-docker-image)
    - [2. Provide Environment Variables](#2-provide-environment-variables)
    - [3. Run the Docker Container](#3-run-the-docker-container)
    - [4. Access the Contacts API](#4-access-the-contacts-api)
- [Contributing](#contributing)
- [License](#license)

## Installation

To use this API, you will need to have Node.js and npm (Node Package Manager) installed on your machine. Follow the steps below to set up the project:

1. Clone the repository from GitHub:

```
git clone https://github.com/KitsuneAkvma/Contacts-API
```

2. Change directory to the project folder:

```
cd your-repo
```

3. Install the dependencies:

```
npm install
```

4. Create a `.env` file in the root directory and add the following environment variables:

```
DATABASE_URL=your-database-url
SECRET_KEY=your-secret-key
```

5. Start the server:

```
npm start
```

6. The API should now be running on `http://localhost:3000`.

## Getting started

To use this API, you need to have a valid account. You can create an account by making a `POST` request to the `/signup` endpoint. You will receive an authentication token that you can use to make requests to the API.

This API uses cookies to maintain user sessions, so make sure to include the `Cookie` header in all your requests.

## Endpoints

### Contacts

#### `GET /contacts`

Retrieves a list of contacts.

Example Usage:

To retrieve the first 10 contacts:

```
GET /contacts?page=1&limit=10
```

To retrieve the first 10 contacts that are marked as favorite:

```
GET /contacts?page=1&limit=10&favorite=true
```

Please see the `query parameters` section to learn how about pagination and filters.

#### `GET /contacts/:contactId`

Returns a specific contact by ID for the authenticated user.

#### `POST /contacts`

Creates a new contact for the authenticated user. The request body should be a JSON object containing the following fields:

- `name` (required): The name of the contact.
- `email` (required): The email address of the contact.
- `phone` (required): The phone number of the contact.

#### `PUT /contacts/:contactId`

Updates a specific contact by ID for the authenticated user. The request body should be a JSON object containing the fields to be updated:

- `name`: The new name of the contact.
- `email`: The new email address of the contact.
- `phone`: The new phone number of the contact.

#### `PATCH /contacts/:contactId`

Updates the `favorite` field of a specific contact by ID for the authenticated user. The request body should be a JSON object containing the following field:

- `favorite` (required): A boolean indicating whether the contact should be marked as a favorite or not.

#### `DELETE /contacts/:contactId`

Deletes a specific contact by ID for the authenticated user.

### Users

#### `POST /users/signup`

Creates a new user account. The request body should be a JSON object containing the following fields:

- `email` (required): The email address of the user.
- `password` (required): The password for the user.

Verification email will be send at provided email address when user is created successfully.

#### `POST /users/verify`

This route allows users to resend the email verification link to their email address. If the user is not yet verified, the verification email containing a unique token will be sent to the user's inbox.

- `email` (required): The email address of the user.

**Response**:

- Success (200 OK): Email sent successfully.
  - Message: "Email sent to your inbox! Please check other categories as well your spam folder!"
- Error (400 Bad Request):
  - User already verified: Message: "Already verified!"
  - User not found: Message: "User not found"

#### `POST /users/login`

Logs in a user and returns an authentication token. The request body should be a JSON object containing the following fields:

- `email` (required): The email address of the user.
- `password` (required): The password for the user.

#### `POST /users/logout`

Logs out the authenticated user and invalidates the authentication token. This endpoint requires authentication, so make sure to include the `Authorization` header with the token.

#### `GET /users/current`

Returns the current user's email and subscription. This endpoint requires authentication.

#### `PATCH /users`

Updates the current user's subscription. The request body should be a JSON object containing the following field:

- `subscription` (required): The new subscription level for the user. Valid values are `"starter"`, `"pro"`, and `"business"`.

#### `PATCH /users/avatars`

Updates the current user's avatar. This endpoint requires authentication.

**Request Body**

The request body should be a `multipart/form-data` containing the following field:

- `avatar` (required): The image file representing the new avatar for the user. The file should be in JPG or PNG format, and the size should not exceed 5MB.

**Response**

The server will respond with a JSON object containing the following fields:

- `success`: A boolean indicating whether the operation was successful.
- `message`: A message describing the result of the operation.

**Example**

```
PATCH /users/avatars HTTP/1.1
Host: example.com
Authorization: Bearer <access_token>
Content-Type: multipart/form-data; boundary=--------------------------1234567890

----------------------------1234567890
Content-Disposition: form-data; name="avatar"; filename="avatar.png"
Content-Type: image/png

<Binary data of the image file>
----------------------------1234567890--
```

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Avatar updated successfully"
}
```

Note: After uploading, the server will save the avatar as a temporary file, then resize it to 250x250, and finally save it to the `public` folder. The temporary file will be removed automatically. If the user had a previous avatar, it will be replaced by the new one.

## Authentication

This API uses token-based authentication to secure its endpoints. To access the protected endpoints, clients must first authenticate by sending an authentication token along with the request. The API supports two ways to authenticate:

- Via HTTP Cookie
- Via HTTP Header

### Via HTTP Cookie

The API will automatically save the authentication token in a cookie named "authToken" upon successful login. The client's browser will automatically attach this cookie to subsequent requests, allowing the user to authenticate without sending the authentication token in every request. If the token is invalid, the API will return a 401 Unauthorized status code.

### Via HTTP Header

Clients can also authenticate by manually attaching the token in the `Authorization` header of their requests. The header should be in the following format:

```
Authorization: Bearer <authentication-token>
```

If the token is valid, the API will proceed to process the request. If the token is invalid or missing, the API will return a 401 Unauthorized status code.

## Query Parameters

The API allows clients to provide additional parameters as part of the query string in the URL to customize the response returned from the API. Currently, the following query parameters are supported for the `GET /contacts` endpoint:

- `page`: The page number to return. Default value is 1 if not specified.
- `limit`: The maximum number of contacts to return per page. Default value is 20 if not specified.
- `favorite`: A boolean value that filters the contacts by whether they are marked as favorites. If `favorite=true`, only the contacts marked as favorites will be returned. If `favorite=false` or not specified, all contacts will be returned.

## Error handling

When an error occurs, the API will return a JSON response with an `error` field containing a description of the error. The response will also include a status code indicating the type of error that occurred.


# Docker



### 1. Pull the Docker Image

First, pull the pre-built Docker image from the container registry. Open your terminal and run the following command:

```bash
docker pull akvma/contacts-api
```


### 2. Provide Environment Variables

Before running the Docker container, make sure to have the necessary environment variables ready. The Contacts API requires the following environment variables to be set:

- `DB_URI`: Your MongoDB URI
- `JWT_SECRET`: Your JWT secret key
- `SENDGRID_API_KEY`: Your SendGrid API key

### 3. Run the Docker Container

Once you have the environment variables, you can start the Contacts API by running the Docker container. Use the following command:

```bash
docker run -p 8080:8080 -e DB_URI=<your_mongodb_uri> -e JWT_SECRET=<your_jwt_secret> -e SENDGRID_API_KEY=<your_sendgrid_api_key> your-username/contacts-api:latest
```

Replace `your-username` with your Docker Hub username, and `<your_mongodb_uri>`, `<your_jwt_secret>`, and `<your_sendgrid_api_key>` with the actual values for your MongoDB URI, JWT secret, and SendGrid API key.


For example :
```bash
docker run -p 8080:8080 -e DB_URI="mongodb+srv://username:exampleexampleexample" -e JWT_SECRET="oijd289@&hdak2u2" -e SENDGRID_API_KEY=<your_sendgrid_api_key> your-username/contacts-api:latest
```
### 4. Access the Contacts API

The Contacts API should now be running inside the Docker container. You can access it by making HTTP requests to `http://localhost:8080` in your web browser or using tools like cURL or Postman.

That's it! You have successfully deployed and run the Contacts API using Docker.

Note: Make sure you have Docker installed and running on your machine before following these instructions.

If you encounter any issues or have further questions, please feel free to ask.

# Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue or submit a pull request.

# License

This API is licensed under the MIT License. See the `LICENSE` file for more information.
