const params = new URLSearchParams(window.location.search);
const foodId = parseInt(params.get("id"));
const container = document.getElementById("food-detail");

// ================= LIKE COUNT =================
function updateLikeCount(){
  const countElement = document.getElementById("like-count");
  let likedItems = JSON.parse(localStorage.getItem("likedFoods")) || [];
  if(countElement){
    countElement.innerText = likedItems.length;
  }
}
updateLikeCount();

// ================= FIND FOOD =================
const food = foods.find(f => f.id === foodId);

if(food){

  container.innerHTML = `
    <div class="food-info">
      <h1 class="detail-title">
        ${food.name}

      <span id="detail-like-btn" class="detail-like-btn">
        <svg class="heart-icon" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
             2 6 4 4 6.5 4
             8.04 4 9.54 4.81 10.4 6.09
             11.26 4.81 12.76 4 14.3 4
             16.8 4 18.8 6 18.8 8.5
             18.8 12.28 15.4 15.36 10.55 20.04
             L12 21.35z"/>
        </svg>
      </span>
      </h1>

      <img src="assets/images/${food.images[0]}"
           style="width:300px;border-radius:12px;margin:15px 0;">

      <p><strong>Cuisine:</strong> ${food.cuisine}</p>
      <p><strong>Origin:</strong> ${food.origin}</p>
      <p><strong>Year:</strong> ${food.year}</p>
      <p><strong>Type:</strong> ${food.type}</p>

      <p style="margin-top:15px;">
        ${food.description?.history || "Description coming soon..."}
      </p>
    </div>
  `;

  const likeBtn = document.getElementById("detail-like-btn");
  const heartIcon = likeBtn.querySelector(".heart-icon");

  // ================= UPDATE HEART =================
  function updateDetailLike(){
    let likedItems = JSON.parse(localStorage.getItem("likedFoods")) || [];

    if(likedItems.includes(food.id)){
      heartIcon.classList.add("liked");
    }else{
      heartIcon.classList.remove("liked");
    }
  }

  // ================= TOGGLE LIKE =================
  function toggleLike(){
    let likedItems = JSON.parse(localStorage.getItem("likedFoods")) || [];

    if(likedItems.includes(food.id)){
      likedItems = likedItems.filter(id => id !== food.id);
    }else{
      likedItems.push(food.id);
    }

    localStorage.setItem("likedFoods", JSON.stringify(likedItems));

    updateDetailLike();
    updateLikeCount();
  }

  updateDetailLike();
  likeBtn.addEventListener("click", toggleLike);

}else{
  container.innerHTML = "<p>Food not found.</p>";
}