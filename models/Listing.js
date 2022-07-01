const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
mongoose.pluralize(null);

const ListingSchema = new Schema({
  shop_id: String,
  listing_id: String,
  title: String,
  description: String,
  quantity: Number,
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Listing = mongoose.model("Listing", ListingSchema);

module.exports = Listing;
