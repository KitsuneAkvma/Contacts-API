## Contacts API

This API is running on `localhost:3000/api/contacts`.

### Endpoints

#### List Contacts
- Method: GET
- Endpoint: `/`
- Description: Returns a list of all contacts.

#### Find Contact by ID
- Method: GET
- Endpoint: `/:contactID`
- Description: Finds a contact by ID.

#### Add Contact
- Method: POST
- Endpoint: `/`
- Query Parameters:
  - `name`: string (required)
  - `email`: string (required)
  - `phone`: string (required)
- Description: Adds a new contact.

#### Update Contact
- Method: PUT
- Endpoint: `/:contactID`
- Query Parameters:
  - `name`: string
  - `email`: string
  - `phone`: string
- Description: Updates a contact. At least one data field must be provided.

#### Remove Contact
- Method: DELETE
- Endpoint: `/:contactID`
- Description: Removes a contact by ID.
