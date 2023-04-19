import express from "express";

import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  switchFavorite,
} from "../../services/contacts.js";

const router = express.Router();

// Get all contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();

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
router.post("/", async (req, res, next) => {
  try {
    const newContact = await addContact(req.body);

    newContact === null && res.status(400).json({ error: "Invalid request" });

    res.status(newContact.statusCode).json(newContact);
  } catch (error) {
    next(error);
  }
});

// Update a contact
router.put("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const providedData = req.body;

    let updatedContact;

    updatedContact = await updateContact(contactId, providedData);

    res.status(updatedContact.statusCode).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

// Update favorite status of contact
router.patch("/:contactId", async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const providedData = req.body;

    let updatedContact;

    updatedContact = await switchFavorite(contactId, providedData);

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
