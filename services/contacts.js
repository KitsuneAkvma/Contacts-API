import { Contact } from "../models/models.js";
import mongoose from "mongoose";

const listContacts = async (req) => {
  try {
    const user = req.user;
    const { page = 1, limit = 20 } = req.query;
    const filters = {};
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== "page" && key !== "limit") {
        filters[key] = value;
      }
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const allContacts = await Contact.find({ owner: user._id, ...filters });

    const pageContacts = allContacts.slice(startIndex, endIndex);
    const totalContacts = allContacts.length;
    const totalPages = Math.ceil(allContacts.length / limit);

    if (allContacts) {
      return {
        statusCode: 200,
        message: "Successfully found contacts list!",
        data: {
          totalContacts,
          page: Number(page),
          perPage: Number(limit),
          totalPages,
          filters,
          contacts: pageContacts,
        },
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

const getContactById = async (contactId, userId) => {
  try {
    const contact = await Contact.findOne({
      _id: contactId,
      owner: userId,
    });

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

const addContact = async (req) => {
  try {
    const { name, email, phone } = req.body;

    // Check if a contact with the same name, email, or phone number already exists
    const existingContact = await Contact.findOne({
      $and: [
        { $or: [{ name }, { email }, { phone }] },
        { owner: new mongoose.Types.ObjectId(req.user._id) },
      ],
    });

    if (existingContact) {
      return {
        statusCode: 409,
        message:
          "A contact with this name, email, or phone number already exists",
        yourRequest: req.body,
        conflictingContact: existingContact,
      };
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      owner: new mongoose.Types.ObjectId(req.user._id),
    });

    await newContact.save();

    return {
      statusCode: 201,
      message: "Successfully added contact!",
      yourRequest: req.body,
      newContact,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
      yourRequest: req.body,
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

    await Contact.findByIdAndUpdate(contactId, updatedContact, {
      runValidators: true,
      new: true,
    });

    return {
      statusCode: 200,
      message: "Successfully updated contact!",
      updatedContact,
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
        updatedContact,
      };
    } else {
      return {
        statusCode: 200,
        message: "Successfully removed contact from favorites",
        updatedContact,
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
const removeContact = async (contactId) => {
  try {
    const contactToRemove = await Contact.findByIdAndDelete(contactId);
    if (!contactToRemove) {
      return { statusCode: 404, message: "Contact not found" };
    }
    return {
      statusCode: 200,
      message: "Successfully removed contact!",
      removedContact: contactToRemove,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "An error occurred!",
      error: error.message,
      yourRequest: { contactId },
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
