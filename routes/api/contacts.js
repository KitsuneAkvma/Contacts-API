import express from "express";
import multer from "multer";

import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  switchFavorite,
} from "../../services/contacts.js";

const router = express.Router();
const upload = multer();

// Get all contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();

    res.status(contacts.statusCode).json(contacts);
    res.status(contacts.statusCode).json(contacts);
  } catch (error) {
    next(error);
  }
});

// Get contact by ID
router.get("/:contactId", async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);

    res.status(contact.statusCode).json(contact);
  } catch (error) {
    next(error);
  }
});

// Create a new contact
router.post("/", upload.none(), async (req, res, next) => {
  try {
    let newContact;
    // flexibility for using raw JSON object and form-data
    if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
      newContact = await addContact(req.body);
    } else {
      newContact = await addContact(req.body);
    }

    newContact === null && res.status(400).json({ error: "Invalid request" });

    res.status(newContact.statusCode).json(newContact);
  } catch (error) {
    next(error);
  }
});

// Update a contact
router.put("/:contactId", upload.none(), async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const providedData = req.body;
    
    let updatedContact;
    if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
      updatedContact = await updateContact(contactId, providedData);
    } else {
      updatedContact = await updateContact(contactId, providedData);
    }
    res.status(updatedContact.statusCode).json(updatedContact);
  } catch (error) {
    next(error);
  }
});
// Switch favorite status of contact

router.patch("/:contactId", upload.none(), async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const providedData = req.body;

    let updatedContact;
    if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
      updatedContact = await switchFavorite(contactId, providedData);
    } else {
      updatedContact = await switchFavorite(contactId, providedData);
    }
    res.status(updatedContact.statusCode).json(updatedContact);
  } catch (error) {
    next(error);
  }
});
// Delete a contact
router.delete("/:contactId", async (req, res, next) => {
  try {
    const removedContact = await removeContact(req.params.contactId);
    res.status(removedContact.statusCode).json(removedContact);
  } catch (error) {
    next(error);
  }
});

export default router;
