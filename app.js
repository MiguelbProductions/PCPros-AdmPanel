const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const Customer = require('./src/models/Customer');
const customersRouter = require('./src/routes/customers');

const servicesRouter = require('./src/routes/services');
const Service = require('./src/models/Service');

const worksRouter = require('./src/routes/works');
const Work = require('./src/models/Work');

const expensesRouter = require('./src/routes/expenses')
const Expense = require('./src/models/Expense');

dotenv.config();

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'SECRETKEY',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://miguellb:maretasp@cluster0.3pius7j.mongodb.net/repairshop',
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }
}));

mongoose.connect('mongodb+srv://miguellb:maretasp@cluster0.3pius7j.mongodb.net/repairshop', {})
.then(() => {
  console.log('Conectado ao MongoDB');
}).catch(err => {
  console.error('Erro ao conectar ao MongoDB', err);
});

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/');
  }
}

app.get('/', (req, res) => {
  if (req.session.user) req.session.user = null

  const error = req.query.error;
  res.render('login.html', { Page: "Login", error });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    req.session.user = { username };
    res.redirect('/works');
  } else {
    const error = username !== process.env.ADMIN_USER ? 'invalid_username' : 'invalid_password';
    res.redirect(`/?error=${error}`);
  }
});

app.get('/works', isAuthenticated, async (req, res) => {
  try {
    const works = await Work.find().populate('customer').populate('services');
    res.render('works.html', { Page: 'Works', works });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/work/add', isAuthenticated, async (req, res) => {
  try {
    const customers = await Customer.find();
    const services = await Service.find();
    res.render('newWork.html', { Page: "New Work", customers, services });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/work/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const work = await Work.findById(req.params.id).populate('customer').populate('services');
    const customers = await Customer.find({});
    const services = await Service.find({});
    res.render('editWork.html', { Page: "Edit Work", work, customers, services });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/services', isAuthenticated, async (req, res) => {
  try {
    const services = await Service.find();
    res.render('services.html', { Page: 'Services', services });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/contacts', isAuthenticated, async (req, res) => {
  try {
    const customers = await Customer.find();
    res.render('contacts.html', { Page: 'Contacts', customers });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/statistics', isAuthenticated, async (req, res) => {
  try {
    const totalWorks = await Work.countDocuments();
    const completedWorks = await Work.countDocuments({ status: { $regex: /^completed$/i } });
    const totalRevenue = await Work.aggregate([
      { $match: { status: { $regex: /^completed$/i } } },
      { $group: { _id: null, total: { $sum: '$valueToCharge' } } }
    ]);
    const worksByStatus = await Work.aggregate([
      {
        $addFields: {
          normalizedStatus: { $concat: [ { $toUpper: { $substrCP: [ "$status", 0, 1 ] } }, { $substrCP: [ "$status", 1, { $subtract: [ { $strLenCP: "$status" }, 1 ] } ] } ] }
        }
      },
      {
        $group: {
          _id: '$normalizedStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    const revenueByMonth = await Work.aggregate([
      { $match: { status: { $regex: /^completed$/i } } },
      {
        $group: {
          _id: {
            month: { $month: { date: '$createdAt', timezone: '+00:00' } },
            year: { $year: { date: '$createdAt', timezone: '+00:00' } }
          },
          total: { $sum: '$valueToCharge' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const worksByEquipmentType = await Work.aggregate([
      {
        $group: {
          _id: '$equipmentType',
          count: { $sum: 1 }
        }
      }
    ]);
    const worksByService = await Work.aggregate([
      { $unwind: '$services' },
      {
        $lookup: {
          from: 'services',
          localField: 'services',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      { $match: { 'serviceDetails.name': { $exists: true, $ne: [] } } },
      {
        $group: {
          _id: '$services',
          serviceName: { $first: { $arrayElemAt: ['$serviceDetails.name', 0] } },
          count: { $sum: 1 },
        }
      }
    ]);
    
    const statistics = {
      totalWorks,
      completedWorks,
      totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0,
      worksByStatus,
      revenueByMonth,
      worksByEquipmentType,
      worksByService
    };

    res.render('statistics.html', { Page: 'Statistics', statistics });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/expenses', isAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.find({}).sort({ date: 1 });
    res.render('expenses.html', { Page: 'Works', expenses });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.use('/api/works', isAuthenticated, worksRouter);
app.use('/api/services', isAuthenticated, servicesRouter);
app.use('/api/customers', isAuthenticated, customersRouter);
app.use('/api/expenses', isAuthenticated, expensesRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
