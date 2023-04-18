## Contacts API

This API is running on `localhost:3000/api/contacts`.
For text requests use JSON format. Other formats are not compatible. It's working this way to simplify everything.

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

### Change "Favorite" status

- Method: PATCH
- Endpoint: /:contactID
- Query Parameters:
  - `favorite`: boolean
- Description: Updates a favorite status.

#### Remove Contact

- Method: DELETE
- Endpoint: `/:contactID`
- Description: Removes a contact by ID.

### Data Info

#### Name

- String
- Required
- Unique

#### Email

- String
- Required
- Unique
- Valid format "sam.ple@xyz.zy"/"sample@xyz.zy" etc.

#### Phone

- String
- Required
- Unique
- Accepts those formats :
  - `+1234567890`
  - `001234567890`
  - `+12 345 678 90`
  - `(123) 456-7890`
  - `(123)456-7890`
  - `123.456.7890`
  - `1234567890`
  - `123-456-7890`
  - `123 456 7890`
