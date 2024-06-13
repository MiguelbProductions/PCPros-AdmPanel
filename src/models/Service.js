const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: function() { return this.minPrice == null && this.maxPrice == null; } },
  minPrice: { type: Number, required: function() { return this.price == null; } },
  maxPrice: { type: Number, required: function() { return this.price == null; } },
  referenceLink: { type: String },
  referenceText: { type: String } 
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
