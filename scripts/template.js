function getPokemonTemplate(pokemon, index) {

  return /*html*/ `
      <div class="pokemon_card">
       <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="pokemon_img">
       <p class="pokedex_number">Nr. ${String(index + 1).padStart(4, '0')}</p>
        <h2>${pokemon.name.toUpperCase()}</h2>
          <div class="types-container">
           ${pokemon.types.map(t => `<span class="type-${t.type.name}">${t.type.name}</span>`).join(' ')}
        </div>
      </div>
      `;
}

// Nr. 000 funktioniert nur bei Zahlen bis 9

function getPokemonCardTemplate(pokemon, index) {

  return /*html*/ `
      <div class="pokemon_card">
       <h2>Nr. 000${index + 1} ${pokemon.name.toUpperCase()}</h2>
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
         <p>height: ${(pokemon.height / 10).toFixed(1).replace(".", ",")} m</p>
         <p>weight: ${(pokemon.weight / 10).toFixed(1).replace(".", ",")} kg</p>
          <div class="types-container">
           ${pokemon.types.map(t => `<span class="type-${t.type.name}">${t.type.name}</span>`).join(' ')}
        </div>
      </div>
      `;
}