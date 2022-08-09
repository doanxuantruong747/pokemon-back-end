const exprees = require("express")
const routes = exprees.Router()
const fs = require("fs")
//const crypto = require("crypto")


routes.get("", (req, res, next) => {
    const allowedFilter = [
        "name",
        "types",
        "id",
        "url",
        "page",
        "limit",
        "search"
    ];
    try {
        let { page, limit, search, type, ...filterQuery } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;

        const filterKeys = Object.keys(filterQuery);
        filterKeys.forEach((key) => {

            if (!allowedFilter.includes(key)) {
                const exception = new Error(`Query ${key} is not allowed`);
                exception.statusCode = 401;
                throw exception;
            }
            if (!filterQuery[key]) delete filterQuery[key];
        });

        // logic
        let offset = limit * (page - 1);

        //Read data from db.json then parse to JSobject
        let db = fs.readFileSync("pokemons.json", "utf-8");
        db = JSON.parse(db);
        const { data } = db;

        let result = [];

        if (filterKeys.length) {
            filterKeys.forEach((condition) => {

                result = result.length
                    ? result.filter((pokemon) => pokemon[condition] === filterQuery[condition])
                    : data.filter((pokemon) => pokemon[condition] === filterQuery[condition]);
            });
        } else {
            result = data;
        }

        //Search Pokémons by Type
        if (type) {
            result = result.filter((e) => {
                if (e.types[0].toLowerCase().includes(type.toLowerCase()) || e.types[1].toLowerCase().includes(type.toLowerCase()))
                    return e;
            })
        }
        // Search Pokémons by Name
        if (search) {
            result = result.filter((e) => {
                if (e.name.toLowerCase().includes(search.toLowerCase()))
                    return e;
            })
        }

        //then select number of result by offset
        result = result.slice(offset, offset + limit);

        //send response
        res.status(200).send(result)
    } catch (error) {
        next(error.message)
    }
})

routes.get("/:id", async (req, res, next) => {
    let { id } = req.params
    id = Number(id)
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("pokemons.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;
    let result = data

    //create db detail
    let dbDetail = {
        pokemon: {},
        previousPokemon: {},
        nextPokemon: {},
    }

    // logic
    let last = result[result.length - 1]
    let first = result[0]

    result.forEach((pokemon) => {
        if (id === pokemon.id)
            dbDetail = { ...dbDetail, pokemon: pokemon };
        if (id === first.id ? (pokemon.id) : (pokemon.id === id - 1))
            dbDetail = { ...dbDetail, previousPokemon: pokemon };
        if ((id === last.id) ? (pokemon.id === last.id - id + 1) : (pokemon.id === id + 1))
            dbDetail = { ...dbDetail, nextPokemon: pokemon };
    });

    //get send response
    res.status(200).send(dbDetail);
})

routes.post("", (req, res, next) => {
    //post input validation
    try {
        const { name, types, id, url } = req.body;
        if (!name || !types || !id || !url) {
            const exception = new Error(`Missing body info`);
            exception.statusCode = 401;
            throw exception;
        }
        //post processing parseFloat(types)
        const newPokemon = {
            name, types, id: parseInt(id), url
        };

        let pokemonTypes = [
            "bug", "dragon", "fairy", "fire", "ghost",
            "ground", "normal", "psychic", "steel", "dark",
            "electric", "fighting", "flyingText", "grass", "ice",
            "poison", "rock", "water"
        ]
        //Read data from db.json then parse to JSobject
        let db = fs.readFileSync("pokemons.json", "utf-8");
        db = JSON.parse(db);
        const { data } = db;

        // check Pokémon already exists
        if (data.forEach((pokemon) => {
            if (pokemon.id === newPokemon.id) {
                const exception = new Error(`The ID Pokémon already exists `);
                exception.statusCode = 401;
                throw exception;
            }
            if (pokemon.name === newPokemon.name) {
                const exception = new Error(`The name Pokémon already exists`);
                exception.statusCode = 401;
                throw exception;
            }
        })) return;

        // check Pokémon’s type is invalid
        // let index0 = newPokemon.types[0] ? newPokemon.types[0].toLowerCase() : null
        // let index1 = newPokemon.types[1] ? newPokemon.types[1].toLowerCase() : index0
        // let newPokemonType = [index0, index1]

        // const isSubset = (array1, array2) => array2.every((element) => array1.includes(element));

        // if ((isSubset(pokemonTypes, newPokemonType) === false) ||
        //     (newPokemon.types.length === 0)
        // ) {
        //     const exception = new Error(`Pokémon’s type is invalid`);
        //     exception.statusCode = 401;
        //     throw exception;
        // }

        //Add new pokemon to book JS object
        data.push(newPokemon)

        //Add new pokemon to db JS object
        db.data = data
        //db JSobject to JSON string
        db = JSON.stringify(db)
        //write and save to db.json
        fs.writeFileSync("pokemons.json", db)

        //post send response
        res.status(200).send(newPokemon)

    } catch (error) {
        next(error)
    }
})

routes.put("/:id", (req, res, next) => {
    //put input validation
    try {
        const allowUpdate = ["name", "types", "id", "url"]

        const { id } = req.params

        const updates = req.body
        const updateKeys = Object.keys(updates)
        //find update request that not allow
        const notAllow = updateKeys.filter(el => !allowUpdate.includes(el));

        if (notAllow.length) {
            const exception = new Error(`Update field not allow`);
            exception.statusCode = 401;
            throw exception;
        }

        //put processing
        //Read data from db.json then parse to JSobject
        let db = fs.readFileSync("pokemons.json", "utf-8");
        db = JSON.parse(db);
        const { data } = db;
        //find pokemon by id
        const targetIndex = data.findIndex(pokemon => pokemon.id === Number(id))
        if (targetIndex < 0) {
            const exception = new Error(`pokemon not found`);
            exception.statusCode = 404;
            throw exception;
        }
        //Update new content to db pokemon JS object
        const updatedPokemon = { ...db.data[targetIndex], ...updates }
        db.data[targetIndex] = updatedPokemon

        //db JSobject to JSON string
        db = JSON.stringify(db)

        //write and save to db.json
        fs.writeFileSync("pokemons.json", db)


        //put send response
        res.status(200).send(updatedPokemon)
    } catch (error) {
        next(error)
    }
})

routes.delete("/:id", (req, res, next) => {
    try {
        const { id } = req.params

        //delete processing
        //Read data from db.json then parse to JSobject
        let db = fs.readFileSync("pokemons.json", "utf-8");
        db = JSON.parse(db);
        const { data } = db;
        //find pokemon by id
        const targetIndex = data.findIndex(pokemon => pokemon.id === Number(id))
        if (targetIndex < 0) {
            const exception = new Error(`pokemon not found`);
            exception.statusCode = 404;
            throw exception;
        }

        //filter db pokemon object
        db.data = data.filter(pokemon => pokemon.id !== Number(id))
        //db JSobject to JSON string
        db = JSON.stringify(db)

        //write and save to db.json
        fs.writeFileSync("pokemons.json", db)


        //delete send response
        res.status(200).send({})
    } catch (error) {
        next(error)
    }
})

module.exports = routes;
