const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.status(200).send('Data Pokemon');
});


const pokemonRouter = require('./pokemon.api.js');
router.use("/pokemons", pokemonRouter);


module.exports = router;
