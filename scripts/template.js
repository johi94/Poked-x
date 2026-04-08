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
          <div>
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

 const type1 = pokemon.types[0].type.name;
 const type2 = pokemon.types[1] ? pokemon.types[1].type.name : type1;
 const color1 = typeColors[type1];
 const color2 = typeColors[type2];

  return /*html*/ `
   <div class="pokemon_card_open">
    <p class="pokedex_number_open"># ${String(index + 1).padStart(4, '0')}</p>
     <div class="pokemon_img_type_open">
      <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="pokemon_img_open" style="background: linear-gradient(135deg, ${color1} 50%, ${color2} 50%)">
       <div class="name_type_open">
        <h2 class="h2_open">${pokemon.name.toUpperCase()}</h2>
         <div class="types_open"> 
          <p class="p_tag_type_open">Type:</p>
           ${pokemon.types.map(t => {
           const bgColor = typeColors[t.type.name];
           return `<span class="type-badge-open" style="background-color: ${bgColor}">${t.type.name}</span>`;
           }).join(' ')}
         </div>
       </div>
     </div>
    <p class="flavor_text">"${pokemon.description_text}"</p>
     <div class="nav_btns_statistics">
      <button class="nav_btn_left" onclick="changePokemonCard(${index - 1})">&#9664;</button>
       <div class="statistics_open" style="background: linear-gradient(135deg, ${color1} 50%, ${color2} 50%)">
        <p>Base Stats:</p>
         <div class="statistics_divide">
          <div class="statistics_1">
           <p>height: ${(pokemon.height / 10).toFixed(2).replace(".", ",")} m</p>
           <p>HP: ${pokemon.stats[0].base_stat}</p>
           <p>attack: ${pokemon.stats[1].base_stat}</p>
           <p>special attack: ${pokemon.stats[3].base_stat}</p>
          </div>
          <div class="statistics_2">
           <p>weight: ${(pokemon.weight / 10).toFixed(2).replace(".", ",")} kg</p>
           <p>speed: ${pokemon.stats[5].base_stat}</p> 
           <p>defense: ${pokemon.stats[2].base_stat}</p>
           <p>special defense: ${pokemon.stats[4].base_stat}</p>
          </div>
       </div>  
     </div> 
     <button class="nav_btn_right" onclick="changePokemonCard(${index + 1})">&#9654;</button>   
    </div>  
   </div>
      `;
}