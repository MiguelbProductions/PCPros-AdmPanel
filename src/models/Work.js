const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  equipmentType: { type: String, enum: ['Laptop', 'Pc', 'Phone'], required: true },
  equipmentModel: { type: String, required: true },
  equipmentPassword: { type: String, required: false },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }],
  valueToCharge: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'InProgress', 'Completed', 'Payed'], required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const Work = mongoose.model('Work', workSchema);

module.exports = Work;
