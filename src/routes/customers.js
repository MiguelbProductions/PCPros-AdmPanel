const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/', async (req, res) => {
    const { name, email, phone } = req.body;

    const newCustomer = new Customer({
        name,
        email,
        phone
    });

    try {
        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            id,
            { name, email, phone },
            { new: true, runValidators: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(200).json(updatedCustomer);
    } catch (error) {
        res.status(400).json({ message: 'Error updating contact', error });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCustomer = await Customer.findByIdAndDelete(id);

        if (!deletedCustomer) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact', error });
    }
});

router.get('/export/csv', async (req, res) => {
    try {
        const customers = await Customer.find();
        const fields = ['name', 'email', 'phone'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(customers);
        res.header('Content-Type', 'text/csv');
        res.attachment('contacts.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/export/excel', async (req, res) => {
    try {
        const customers = await Customer.find();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Contacts');

        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 }
        ];

        customers.forEach(customer => {
            worksheet.addRow({
            name: customer.name,
            email: customer.email,
            phone: customer.phone
            });
        });

        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('contacts.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
