import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

const filePath = path.normalize("./models/contacts.json");

const listContacts = async () => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const contacts = JSON.parse(data);
    if (contacts) {
      return {
        statusCode: 200,
        message: "Successfully found contacts list!",
        data: contacts,
      };
    } else {
      return {
        statusCode: 404,
        message: "Can't find contacts list!",
      };
    }
  } catch (error) {
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      console.error("Unexpected end of JSON input: ", error);
      return {
        statusCode: 500,
        message: "Unexpected end of JSON input, list probably doesn't exists",
      };
    } else {
      console.error("An error occurred:", error);
      return { statusCode: 400, message: error };
    }
  }
};

const getContactById = async (contactId) => {
  const contacts = (await listContacts()).data;
  const foundContact = contacts.find((contact) => contact.id === contactId);
  if (foundContact)
    return {
      statusCode: 200,
      message: "Successfully found contact",
      data: foundContact,
      yourRequest: contactId,
    };
  else {
    return {
      statusCode: 404,
      message: "Contact not found",
      yourRequest: contactId,
    };
  }
};

const addContact = async (body) => {
  try {
    const contacts = (await listContacts()).data;
    const { name, email, phone } = body;
    const collidingContact = contacts.find(
      (contact) =>
        contact.name === name ||
        contact.email === email ||
        contact.phone === phone
    );
    if (collidingContact) {
      return {
        statusCode: 409,
        message: "Contact with this data is on the list",
        collidingContact: collidingContact,
        yourRequest: body,
      };
    }
    const newContact = { id: uuidv4(), name, email, phone };
    const updatedContacts = contacts.concat(newContact); // <= used non-mutable concat method to prevent potential problems when there are to request made at the same time. :)

    const updatedData = JSON.stringify(updatedContacts, null, 2);
    fs.writeFile(filePath, updatedData);

    return {
      statusCode: 201,
      message: "Successfully added contact!",
      yourRequest: body,
      newContact: newContact,
    };
  } catch (error) {
    console.log("An error occurred:", error);
    return error;
  }
};

const updateContact = async (contactId, body) => {
  try {
    const contactToEdit = (await getContactById(contactId)).data;

    if (contactToEdit === null) {
      return {
        statusCode: 404,
        message: "Contact with this ID has not been found!",
      };
    }
    const {
      name = contactToEdit.name,
      email = contactToEdit.email,
      phone = contactToEdit.phone,
    } = body;

    const updatedContact = { ...contactToEdit, name, email, phone };
    const contactsList = (await listContacts()).data;
    const updatedContactsList = contactsList.map((contact) => {
      if (contact.id === contactId) {
        return { ...contact, ...updatedContact };
      } else {
        return contact;
      }
    });
    fs.writeFile(filePath, JSON.stringify(updatedContactsList, null, 2));
    return {
      statusCode: 200,
      message: "Successfully updated contact !",
      updatedContact: updatedContact,
    };
  } catch (error) {
    console.error(error);
    return error;
  }
};

const removeContact = async (contactId) => {
  try {
    const contactsList = (await listContacts()).data;
    const updatedContactsList = contactsList.filter(
      (contact) => contact.id !== contactId
    );

    if (updatedContactsList.length === contactsList.length) {
      return {
        statusCode: 404,
        message: "Contact has not been found! :( ",
        yourRequest: contactId,
      };
    }
    const removedContact = (await getContactById(contactId)).data;
    fs.writeFile(filePath, JSON.stringify(updatedContactsList, null, 2));
    return {
      statusCode: 200,
      message: "Successfully removed contact!",
      removedContact: removedContact,
    };
  } catch (error) {
    console.error(error);
    return error;
  }
};

export {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
