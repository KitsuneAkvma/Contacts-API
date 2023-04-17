import { Contact } from "../models/models.js";


const listContacts = async () => {
  try {
    const allContacts = await Contact.find();
    if (allContacts) {
      return {
        statusCode: 200,
        message: "Successfully found contacts list!",
        data: allContacts,
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
      return {
        statusCode: 500,
        message: "Internal server error",
        error: error.message,
      };
    }
  }
};

const getContactById = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId);

    if (contact) {
      return {
        statusCode: 200,
        message: "Successfully found contact",
        data: contact,
        yourRequest: contactId,
      };
    } else {
      return {
        statusCode: 404,
        message: "Contact not found",
        yourRequest: contactId,
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
      yourRequest: contactId,
    };
  }
};

const addContact = async (body) => {
  try {
    const { name, email, phone } = body;

    // Check if a contact with the same name, email, or phone number already exists
    const existingContact = await Contact.findOne({
      $or: [{ name }, { email }, { phone }],
    });

    if (existingContact) {
      return {
        statusCode: 409,
        message:
          "A contact with this name, email, or phone number already exists",
        yourRequest: body,
        conflictingContact: existingContact,
      };
    }

    const newContact = new Contact({
      name,
      email,
      phone,
    });

    await newContact.save();

    return {
      statusCode: 201,
      message: "Successfully added contact!",
      yourRequest: body,
      newContact: newContact,
    };
  } catch (error) {
    console.log("An error occurred:", error);
    return {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
      yourRequest: body,
    };
  }
};

const updateContact = async (contactId, body) => {
  try {
    if (Object.keys(body).length === 0) {
      return {
        statusCode: 400,
        message: "Request body is empty",
        yourRequest: body,
      };
    }

    const contactToEdit = await Contact.findById(contactId);

    if (!contactToEdit) {
      return {
        statusCode: 404,
        message: "Contact not found",
        yourRequest: contactId,
      };
    }

    const updatedContact = { ...contactToEdit._doc };

    for (const key in body) {
      const value = body[key];
      updatedContact[key.toLowerCase()] = value;
    }
    console.log({ body, updatedContact });

    await Contact.findByIdAndUpdate(contactId, updatedContact, {
      runValidators: true,
      new: true,
    });

    return {
      statusCode: 200,
      message: "Successfully updated contact!",
      updatedContact: updatedContact,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
      yourRequest: contactId,
    };
  }
};

const switchFavorite = async (contactId, body) => {
  try {
    const contactToSwitch = await Contact.findById(contactId);

    if (!contactToSwitch) {
      return {
        statusCode: 404,
        message: "Contact not found :(",
        yourRequest: contactId,
      };
    }
    if (contactToSwitch.favorite.toString() === body.favorite) {
      return {
        statusCode: 400,
        message: "Contact already have this status !",
        yourRequest: body,
        contact: contactToSwitch,
      };
    }

    const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
      new: true,
    });

    if (body.favorite === "true") {
      return {
        statusCode: 200,
        message: "Successfully added contact to favorites",
        updatedContact: updatedContact,
      };
    } else {
      return {
        statusCode: 200,
        message: "Successfully removed contact from favorites",
        updatedContact: updatedContact,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
      yourRequest: contactId,
    };
  }
};
const removeContact = async (contactId) => {
  try {
    const contactToRemove = await Contact.findByIdAndDelete(contactId);
    return {
      statusCode: 200,
      message: "Successfully removed contact!",
      removedContact: contactToRemove,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
      yourRequest: body,
    };
  }
};

export {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  switchFavorite,
};
