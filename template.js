function getPokemonTemplate(pokemon, index) {

  return /*html*/ `
      <div class="pokemon_card">
       <h2>Nr. 000${index + 1} ${pokemon.name.toUpperCase()}</h2>
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
          <div class="types-container">
           ${pokemon.types.map(t => `<span class="type-${t.type.name}">${t.type.name}</span>`).join(' ')}
        </div>
      </div>
      `;
}


function getPokemonSingleTemplate(pokemon, index) {

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