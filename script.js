let currentPokemonList = [];           // safe current loaded Pokémon / used for render Pokémon-card and dialog
let pokemonCardRef;                   // used for opening and closing dialog / safes reference on HTML-Element <dialog>
let currentOffset = 0;               // counter for how many Pokémon are loaded at this moment/ tells API where to load the next batch of Pokémon 
let limit = 20;                     // tells how many Pokémon  get loaded from API
let isLoading = false;             // Boolean -> it's not possible to click Load more Pokémon more then once while loading new ones
let totalPokemonCount = 0;        // information how many Pokémon are inside the Pokédex
let allPokemonNamesCache = null; // used for caching / safe Pokémon names / no need to ask the API every time for the names
let isSearchActive = false;     // User is inside Pokédex or search-mode / <button> is "Load More Pokémon" or "Go back to Pokedex"
let filteredPokemonList = [];  // after executeSearch dis empty Array is filled

// #start-region renderPokemon on Website and Dialog (pokemon-card)

function renderPokemon(pokemonArray) {
  let content = document.getElementById("content");          // get container from HTML
  content.innerHTML = "";                                   // empty container / content is not displayed more then once
  for (let i = 0; i < pokemonArray.length; i++) {          // loop over the Pokémon that are loaded inthis moment
    let pokemon = pokemonArray[i];                        // safes Pokémon in variable Pokémon
    content.innerHTML += getPokemonTemplate(pokemon, i); // get template-function to add informations about the Pokémon to the container
  }
}

// function renderPokemonCard(index) {
//   let pokemonCardContent = document.getElementById("pokemon_card_content"); 
//   pokemonCardContent.innerHTML = "";
//   let pokemon = currentPokemonList[index];                                    // gets data from current Pokémon list with Index
//   if (pokemon) {                                                             // if asks if Pokémon is existing at this Index
//     pokemonCardContent.innerHTML = getPokemonCardTemplate(pokemon, index);  // adds informations to dialog-container
//   }
// }

function renderPokemonCard(index) {
  let pokemonCardContent = document.getElementById("pokemon_card_content"); 
  pokemonCardContent.innerHTML = "";
  let listToUse = isSearchActive ? filteredPokemonList : currentPokemonList;
  let pokemon = listToUse[index];
  if (pokemon) {
    pokemonCardContent.innerHTML = getPokemonCardTemplate(pokemon, index);
  }
}

// #end-region renderPokemon on Website and Dialog (pokemon-card)

// #start-region fetch data from API

async function fetchDataJsonPokeApi() {
  try {                                                                // try: if an error occurs -> skip to catch (error)
    let response = await fetch(                                       // contacts API server -> await pauses code until server sends response
      "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0", 
    );
    let responseAsJson = await response.json();                     // change data from server into readable JS Object
    let pokemonArray = responseAsJson.results;                     // access into results -> contains names and URLs of Pokémon
    let myContent = "";                                           // empty string to store generated HTML from Pokémon cards
    for (let i = 0; i < pokemonArray.length; i++) {              // loops through Pokémon in fetched array
      let pokemon = pokemonArray[i];
      myContent += getPokemonTemplate(pokemon, i);              // generates HTML for each Pokémon and adds it to myContent
    }
    document.getElementById("content").innerHTML = myContent;  // is executet if try fetch data fails 
  } catch (error) {
    console.error("loading error:", error);                   // error logged out in console
  }
}

// function to clear all the content from the page / no Pokémon card is shown
function clearContent() {
    const content = document.getElementById("content");
    if (content) content.innerHTML = "";
}

// if page fails fetching data from API this function calls text from template: getErrorLoadingTemplate();
function renderErrorMessage() {
    const content = document.getElementById("content");
    if (content) content.innerHTML = getErrorLoadingTemplate();
}

// function to control when the Load More Pokémon button is visible
function setLoadMoreButtonVisibility(isVisible) {
    const btn = document.getElementById("load_more_pokemon");
    if (btn) {
        btn.style.display = isVisible ? "block" : "none";  // if isVisible is true -> CSS diplay: block; (Button is visible)
    }                                                     //  if isVisible is false -> CSS display: none; (Button is hidden)
}

async function loadAndProcessPokemonData() {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`;  // creates address for request / how many Pokémon and where to start
  const response = await fetch(url);                                                       
  const responseAsJson = await response.json();

  totalPokemonCount = responseAsJson.count;                                             // API tells how many Poké exist in total
  currentPokemonList = await fetchPokemonData(responseAsJson.results);                 // first API call obtain names and links -> fetchPokémonData calls more informations

  resetPaginationValues();
  initializeListeners();
  setupLoadMoreButton();
  renderPokemon(currentPokemonList);
}

async function fetchDataJsonPokemonDetails() {
  showSpinner();                                              // loading screen is shown
  clearContent();
  setLoadMoreButtonVisibility(false);                        // load more button is hidden while loading is in progress
  try {
    await loadAndProcessPokemonData();                      // wait for data from this function before moving on with code
  } catch (error) {
    console.error("error while loading:", error);
    renderErrorMessage();                                  // shows Error Message on screen in case of loading was not possible
  } finally {
    hideSpinner();                                        // finally: loading spinner gets removed, no matter what happend before
  }
}

function resetPaginationValues() {
  currentOffset = 20;                                 // tells web page to get the next batch of Pokémon after number 20
  limit = 20;                                        // "asks" API to send 20 more Pokémon after click on load more
}

function initializeListeners() {                   // help function for initializing event-listeners
  DialogEventListeners();
  searchEventListener();
}

function setupLoadMoreButton() {
  const loadMoreBtn = document.getElementById("load_more_pokemon");  // Code search for Button with this ID
  if (loadMoreBtn) {                                                // safety-check -> Does Button really exist?
    loadMoreBtn.innerText = "Load more Pokémon";                   // sets the text inside of the button / also reset if Go back to Pokédex was shown before after a search
    loadMoreBtn.onclick = loadMorePokemon;                        // on click function loadMorePokemon starts
  }
}

// function for parallel fetching / fetches images and statistics
// without for-loop -> no waiting time Pokémons are not loading one after another
async function fetchPokemonData(resultsArray) {
  const promises = resultsArray.map(async (item) => {         // transformation of an array with Pokémon into array of promises
    const response = await fetch(item.url);                  // fetches specific URL for one Pokémom
    const dataDetails = await response.json();
    if (dataDetails.id >= 10000) {                          // fix for Pokémon transformations with a Pokédexnumber over 10000
      const parts = dataDetails.species.url.split("/");    // changes Pokédex ID into ID from Original Pokémon out of species.url
      dataDetails.id = parts[parts.length - 2];           // grabs correct ID number 
    }
    dataDetails.description_text = "";                   // slot opend for a description text
    dataDetails.isFullDataLoaded = false;               // tells basic statistics are existing but desprition text is not
    return dataDetails;
  });

  // (Fetch-All-then-Render)
  return await Promise.all(promises);                // waits for all Pokémon to be fetched then renders them
}

// function to obtain description text for each Pokémon
async function getPokemonDescription(pokemon) {
  try {
    const response = await fetch(pokemon.species.url);
    const data = await response.json();
    const entry = data.flavor_text_entries.find(        // search for description in english
      (e) => e.language.name === "en",
    );
    return entry
      ? entry.flavor_text.replace(/[\f\n\r]/gm, " ")  // replace linebreaks from invisible characters
      : "No description available.";
  } catch (error) {
    console.error("Error fetching description:", error);
    return "Description could not be loaded.";
  }
}

// #end-region fetch data from API

// #start-region open and close dialog (Pokémon-Card)

// async function openPokemonCardDialog(index) {
//   let pokemon = currentPokemonList[index];

//   await ensurePokemonDetailsLoaded(pokemon);       // if details of Pokémon aren't loaded code waits here so the informations are loaded

//   renderPokemonCard(index);
//   pokemonCardRef.showModal();
//   pokemonCardRef.classList.add("opened");
//   document.body.style.overflow = "hidden";       // scrollbar is not useable while dialog is open
// }

async function openPokemonCardDialog(index) {
  let listToUse = isSearchActive ? filteredPokemonList : currentPokemonList;
  let pokemon = listToUse[index];
  await ensurePokemonDetailsLoaded(pokemon);
  renderPokemonCard(index); 
  pokemonCardRef.showModal();
  pokemonCardRef.classList.add("opened");
  document.body.style.overflow = "hidden";
}

async function ensurePokemonDetailsLoaded(pokemon) {
  if (pokemon.isFullDataLoaded) return;                                 // if details are loaded return iimediately
  try {
    pokemon.description_text = await getPokemonDescription(pokemon);   // if not get the missing details here
    pokemon.isFullDataLoaded = true;
  } catch (error) {
    console.error("error while lazy loading:", error);
    pokemon.description_text = "No description available.";
  }
}

function closePokemonCardDialog() {
  pokemonCardRef.close();
  pokemonCardRef.classList.remove("opened");
  document.body.style.overflow = "visible"; // show scrollbar from body again after dialog is closed
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

// #end-region open and close dialog (Pokémon-Card)

// #start-region load more Pokémon

function updateContentAndScroll(previousContent, newData, lastIndex) {
  const content = document.getElementById("content");
  content.innerHTML = previousContent;                                        // puts previously loaded Pokémon back in place after loading spinner was shown as loading screen
  renderNewPokemon(newData);                                                 // new batch of Pokémon are getting added to the list
  
  const firstNewCard = content.children[lastIndex];                         // lastIndex presenting how many Pokémon where shown before / search in children container lastIndex
  if (firstNewCard) {
    firstNewCard.scrollIntoView({ behavior: "smooth", block: "start" });   // scrools smoothly into new batch of Pokémon
  }
}

function prepareLoadingState() {
  const previousContent = document.getElementById("content").innerHTML;  // saves current HTML
  const lastIndex = currentPokemonList.length;                          // records how many Pokémon are currently loaded
  document.getElementById("content").innerHTML = "";
  showSpinner();                                                       // displays loading screen
  return { previousContent, lastIndex };                              // sends back batch of Pokémon previously loaded and the new loaded ones
}

async function loadMorePokemon() {
  if (isLoading) return;                                                  // prevents double clicking Load More Pokémon button
  isLoading = true;
  const { previousContent, lastIndex } = prepareLoadingState();
  try {
    const newPokemonData = await fetchAndProcessNextBatch();             // gets next batch of Pokémon out of trhe API
    hideSpinner();
    updateContentAndScroll(previousContent, newPokemonData, lastIndex); // puts old Pokémon back into content container and adds the new ones
  } catch (error) {
    console.error("Fehler beim Nachladen:", error);
    document.getElementById("content").innerHTML = previousContent;   // if an error is occuring the page is not blank, it stays with the Pokémon that where loaded before
    hideSpinner();
  } finally {
    isLoading = false;                                               // isLoading reset -> so more Pokémon can be loaded
  }
}

async function fetchAndProcessNextBatch() {
  let response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`,  // get next 20 Pokémon and skip the ones that are allready displayed on the page
  );

  let responseAsJson = await response.json();
  let newPokemonData = await fetchPokemonData(responseAsJson.results);

  currentPokemonList = currentPokemonList.concat(newPokemonData);               // concat takes the existing Pokémon and adds the new ones at the end of the list
  currentOffset += responseAsJson.results.length;                              // if load more is activated currentOffset knows where to start / is not starting again with the first Pokémon
  return newPokemonData;
}

function renderNewPokemon(newArray) {
  let content = document.getElementById("content");
  let startIndex = currentPokemonList.length - newArray.length;             // find correct index for a new card / ensures by clicking a Pokémon the right card is opened

  for (let i = 0; i < newArray.length; i++) {
    content.innerHTML += getPokemonTemplate(newArray[i], startIndex + i);
  }
}

function showSpinner() {
  document.getElementById("loading_spinner").style.display = "flex";
  document.getElementById("load_more_pokemon").style.display = "none";
}

function hideSpinner() {
  document.getElementById("loading_spinner").style.display = "none";
  if (!isSearchActive) {
    document.getElementById("load_more_pokemon").style.display = "block";
  }
}

// function getNextPokemonIndex(newIndex, listLength) {
//   if (isSearchActive) {
//     return newIndex < 0 ? listLength - 1 : newIndex >= listLength ? 0 : newIndex;   // in searched list of Pokémon: click previous on the first go to last in the list and vice versa
//   }
//   if (newIndex < 0) return 1024; // Index for Pokémon 1025 / click previous on the first Pokémon in the Pokédex you get to the last one
//   if (newIndex >= 1025) return 0; // click forward on the last Pokemon with Nr. 1025 you get back to the first Pokémon in the Pokédex
//   return newIndex;
// }

function getNextPokemonIndex(newIndex, listLength) {
    if (newIndex < 0) {
        return listLength - 1;
    }
    if (newIndex >= listLength) {
        return 0;
    }
    return newIndex;
}

// async function changePokemonCard(newIndex) {
//   const listLength = currentPokemonList.length;                    // checks how many Pokémon are loaded in the memory
//   const targetIndex = getNextPokemonIndex(newIndex, listLength);  // call for the navigation function before
//   if (!isSearchActive && targetIndex >= listLength) {            // check if you want to load a Pokémon that has not been fetched at this moment (not shown on page)
//     await loadAndShowSinglePokemon(targetIndex + 1);            // in this case one more Pokémon is fetched from the API
//   } else if (!isSearchActive && newIndex >= 1025) {            // handles the limit with the last Pokémon in the list
//     renderPokemonCard(0);
//   } else {
//     await openPokemonCardDialog(targetIndex);                // if Pokémon exists update the dialog content
//   }
// }

async function changePokemonCard(newIndex) {
    const listLength = isSearchActive ? filteredPokemonList.length : currentPokemonList.length;
    const targetIndex = getNextPokemonIndex(newIndex, listLength);
    await openPokemonCardDialog(targetIndex);
}

async function fetchSinglePokemonData(pokemonId) {
  let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`); // fetches data for one single Pokémon/ if you jump back from first to last Pokémon in the Pokédex or forward to a Pokémon that is not loaded yet

  if (!response.ok) {
    throw new Error(`Pokémon with ID ${pokemonId} not found`);
  }

  let pokemon = await response.json();
  pokemon.description_text = await getPokemonDescription(pokemon);
  return pokemon;
}

// function for just in time rendering of a Pokémon card that hasn't been loaded yet
async function loadAndShowSinglePokemon(pokemonId) {
  try {
    let pokemon = await fetchSinglePokemonData(pokemonId);
    let pokemonCardContent = document.getElementById("pokemon_card_content");

    pokemonCardContent.innerHTML = getPokemonCardTemplate(
      pokemon,
      pokemonId - 1,
    );
  } catch (error) {
    console.error("error while loading this Pokémon card:", error);
    renderPokemonCard(currentPokemonList.length - 1);
  }
}

// #end-region load more Pokémon

// #start-region search Pokémon

async function searchPokemon() {
  const inputField = document.getElementById("search_input");
  const messageContainer = document.getElementById("search_message");
  const searchTerm = inputField.value.toLowerCase().trim();               // search with lower case is also possible

  if (!prepareSearch(searchTerm, messageContainer)) return;              // call for helper functions
  showSpinner();
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
  return true;
}

// function that looks for matching Pokémon / shows a list or a message if nothing is founf

// async function executeSearch(searchTerm) {
//   const foundPokemon = await getFilteredPokemonList(searchTerm);
//   const content = document.getElementById("content");

//   if (foundPokemon.length === 0) {
//     isSearchActive = false;

//     content.innerHTML = getNoPokemonFoundTemplate();

//     toggleSearchButton(true);
//     hideSpinner(); 
//   } else {
//     isSearchActive = true;
//     currentPokemonList = await fetchPokemonData(foundPokemon);                // show all Pokémon with the included letters
//     toggleSearchButton(true);                                                 // button get back is displayed
//     renderPokemon(currentPokemonList);
//     hideSpinner();
//   }
// }


async function executeSearch(searchTerm) {
  const content = document.getElementById("content");
  filteredPokemonList = currentPokemonList.filter((p) =>
    p.name.toLowerCase().includes(searchTerm)
  );

  if (filteredPokemonList.length === 0) {
    isSearchActive = true; 
    content.innerHTML = getNoPokemonFoundTemplate();
    toggleSearchButton(true);
    hideSpinner();
  } else {
    isSearchActive = true;
    toggleSearchButton(true);
    renderPokemon(filteredPokemonList); 
    hideSpinner();
  }
}


// function get names of Pokémon and filter them by their first letters / local cache for names
async function getFilteredPokemonList(searchTerm) {
  // proof: list loaded before?
  if (!allPokemonNamesCache) {
    console.log("Lade Gesamtliste von API..."); // Nur beim ersten Mal
    let response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0",
    );
    let data = await response.json();
    // safe in Cache
    allPokemonNamesCache = data.results;
  } else {
    console.log("Nutze Cache die Suche");
  }
  // filter in local list
  return allPokemonNamesCache.filter((p) =>
    p.name.toLowerCase().includes(searchTerm),
  );
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

// function resetPokedex() {
//   isSearchActive = false;
//   window.scrollTo({ top: 0, behavior: "smooth" });
//   currentOffset = 0;
//   limit = 20;
//   currentPokemonList = [];
//   document.getElementById("search_input").value = "";
//   document.getElementById("search_message").innerText = "";
//   toggleSearchButton(false);
//   fetchDataJsonPokemonDetails();
// }

function resetPokedex() {
  isSearchActive = false;
  document.getElementById("search_input").value = "";
  document.getElementById("search_message").innerText = "";
  toggleSearchButton(false);
  renderPokemon(currentPokemonList); 
}

// #end-region search Pokémon

// #start-region Pokémon statistics

function getPokemonStats(stats) {
  return {
    hp: stats[0].base_stat,
    atk: stats[1].base_stat,
    def: stats[2].base_stat,
    spAtk: stats[3].base_stat,
    spDef: stats[4].base_stat,
    speed: stats[5].base_stat
  };
}

function preparePokemonDisplayData(pokemon) {
  const type1 = pokemon.types[0].type.name;
  const type2 = pokemon.types[1] ? pokemon.types[1].type.name : type1;
  return {
    id: String(pokemon.id).padStart(4, '0'),
    name: pokemon.name.toUpperCase(),
    img: pokemon.sprites.other['official-artwork'].front_default,
    color1: typeColors[type1],
    color2: typeColors[type2],
    height: (pokemon.height / 10).toFixed(2).replace(".", ","),
    weight: (pokemon.weight / 10).toFixed(2).replace(".", ","),
    description: pokemon.description_text || "No description available.",
    types: pokemon.types.map(t => ({ name: t.type.name, color: typeColors[t.type.name] })),
    stats: getPokemonStats(pokemon.stats) 
  };
}

// #end-region Pokémon statistics