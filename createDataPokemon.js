const fs = require('fs');
const csv = require('csvtojson');
const { clearScreenDown } = require('readline');

const createPokemon = async () => {
    let count = 0;
    let newData = await csv().fromFile('target.csv');
    newData = new Set(newData.map((e) => {
        if (e.id === e.id) return e;
    }))
    newData = Array.from(newData);
    newData = newData.map((e, index) => {
        count++
        return {
            id: count,
            name: e.Name,
            description: "There is a plant seed on its back right from the day this Pokémon is born. The seed slowly grows larger.",
            height: "3'",
            weight: "15.2. lbs",
            category: "Seed",
            abilities: "Overgrow",
            "types": [
                e.Type1, e.Type2
            ],

            "url": `http://localhost:5000/images/${index + 1}.png`
        }
    })

    let data = JSON.parse(fs.readFileSync('pokemons.json'))
    data.data = newData;
    data.totalPokemons = count;


    fs.writeFileSync("pokemons.json", JSON.stringify(data));

    console.log('newData');
}
createPokemon();