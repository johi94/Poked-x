let currentPokemonList = [];
let pokemonCardRef = document.getElementById("open_pokemon_card");

// #start-region renderPokemon on Website and Dialog (pokemon-card)

function renderPokemon(pokemonArray) {
  let content = document.getElementById("content");
  content.innerHTML = "";

  for (let i = 0; i < pokemonArray.length; i++) {
    let pokemon = pokemonArray[i];

    content.innerHTML += getPokemonTemplate(pokemon, i);
  }
}

function renderPokemonCard(index) {
  let pokemonCardContent = document.getElementById("pokemon_card_content");
  pokemonCardContent.innerHTML = "";

  let pokemon = currentPokemonList[index];

  if (pokemon) {
    pokemonCardContent.innerHTML = getPokemonCardTemplate(pokemon, index);
  }
}

// #end-region renderPokemon on Website and Dialog (pokemon-card)

// #start-region fetch data from API

async function fetchDataJsonPokeApi() {
  try {
    let response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0",
    );
    let responseAsJson = await response.json();

    let pokemonArray = responseAsJson.results;
    let myContent = "";

    for (let i = 0; i < pokemonArray.length; i++) {
      let pokemon = pokemonArray[i];

      myContent += getPokemonTemplate(pokemon, i);
    }

    document.getElementById("content").innerHTML = myContent;
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

    currentPokemonList = pokemonData;

    pokemonCardRef = document.getElementById("open_pokemon_card");

    if (pokemonCardRef) {
      pokemonCardRef.addEventListener("cancel", closePokemonCardDialog); // close dialog with ESC

      pokemonCardRef.addEventListener("click", (e) => {
        // close dialog by clicking outside of dialog
        if (e.target === pokemonCardRef) {
          // don't close dialog by clicking inside of Dialog or Element inside of dialog

          closePokemonCardDialog();
        }
      });
    }

    renderPokemon(currentPokemonList);
  } catch (error) {
    console.error("Fehler:", error);
  }
}

// #end-region fetch data from API

// #start-region open and close dialog (Pokémon-Card)

function openPokemonCardDialog(index) {
  renderPokemonCard(index);

  pokemonCardRef.showModal();
  pokemonCardRef.classList.add("opened");
  document.body.style.overflow = "hidden"; // hide scrollbar from body while dialog opened
}

function closePokemonCardDialog() {
  pokemonCardRef.close();
  pokemonCardRef.classList.remove("opened");
  document.body.style.overflow = "visible"; // show scrollbar from body again after dialog is closed
}

// #end-region open and close dialog (Pokémon-Card)
