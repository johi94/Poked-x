  const typeColors = {
     fire: '#ff9d55', water: '#5090d6', grass: '#63bc5a', bug: '#9bcc50',
     normal: '#a8a878', electric: '#eed535', poison: '#b97fc9', flying: '#3dc7ef',
     ground: '#ab9842', rock: '#a38c21', steel: '#9eb7b8', fairy: '#fdb9e9',
     fighting: '#c03028', psychic: '#f85888', ice: '#98d8d8', ghost: '#705898',
     dragon: '#7038f8', dark: '#705848'
   };


function getPokemonTemplate(pokemon, index) {
  const data = preparePokemonDisplayData(pokemon);

  return /*html*/ `
 <div class="pokemon_card" onclick="openPokemonCardDialog(${index})">
  <img src="${data.img}" alt="${data.name}" class="pokemon_img" 
   style="background: linear-gradient(135deg, ${data.color1} 50%, ${data.color2} 50%)"> 
    <div class="number_name_types">
     <p class="pokedex_number">Nr. ${data.id}</p>
      <h2>${data.name}</h2>
       <div>${data.types.map(t => /*html*/ `<span class="type-badge" 
        style="background-color: ${t.color}">${t.name}</span>`).join(' ')}
       </div>
    </div>
 </div>`;
}

function getPokemonCardTemplate(pokemon, index) {
  const data = preparePokemonDisplayData(pokemon);

  return /*html*/ `
<div class="pokemon_card_open">
 <p class="pokedex_number_open"># ${data.id}</p>
  <div class="pokemon_img_type_open">
   <div class="pokemon_img_circle_container" 
    style="background: linear-gradient(135deg, ${data.color1} 50%, ${data.color2} 50%)">
     <img src="${data.img}" alt="${data.name}" class="pokemon_img_open">
   </div>
    <div class="name_type_open">
     <h2 class="h2_open">${data.name}</h2>
      <div class="types_open"> 
       <p class="p_tag_type_open">Type:</p>
        ${data.types.map(t => /*html*/ `
        <span class="type-badge-open" style="background-color: ${t.color}">${t.name}</span>
        `).join(' ')}
      </div>
    </div>
  </div>
   <p class="flavor_text">"${data.description}"</p>
    <div class="nav_btns_statistics">
     <button class="nav_btn_left" onclick="changePokemonCard(${index - 1})">&#9664;</button>
      <div class="statistics_open" style="background: linear-gradient(135deg, ${data.color1} 50%, ${data.color2} 50%)">
       <p class="base_stats">Base Stats:</p>
        <div class="statistics_divide">
         <div class="statistics_1">
          <p>height: ${data.height} m</p>
          <p>HP: ${data.stats.hp}</p>
          <p>attack: ${data.stats.atk}</p>
          <p>special attack: ${data.stats.spAtk}</p>
         </div>
         <div class="statistics_2">
          <p>weight: ${data.weight} kg</p>
          <p>speed: ${data.stats.speed}</p> 
          <p>defense: ${data.stats.def}</p>
          <p>special defense: ${data.stats.spDef}</p>
         </div>
        </div>  
      </div> 
       <button class="nav_btn_right" onclick="changePokemonCard(${index + 1})">&#9654;</button>   
    </div>  
</div>`;
}

function getNoPokemonFoundTemplate() {
    return /*html*/ `
      <div class="no_results_container">
       <p>No Pokémon found with these letters.</p>
       <img class="no_pokemon_found_img" src="./assets/img/no_pokemon_found.png" alt="No Pokémon found">
      </div>
    `;
}

function getErrorLoadingTemplate() {
    return /*html*/ `
     <p style="text-align:center;">Error loading Pokémon.</p>
    `;
}