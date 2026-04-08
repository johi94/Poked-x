let currentPokemonList = [];
let pokemonCardRef;
let currentOffset = 0;
let limit = 20;
let isLoading = false;
let totalPokemonCount = 0;

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
    let response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`,
    );
    let responseAsJson = await response.json();

    totalPokemonCount = responseAsJson.count;

    let pokemonData = [];

    for (let i = 0; i < responseAsJson.results.length; i++) {
      let pokemonDescriptions = responseAsJson.results[i];
      let responseDetails = await fetch(pokemonDescriptions.url);
      let dataDetails = await responseDetails.json();
      dataDetails.description_text = await getPokemonDescription(dataDetails);
      pokemonData.push(dataDetails);
    }

    console.log("Details aller Pokémon:", pokemonData);

    currentPokemonList = pokemonData;

    currentOffset = 20;
    limit = 10;

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
    document.getElementById("load_more_pokemon").onclick = loadMorePokemon;
    renderPokemon(currentPokemonList);
  } catch (error) {
    console.error("Fehler:", error);
  }
}

async function getPokemonDescription(pokemon) {
  try {
    const response = await fetch(pokemon.species.url);
    const data = await response.json();

    const entry = data.flavor_text_entries.find(
      (e) => e.language.name === "en",
    );

    // replace linebreaks
    return entry
      ? entry.flavor_text.replace(/[\f\n\r]/gm, " ")
      : "No description available.";
  } catch (error) {
    console.error("Error fetching description:", error);
    return "Description could not be loaded.";
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

// #start-region load more Pokémon

async function loadMorePokemon() {
  if (isLoading) return;

  isLoading = true;
  showSpinner();

  try {
    let response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`,
    );
    let responseAsJson = await response.json();

    let newPokemonData = [];

    for (let i = 0; i < responseAsJson.results.length; i++) {
      let pokemonSummary = responseAsJson.results[i];
      let responseDetails = await fetch(pokemonSummary.url);
      let dataDetails = await responseDetails.json();

      dataDetails.description_text = await getPokemonDescription(dataDetails);
      newPokemonData.push(dataDetails);
    }

    currentPokemonList = currentPokemonList.concat(newPokemonData);
    currentOffset += responseAsJson.results.length;

    renderNewPokemon(newPokemonData);
  } catch (error) {
    console.error("Fehler beim Nachladen:", error);
  } finally {
    isLoading = false;
    hideSpinner();
  }
}

function renderNewPokemon(newArray) {
  let content = document.getElementById("content");
  let startIndex = currentPokemonList.length - newArray.length;

  for (let i = 0; i < newArray.length; i++) {
    content.innerHTML += getPokemonTemplate(newArray[i], startIndex + i);
  }
}

function showSpinner() {
  document.getElementById("loading_spinner").style.display = "flex";
  document.getElementById("load_more_pokemon").style.display = "none"; // hide button
}

function hideSpinner() {
  document.getElementById("loading_spinner").style.display = "none";
  document.getElementById("load_more_pokemon").style.display = "block"; // show button again
}

async function changePokemonCard(newIndex) {
  console.log("Wechsle zu Pokémon Nr.:", newIndex + 1);

  if (newIndex < 0) {
    await loadAndShowSinglePokemon(1025);
    return;
  }
  if (newIndex >= 1025) {
    renderPokemonCard(0);
    return;
  }
  if (newIndex < currentPokemonList.length) {
    renderPokemonCard(newIndex);
  } else {
    await loadAndShowSinglePokemon(newIndex + 1);
  }
}

async function loadAndShowSinglePokemon(pokemonId) {
  showSpinner();
  try {
    let response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
    );
    if (!response.ok) {
      throw new Error(
        `Pokemon mit ID ${pokemonId} nicht gefunden (Status: ${response.status})`,
      );
    }
    let pokemon = await response.json();
    pokemon.description_text = await getPokemonDescription(pokemon);
    let pokemonCardContent = document.getElementById("pokemon_card_content");
    pokemonCardContent.innerHTML = getPokemonCardTemplate(
      pokemon,
      pokemonId - 1,
    );
  } catch (error) {
    console.error("Fehler beim Laden des Sprung-Pokemons:", error);

    renderPokemonCard(currentPokemonList.length - 1);
  } finally {
    hideSpinner();
  }
}

// #end-region load more Pokémon
