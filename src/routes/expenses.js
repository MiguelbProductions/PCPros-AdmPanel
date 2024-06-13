const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { Parser } = require('json2csv');
const excelJS = require('exceljs');

// Rota para adicionar nova despesa
router.post('/', async (req, res) => {
  const { description, amount, date, category } = req.body;

  const newExpense = new Expense({
    description,
    amount,
    date,
    category
  });

  try {
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Rota para listar todas as despesas
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para atualizar despesa
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { description, amount, date, category } = req.body;

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { description, amount, date, category },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).send('Despesa não encontrada');
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Rota para deletar despesa
router.delete('/:id', async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

    if (!deletedExpense) {
      return res.status(404).send('Despesa não encontrada');
    }

    res.status(200).json({ message: 'Despesa deletada com sucesso' });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para exportar despesas em CSV
router.get('/export/csv', async (req, res) => {
  try {
    const expenses = await Expense.find();
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(expenses);
    res.header('Content-Type', 'text/csv');
    res.attachment('despesas.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rota para exportar despesas em Excel
router.get('/export/excel', async (req, res) => {
  try {
    const expenses = await Expense.find();
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Despesas');
    worksheet.columns = [
      { header: 'Descrição', key: 'description', width: 30 },
      { header: 'Valor', key: 'amount', width: 10 },
      { header: 'Data', key: 'date', width: 20 },
      { header: 'Categoria', key: 'category', width: 20 },
    ];
    worksheet.addRows(expenses);
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('despesas.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
