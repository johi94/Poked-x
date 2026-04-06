function getPokemonTemplate(pokemon, index) {

  return /*html*/ `
      <div class="pokemon_card" onclick="openPokemonCardDialog(${index})">
       <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="pokemon_img">
        <div class="number_name_types">
         <p class="pokedex_number">Nr. ${String(index + 1).padStart(4, '0')}</p>
         <h2>${pokemon.name.toUpperCase()}</h2>
          <div class="types-container">
           ${pokemon.types.map(t => `<span class="type-${t.type.name}">${t.type.name}</span>`).join(' ')}
          </div>
        </div>
      </div>
      `;
}

// String(index + 1).padStart(4, '0') / .padStart is a string method -> mandatory to change number to string
// From number to "number" / (4, '0') -> "Text" should have for "Letters", 0 to fill the space if "number" is shorter

function getPokemonCardTemplate(pokemon, index) {

  return /*html*/ `
      <div class="pokemon_card_open">
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
         <p class="pokedex_number">Nr. ${String(index + 1).padStart(4, '0')}</p>
          <h2>${pokemon.name.toUpperCase()}</h2>
           <p>height: ${(pokemon.height / 10).toFixed(1).replace(".", ",")} m</p>
           <p>weight: ${(pokemon.weight / 10).toFixed(1).replace(".", ",")} kg</p>
            <div class="types-container">
             ${pokemon.types.map(t => `<span class="type-${t.type.name}">${t.type.name}</span>`).join(' ')}
            </div>
      </div>
      `;
}