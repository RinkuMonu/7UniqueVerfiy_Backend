const express = require('express');
const ContactController = require('../controllers/contactController');

const contectRouter = express.Router();


// POST /contact/create — create a new contact
contectRouter.post('/create', async (req, res) => {
    const result = new ContactController().createContact(req.body).then(
        (success) => {
            res.send(success);
        }
    ).catch(
        (error) => {
            res.send(error);
        }
    )
});

// read part
contectRouter.get('/read', async (req, res) => {
    const result = new ContactController().readContact(req.query).then(
        (success) => {
            res.send(success);
        }
    ).catch(
        (error) => {
            res.send(error);
        }
    )
});

// statusChange part
contectRouter.patch('/status-change', async (req, res) => {
    const result = new ContactController().statusChange(req.query).then(
        (success) => {
            res.send(success);
        }
    ).catch(
        (error) => {
            res.send(error);
        }
    )
})

// delete part
contectRouter.delete('/delete', async (req, res) => {
    const result = new ContactController().delete(req.query).then(
        (success) => {
            res.send(success);
        }
    ).catch(
        (error) => {
            res.send(error);
        }
    )
})

module.exports = contectRouter;
