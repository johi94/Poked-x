function getPokemonTemplate(pokemon, index) {
  return /*html*/ `
      <div class="pokemon_card">
       <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
        <h2>#${index + 1} ${pokemon.name.toUpperCase()}</h2>
         <p></p>
      </div>
      `;
}
