function renderPokemon(pokemonArray) {
    let content = document.getElementById('content');
    content.innerHTML = ""; // Vorher leeren, damit nichts doppelt erscheint

    for (let i = 0; i < pokemonArray.length; i++) {
        let pokemon = pokemonArray[i];

        content.innerHTML += getPokemonTemplate(pokemon, i);
    }
}


// #start-region fetch data from API

async function fetchDataJsonPokeApi() {
    try {
        let response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0");
        let responseAsJson = await response.json();

        let pokemonArray = responseAsJson.results;
        let myContent = "";

        for (let i = 0; i < pokemonArray.length; i++) {
            let pokemon = pokemonArray[i];

            myContent += getPokemonTemplate(pokemon, i);
        }

        document.getElementById('content').innerHTML = myContent;
    } catch (error) {
        console.error("Anzeigefehler:", error);
    }
}


async function fetchDataJsonPokemonDetails() {
    try {
        let response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
        let responseAsJson = await response.json();

        let pokemonData = [];

        for (let i = 0; i < responseAsJson.results.length; i++) {
            let pokemonDescriptions = responseAsJson.results[i];

            let responseDetails = await fetch(pokemonDescriptions.url);
            let dataDetails = await responseDetails.json();
            
            pokemonData.push(dataDetails);
        }

        console.log("Details aller Pokémon:", pokemonData);

        renderPokemon(pokemonData);

    }
    catch (error) {
        console.error("Fehler:", error);
}
}