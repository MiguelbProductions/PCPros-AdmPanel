const express = require('express');
const Service = require('../models/Service');
const router = express.Router();
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.render('services.html', { Page: 'Services', services });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/', async (req, res) => {
  const { name, price, minPrice, maxPrice, referenceLink, referenceText } = req.body;
  const serviceData = { name, price, minPrice, maxPrice, referenceLink, referenceText };

  try {
    const newService = new Service(serviceData);
    await newService.save();
    res.status(201).send(newService);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, minPrice, maxPrice, referenceLink, referenceText } = req.body;

  try {
    const updatedService = await Service.findByIdAndUpdate(id, {
      name,
      price,
      minPrice,
      maxPrice,
      referenceLink,
      referenceText,
    }, { new: true });

    if (!updatedService) {
      return res.status(404).send('Service not found');
    }

    res.status(200).send(updatedService);
  } catch (error) {
    res.status(400).send(error.message);
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/export/csv', async (req, res) => {
  try {
    const services = await Service.find();
    const fields = ['name', 'price', 'minPrice', 'maxPrice', 'referenceLink', 'referenceText'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(services);
    res.header('Content-Type', 'text/csv');
    res.attachment('services.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/export/excel', async (req, res) => {
  try {
    const services = await Service.find();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Services');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Min Price', key: 'minPrice', width: 15 },
      { header: 'Max Price', key: 'maxPrice', width: 15 },
      { header: 'Reference Link', key: 'referenceLink', width: 30 },
      { header: 'Reference Text', key: 'referenceText', width: 30 }
    ];

    services.forEach(service => {
      worksheet.addRow({
        name: service.name,
        price: service.price,
        minPrice: service.minPrice,
        maxPrice: service.maxPrice,
        referenceLink: service.referenceLink,
        referenceText: service.referenceText
      });
    });

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('services.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
