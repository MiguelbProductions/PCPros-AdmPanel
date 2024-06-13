const express = require('express');
const Work = require('../models/Work');
const Customer = require('../models/Customer');
const router = express.Router();
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const Expense = require('../models/Expense');

router.post('/', async (req, res) => {
  const { customer, equipmentType, equipmentModel, equipmentPassword, services, valueToCharge, status, priority } = req.body;

  try {
    var customerObj = await Customer.findById(customer);

    if (!customer) {
      return res.status(404).send("Cliente não encontrado");
    }

    const workData = { customer: customerObj, equipmentType, equipmentModel, equipmentPassword, services, valueToCharge, status, priority };

    const newWork = new Work(workData);
    await newWork.save();
    res.redirect('/works');
  } catch (error) {
    console.log(error.message)
    res.status(400).send(error.message);
  }
});

router.put('/:id/status', async (req, res) => {
  const { status, description, amount, category } = req.body;

  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).send("Work not found");
    }

    work.status = status;

    work.priority = work.priority.charAt(0).toUpperCase() + work.priority.slice(1).toLowerCase()
    work.status = work.status.charAt(0).toUpperCase() + work.status.slice(1).toLowerCase()
    work.equipmentType = work.equipmentType.charAt(0).toUpperCase() + work.equipmentType.slice(1).toLowerCase()
    
    await work.save();

    if (status.toLowerCase() === 'payed') {
      const expenseData = {
        description,
        amount,
        category
      };

      const newExpense = new Expense(expenseData);
      await newExpense.save();
    }

    res.send();
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).send(error.message);
  }
});


router.put('/:id', async (req, res) => {
  const { customer, equipmentType, equipmentModel, equipmentPassword, services, valueToCharge, status, priority } = req.body;
  console.log(customer, equipmentType, equipmentModel, equipmentPassword, services, valueToCharge, status, priority)

  try {
    const customerObj = await Customer.findById(customer);

    if (!customerObj) {
      return res.status(404).send("Cliente não encontrado");
    }

    const workData = {
      customer: customerObj,
      equipmentType,
      equipmentModel,
      equipmentPassword,
      services,
      valueToCharge,
      status,
      priority
    };
    
    await Work.findByIdAndUpdate(req.params.id, workData, { new: true });

    res.send();
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Work.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/export/csv', async (req, res) => {
  try {
    const works = await Work.find().populate('customer');
    const fields = ['customer.name', 'equipmentType', 'equipmentModel', 'equipmentPassword', 'services', 'valueToCharge', 'status', 'priority'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(works);
    res.header('Content-Type', 'text/csv');
    res.attachment('works.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/export/excel', async (req, res) => {
  try {
    const works = await Work.find().populate('customer');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Works');

    worksheet.columns = [
      { header: 'Customer', key: 'customer', width: 30 },
      { header: 'Equipment Type', key: 'equipmentType', width: 20 },
      { header: 'Equipment Model', key: 'equipmentModel', width: 20 },
      { header: 'Equipment Password', key: 'equipmentPassword', width: 20 },
      { header: 'Services', key: 'services', width: 30 },
      { header: 'Value to Charge', key: 'valueToCharge', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Priority', key: 'priority', width: 15 }
    ];

    works.forEach(work => {
      worksheet.addRow({
        customer: work.customer.name,
        equipmentType: work.equipmentType,
        equipmentModel: work.equipmentModel,
        equipmentPassword: work.equipmentPassword,
        services: work.services,
        valueToCharge: work.valueToCharge,
        status: work.status,
        priority: work.priority
      });
    });

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('works.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
