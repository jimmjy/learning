const { Schema, model } = require("mongoose");

const favoriteSchema = new Schema({
  name: String,
  type: String, // 'movie' | 'character'
  url: String,
});

const Favorite = model("Favorite", favoriteSchema);

module.exports = Favorite;
