 const typeColors = {
    fire: '#ff9d55', water: '#5090d6', grass: '#63bc5a', bug: '#9bcc50',
    normal: '#a8a878', electric: '#eed535', poison: '#b97fc9', flying: '#3dc7ef',
    ground: '#ab9842', rock: '#a38c21', steel: '#9eb7b8', fairy: '#fdb9e9',
    fighting: '#c03028', psychic: '#f85888', ice: '#98d8d8', ghost: '#705898',
    dragon: '#7038f8', dark: '#705848'
  };


function getPokemonTemplate(pokemon, index) {

 const type1 = pokemon.types[0].type.name;
 const type2 = pokemon.types[1] ? pokemon.types[1].type.name : type1;
 const color1 = typeColors[type1];
 const color2 = typeColors[type2];

  return /*html*/ `
      <div class="pokemon_card" onclick="openPokemonCardDialog(${index})">
       <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="pokemon_img" style="background: linear-gradient(135deg, ${color1} 50%, ${color2} 50%)"> 
        <div class="number_name_types">
         <p class="pokedex_number">Nr. ${String(index + 1).padStart(4, '0')}</p>
         <h2>${pokemon.name.toUpperCase()}</h2>
          <div class="types-container">
           ${pokemon.types.map(t => {
             const bgColor = typeColors[t.type.name];
             return `<span class="type-badge" style="background-color: ${bgColor}">${t.type.name}</span>`;
           }).join(' ')}
          </div>
        </div>
      </div>
      `;
}

// String(index + 1).padStart(4, '0') / .padStart is a string method -> mandatory to change number to string
// From number to "number" / (4, '0') -> "Text" should have for "Letters", 0 to fill the space if "number" is shorter
// linear-gradient(135deg, ${color1} 50%, ${color2} 50%)"; -> show both types if Pokémon has two types in the background


function getPokemonCardTemplate(pokemon, index) {

  return /*html*/ `
      <div class="pokemon_card_open">
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
         <p class="pokedex_number">Nr. ${String(index + 1).padStart(4, '0')}</p>
          <h2>${pokemon.name.toUpperCase()}</h2>
           <p>height: ${(pokemon.height / 10).toFixed(1).replace(".", ",")} m</p>
           <p>weight: ${(pokemon.weight / 10).toFixed(1).replace(".", ",")} kg</p>
            <div class="types-container">
             ${pokemon.types.map(t => {
              const bgColor = typeColors[t.type.name];
              return `<span class="type-badge" style="background-color: ${bgColor}">${t.type.name}</span>`;
             }).join(' ')}
            </div>
      </div>
      `;
}