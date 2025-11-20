const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios").default;
const mongoose = require("mongoose");

const Favorite = require("./models/favorite");

const app = express();
const test = "hello";

app.use(bodyParser.json());

app.get("/favorites", async (_req, res) => {
  const favorites = await Favorite.find();
  res.status(200).json({
    favorites: favorites,
  });
});

app.post("/favorites", async (req, res) => {
  const favName = req.body.name;
  const favType = req.body.type;
  const favUrl = req.body.url;

  try {
    if (favType !== "movie" && favType !== "character") {
      throw new Error('"type" should be "movie" or "character"!');
    }
    const existingFav = await Favorite.findOne({ name: favName });
    if (existingFav) {
      throw new Error("Favorite exists already!");
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  const favorite = new Favorite({
    name: favName,
    type: favType,
    url: favUrl,
  });

  try {
    await favorite.save();
    res
      .status(201)
      .json({ favorite: favorite.toObject(), message: "Favorite saved!" });
  } catch (_error) {
    res.status(500).json({ message: "Something went wrong." });
  }
});

app.get("/movies", async (_req, res) => {
  try {
    const response = await axios.get("https://swapi.dev/api/films");
    res.status(200).json({ movies: response.data });
  } catch (_error) {
    res.status(500).json({ message: "Something went wrong." });
  }
});

app.get("/people", async (_req, res) => {
  try {
    const response = await axios.get("https://swapi.dev/api/people");
    res.status(200).json({ people: response.data });
  } catch (_error) {
    res.status(500).json({ message: "Something went wrong." });
  }
});

app.listen(4000);

// mongoose.connect(
//   "mongodb://mongodb:27017/swfavorites",
//   { useNewUrlParser: true },
//   (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       app.listen(8080);
//     }
//   }
// );
