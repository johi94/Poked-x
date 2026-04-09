let currentPokemonList = [];
let pokemonCardRef;
let currentOffset = 0;
let limit = 20;
let isLoading = false;
let totalPokemonCount = 0;
let allPokemonNamesCache = null; // used for caching / safe Pokémon names
 
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
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`);
    let responseAsJson = await response.json();

    totalPokemonCount = responseAsJson.count;
    currentPokemonList = await fetchPokemonData(responseAsJson.results);
    
    resetPaginationValues();
    initializeListeners();
    setupLoadMoreButton();

    renderPokemon(currentPokemonList);
  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

function resetPaginationValues() {
  currentOffset = 20;
  limit = 20;
}

function initializeListeners() {
  DialogEventListeners();
  searchEventListener();
}

function setupLoadMoreButton() {
  const loadMoreBtn = document.getElementById("load_more_pokemon");
  if (loadMoreBtn) {
    loadMoreBtn.innerText = "Load more Pokémon";
    loadMoreBtn.onclick = loadMorePokemon;
  }
}

// function for parallel fetching 
// without for-loop -> no waiting time Pokémons are not loading one after another
async function fetchPokemonData(resultsArray) {
  const promises = resultsArray.map(async (item) => {
    const response = await fetch(item.url);
    const dataDetails = await response.json();
    if (dataDetails.id >= 10000) {
      const parts = dataDetails.species.url.split('/');
      dataDetails.id = parts[parts.length - 2];
    }
    dataDetails.description_text = ""; 
    dataDetails.isFullDataLoaded = false; 
    return dataDetails;
  });

  // (Fetch-All-then-Render)
  return await Promise.all(promises);
}

function DialogEventListeners() {
  pokemonCardRef = document.getElementById("open_pokemon_card");
  if (!pokemonCardRef) return;
  pokemonCardRef.addEventListener("cancel", closePokemonCardDialog); // close dialog with ESC
  pokemonCardRef.onclick = (e) => {
    // close by clicking outside of dialog and check if click is not inside
    if (e.target === pokemonCardRef) {
      closePokemonCardDialog();
    }
  };
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

async function openPokemonCardDialog(index) {
  let pokemon = currentPokemonList[index];

  await ensurePokemonDetailsLoaded(pokemon);

  renderPokemonCard(index);
  pokemonCardRef.showModal();
  pokemonCardRef.classList.add("opened");
  document.body.style.overflow = "hidden";
}

async function ensurePokemonDetailsLoaded(pokemon) {
  if (pokemon.isFullDataLoaded) return;

  showSpinner();
  try {
    pokemon.description_text = await getPokemonDescription(pokemon);
    pokemon.isFullDataLoaded = true;
  } catch (error) {
    console.error("Fehler beim Lazy Loading:", error);
    pokemon.description_text = "No description available.";
  } finally {
    hideSpinner();
  }
}

function closePokemonCardDialog() {
    pokemonCardRef.close();
    pokemonCardRef.classList.remove("opened");
    document.body.style.overflow = "visible"; // show scrollbar from body again after dialog is closed
  }

// #end-region open and close dialog (Pokémon-Card)

// #start-region load more Pokémon

// async function loadMorePokemon() {
//   if (isLoading) return;
//   isLoading = true;
//   showSpinner();
//   try {
//     let response = await fetch(
//       `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`,
//     );
//     let responseAsJson = await response.json();
//     let newPokemonData = await fetchPokemonData(responseAsJson.results);
//     currentPokemonList = currentPokemonList.concat(newPokemonData);
//     currentOffset += responseAsJson.results.length;
//     renderNewPokemon(newPokemonData);
//   } catch (error) {
//     console.error("Fehler beim Nachladen:", error);
//   } finally {
//     isLoading = false;
//     hideSpinner();
//   }
// }

async function loadMorePokemon() {
  if (isLoading) return;
  isLoading = true;
  showSpinner();

  try {
    const newPokemonData = await fetchAndProcessNextBatch();
    renderNewPokemon(newPokemonData);
  } catch (error) {
    console.error("Fehler beim Nachladen:", error);
  } finally {
    isLoading = false;
    hideSpinner();
  }
}

async function fetchAndProcessNextBatch() {
  let response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`);
  let responseAsJson = await response.json();
  let newPokemonData = await fetchPokemonData(responseAsJson.results);

  currentPokemonList = currentPokemonList.concat(newPokemonData);
  currentOffset += responseAsJson.results.length;

  return newPokemonData;
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
  if (newIndex < 0) {
    await loadAndShowSinglePokemon(1025);
    return;
  }
  if (newIndex >= 1025) {
    renderPokemonCard(0);
    return;
  }
  if (newIndex < currentPokemonList.length) { 
    await openPokemonCardDialog(newIndex); 
  } else {
    await loadAndShowSinglePokemon(newIndex + 1);
  }
}

async function fetchSinglePokemonData(pokemonId) {
  let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  if (!response.ok) {
    throw new Error(`Pokemon mit ID ${pokemonId} nicht gefunden`);
  }
  let pokemon = await response.json();
  pokemon.description_text = await getPokemonDescription(pokemon);
  return pokemon;
}

async function loadAndShowSinglePokemon(pokemonId) {
  showSpinner();
  try {
    let pokemon = await fetchSinglePokemonData(pokemonId);
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

// #start-region search Pokémon

async function searchPokemon() {
  const inputField = document.getElementById("search_input");
  const messageContainer = document.getElementById("search_message");
  const searchTerm = inputField.value.toLowerCase().trim();

  if (!prepareSearch(searchTerm, messageContainer)) return;

  try {
    await executeSearch(searchTerm, messageContainer);
  } catch (error) {
    console.error("Search failed:", error);
    messageContainer.innerText = "Error during search.";
  } finally {
    hideSpinner();
  }
}

// function enter at least three letters in the search box (input)
function prepareSearch(searchTerm, messageContainer) {
  if (searchTerm.length < 3) {
    messageContainer.innerText = "Please enter at least three letters.";
    return false;
  }
  messageContainer.innerText = "";
  showSpinner();
  return true;
}

// function for searching Pokémon 
async function executeSearch(searchTerm, messageContainer) {
  const foundPokemon = await getFilteredPokemonList(searchTerm);
  if (foundPokemon.length === 0) {
    messageContainer.innerText = "No Pokémon found with these letters.";
  } else {
    currentPokemonList = await fetchPokemonData(foundPokemon.slice(0, 20));
    toggleSearchButton(true);
    renderPokemon(currentPokemonList);
  }
}

// function get names of Pokémon and filter them by their first letters / local cache for names
async function getFilteredPokemonList(searchTerm) {
    // proof: list loaded before?
    if (!allPokemonNamesCache) {
        console.log("Lade Gesamtliste von API..."); // Nur beim ersten Mal
        let response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0");
        let data = await response.json();
        // safe in Cache
        allPokemonNamesCache = data.results;
    } else {
        console.log("Nutze Cache die Suche"); 
    }
    // filter in local list 
    return allPokemonNamesCache.filter(p => p.name.toLowerCase().includes(searchTerm));
}

// function for changing "Load more Pokémon" into "Go back to Pokédex"
function toggleSearchButton(isSearchMode) {
    const loadMoreBtn = document.getElementById("load_more_pokemon");
    if (isSearchMode) {
        loadMoreBtn.innerText = "Go back to Pokédex";
        loadMoreBtn.onclick = resetPokedex;
        loadMoreBtn.style.display = "block";
    } else {
        loadMoreBtn.innerText = "Load more Pokémon";
        loadMoreBtn.onclick = loadMorePokemon;
    }
}

function searchEventListener() {
  const inputField = document.getElementById("search_input");
  const messageContainer = document.getElementById("search_message");

  if (inputField) {
    inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        searchPokemon();
      }
    });

    inputField.addEventListener("input", () => {
      if (messageContainer) {
        messageContainer.innerText = "";
      }
    });
  }
}

function resetPokedex() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    currentOffset = 0;
    limit = 20;
    currentPokemonList = [];
    document.getElementById("search_input").value = "";
    document.getElementById("search_message").innerText = "";
    
    toggleSearchButton(false); 
    fetchDataJsonPokemonDetails();
}

// #end-region search Pokémon