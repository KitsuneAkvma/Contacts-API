import express from "express";

import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  switchFavorite,
} from "../../services/contacts.js";
import { authentication } from "../../services/middleware.js";

const router = express.Router();

// Get all contacts
router.get("/", authentication, async (req, res, next) => {
  try {
    const contacts = await listContacts(req);

    res.status(contacts.statusCode).json(contacts);
  } catch (error) {
    res.status(error.statusCode).json(error);
    next(error);
  }
});

// Get contact by ID
router.get("/:contactId", authentication, async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId, req.user._id);

    res.status(contact.statusCode).json(contact);
  } catch (error) {
    res.status(error.statusCode).json(error);
    next(error);
  }
});

// Create a new contact
router.post("/", authentication, async (req, res, next) => {
  try {
    const newContact = await addContact(req);

    newContact === null && res.status(400).json({ error: "Invalid request" });

    res.status(newContact.statusCode).json(newContact);
  } catch (error) {
    res.status(error.statusCode).json(error);
    next(error);
  }
});

// Update a contact
router.put("/:contactId", authentication, async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const providedData = req.body;

    const updatedContact = await updateContact(contactId, providedData);

    res.status(updatedContact.statusCode).json(updatedContact);
  } catch (error) {
    res.status(error.statusCode).json(error);
    next(error);
  }
});

// Update favorite status of contact
router.patch("/:contactId", authentication, async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const providedData = req.body;

    const updatedContact = await switchFavorite(contactId, providedData);

    res.status(updatedContact.statusCode).json(updatedContact);
  } catch (error) {
    res.status(error.statusCode).json(error);
    next(error);
  }
});

// Delete a contact
router.delete("/:contactId", authentication, async (req, res, next) => {
  try {
    const removedContact = await removeContact(req.params.contactId);
    res.status(removedContact.statusCode).json(removedContact);
  } catch (error) {
    res.status(error.statusCode).json(error);
    next(error);
  }
});

export default router;
