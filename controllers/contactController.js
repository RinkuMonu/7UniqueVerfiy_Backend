const contectModel = require('../models/contactModel')


class ContactController {
    async createContact(data) {
        try {
            const { name, contact, email, message } = data;

            if (!name || !contact || !email || !message) {
                return ({
                    msg: 'Please fill all required fields',
                    status: 0,
                });
            }

            const newContact = new contectModel({
                name,
                contact,
                email,
                message,
            });

            await newContact.save();
            return ({
                msg: 'Contact form submitted successfully',
                status: 1,
            });
        } catch (error) {
            console.error('Contact creation error:', error);
            return ({
                msg: 'Internal server error',
                status: 0,
            });
        }
    }

    async readContact(query) {
        try {
            if (query.filter) {
                const contact = await contectModel.find({ seen: query.filter }).sort({ createdAt: -1 })
                return ({
                    contact,
                    status: 1,
                });
            }
            const contact = await contectModel.find().sort({ createdAt: -1 })
            return ({
                contact,
                status: 1,
            });
        } catch (error) {
            console.error('error:', error);
            return ({
                msg: 'Internal server error',
                status: 0,
            });
        }
    }

    // statusChange part
    statusChange(query) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    if (query.id) {
                        const contact = await contectModel.findById(query.id)
                        await contectModel.updateOne(
                            {
                                _id: query.id
                            }, {
                            $set: {
                                seen: !contact.seen
                            }
                        }
                        ).then(
                            () => {
                                resolve({
                                    msg: 'save',
                                    status: 1
                                })
                            }
                        ).catch(
                            () => {
                                reject({
                                    msg: 'status not change',
                                    status: 0
                                })
                            }
                        )
                    }
                } catch (error) {
                    reject({
                        msg: 'Internal server error',
                        status: 0
                    })
                }
            }
        )
    }

    // delete part
    delete(query) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    if (query.id) {
                        await contectModel.deleteOne(
                            {
                                _id: query.id
                            }
                        ).then(
                            () => {
                                resolve({
                                    msg: 'Deleted',
                                    status: 1
                                })
                            }
                        ).catch(
                            () => {
                                reject({
                                    msg: 'not deleted',
                                    status: 0
                                })
                            }
                        )
                    }
                } catch (error) {
                    reject({
                        msg: 'Internal server error',
                        status: 0
                    })
                }
            }
        )
    }

}

module.exports = ContactController;
