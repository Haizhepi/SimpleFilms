const dev = "http://localhost:5000";
const prod = "https://my-hw-app.azurewebsites.net";

function clickTab(event, tabName) {
  var idx, sectionContent, tab;

  sectionContent = document.getElementsByClassName("section-content");
  for (idx = 0; idx < sectionContent.length; idx++) {
    sectionContent[idx].style.display = "none";
  }

  tab = document.getElementsByClassName("tab");
  for (idx = 0; idx < tab.length; idx++) {
    tab[idx].className = tab[idx].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  event.currentTarget.className += " active";
}
var trendingSlideIndex = 1;
var airingSlideIndex = 1;

function showTrendingSlides(n) {
  var slides = document.getElementsByClassName("trending");
  if (slides.length === 0) {
    return;
  }
  if (n > slides.length) {
    trendingSlideIndex = 1;
  }
  if (n < 1) {
    trendingSlideIndex = slides.length;
  }
  for (var i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[trendingSlideIndex - 1].style.display = "block";
}

function showAiringSlides(n) {
  var slides = document.getElementsByClassName("airing");
  if (slides.length === 0) {
    return;
  }
  if (n > slides.length) {
    airingSlideIndex = 1;
  }
  if (n < 1) {
    airingSlideIndex = slides.length;
  }
  for (var i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[airingSlideIndex - 1].style.display = "block";
}

function loadAndShowTrending() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", prod + "/trending", true);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      movies = JSON.parse(this.responseText);
      var trendingContainer = document.getElementById("trending-container");
      var slides = [];
      for (var i = 0; i < movies.length; i++) {
        var m = movies[i];
        var output = `
        <img src="https://image.tmdb.org/t/p/w780/${
          m.backdrop_path
        }" alt="example-img" onerror="this.src = 'asset/poster-placeholder.jpg';">
          <div class="text">
            <p>${m.title} (${
          m.release_date !== "N/A" ? m.release_date.substring(0, 4) : "N/A"
        })</p>
          </div>
      `;
        var slide = document.createElement("div");
        slide.classList.add("trending");
        slide.classList.add("slide");
        slide.classList.add("fade");
        slide.innerHTML = output;
        slides.push(slide);
      }
      for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        trendingContainer.appendChild(slides[i]);
      }
    }

    showTrendingSlides(trendingSlideIndex);
    setInterval(function () {
      showTrendingSlides(++trendingSlideIndex);
    }, 3000);
  };
  xhr.send();
}

function loadAndShowAiring() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", prod + "/airing", true);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      tvs = JSON.parse(this.responseText);
      var airingContainer = document.getElementById("airing-container");
      var slides = [];
      for (var i = 0; i < tvs.length; i++) {
        var t = tvs[i];
        var output = `
        <img src="https://image.tmdb.org/t/p/w780/${
          t.backdrop_path
        }" alt="example-img" onerror="this.src = 'asset/poster-placeholder.jpg';">
          <div class="text">
            <p>${t.name} (${t.first_air_date.substring(0, 4)})</p>
          </div>
      `;
        var slide = document.createElement("div");
        slide.classList.add("airing");
        slide.classList.add("slide");
        slide.classList.add("fade");
        slide.innerHTML = output;
        slides.push(slide);
      }
      for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        airingContainer.appendChild(slides[i]);
      }
    }
    showAiringSlides(airingSlideIndex);
    setInterval(function () {
      showAiringSlides(++airingSlideIndex);
    }, 3000);
  };
  xhr.send();
}

function checkFields() {
  if (document.getElementById("keyword").value === "") {
    alert("Please enter valid values");
    return false;
  }

  if (document.getElementById("category").value === "empty") {
    alert("Please enter valid values");
    return false;
  }
  return true;
}

function clickedOnSearch() {
  if (!checkFields()) {
    return;
  }
  var keyword = document.getElementById("keyword").value;
  var category = document.getElementById("category").value;
  url = prod;
  if (category === "movie") {
    url = url + "/movie" + "?query=" + keyword;
  } else if (category === "tv") {
    url = url + "/tv" + "?query=" + keyword;
  } else {
    url = url + "/multi" + "?query=" + keyword;
  }
  url = encodeURI(url);
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var container = document.getElementById("card-container");
      container.innerHTML = "";
      flask_response = JSON.parse(this.responseText);
      if (flask_response.length > 0) {
        var show_result = document.createElement("p");
        show_result.classList.add("show-result-title");
        show_result.innerHTML = "Showing results...";
        container.appendChild(show_result);
        flask_response.forEach((r) => {
          var card = getCard(r, r.media_type);
          container.appendChild(card);
        });
        container.style.alignItems = "flex-start";
      } else {
        var show_result = document.createElement("p");
        show_result.classList.add("show-no-match-title");
        show_result.innerHTML = "No Match Found";
        container.appendChild(show_result);
        container.style.alignItems = "center";
      }
    }
  };
  xhr.send();
}

function getCard(r, kind) {
  var card = document.createElement("div");
  card.classList.add("movie-card");

  if (kind === "movie") {
    var output = `<img src="https://image.tmdb.org/t/p/w185/${
      r.poster_path
    }" alt="" class="movie-poster" onerror="this.src = 'asset/movie_placeholder.png';">
      <div class="movie-info">
        <h3 class="info-title">${r.title}</h4>
        <p class="info-genre">${
          r.release_date !== "N/A" ? r.release_date : "N/A"
        } | ${r.genres.join(", ")}</p>
        <p class="info-votes"> <span>&#9733;${(r.vote_average / 2).toFixed(
          1
        )}/5</span>&#160; ${r.vote_count} votes</p>
        <p class="info-overview">${r.overview}</p>
        <button class="info-button" onClick="showPopup(${r.id}, '${
      r.media_type
    }')">Show More</button>
      </div>`;
    card.innerHTML = output;
  } else if (kind === "tv") {
    var output = `<img src="https://image.tmdb.org/t/p/w185/${
      r.poster_path
    }" alt="" class="movie-poster" onerror="this.src = 'asset/movie_placeholder.png';">
    <div class="movie-info">
      <h3 class="info-title">${r.name}</h4>
      <p class="info-genre">${
        r.first_air_date !== "N/A" ? r.first_air_date : "N/A"
      } | ${r.genres.join(", ")}</p>
      <p class="info-votes"><span>&#9733;${(r.vote_average / 2).toFixed(
        1
      )}/5</span> &#160;${r.vote_count} votes</p>
      <p class="info-overview">${r.overview}</p>
      <button class="info-button" onClick="showPopup(${r.id}, '${
      r.media_type
    }')">Show More</button>
    </div>`;
    card.innerHTML = output;
  }
  return card;
}

function clickedOnClear() {
  document.getElementById("keyword").value = "";
  document.getElementById("category").value = "empty";
  var container = document.getElementById("card-container");
  container.innerHTML = "";
}

function showPopup(id, media_type) {
  url = prod;
  if (media_type === "movie") {
    url = url + "/m" + "?id=" + id;
  } else {
    url = url + "/t" + "?id=" + id;
  }
  url = encodeURI(url);
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      flask_response = JSON.parse(this.responseText);
      var detail;
      if (media_type === "movie") {
        detail = getMovieDetail(flask_response, id);
      } else {
        detail = getTVDetail(flask_response, id);
      }
      var popup = document.getElementById("popup");
      popup.appendChild(detail);
      var content = document.getElementById("detail");
      popup.classList.add("open");
    }
  };
  xhr.send();
}
function hidePopup() {
  const popup = document.querySelector(".popup");
  popup.classList.remove("open");
}

function getMovieDetail(r, id) {
  var container = document.getElementById("detail");
  container.innerHTML = "";
  var output = `
  <span id='cross' onClick="hidePopup()">x</span>
  <img src="https://image.tmdb.org/t/p/w780${r.backdrop_path}" alt="example-img" class="detail-poster" onerror="this.src = 'asset/poster-placeholder.jpg';">
  `;
  container.innerHTML = output;
  var detailWrapper = document.createElement("div");
  detailWrapper.classList.add("detail-wrapper");
  var detailInfo = `
  <p class="detail-text detail-title">${
    r.title
  } <a href="https://www.themoviedb.org/movie/${id}" target="_blank"><span>&#9432;</span></a></p>
  <p class="detail-text detail-detail1">${
    r.release_date === "N/A" ? "N/A" : r.release_date.substring(0, 4)
  } | ${r.genres.join(", ")}</p>
  <p class="detail-text detail-detail2"><span>&#9733;${(
    r.vote_average / 2
  ).toFixed(1)}/5</span> &#160;${r.vote_count} votes</p>
  <p class="detail-text detail-overview">${r.overview}</p>
  <p class="detail-text detail-language">${r.spoken_languages.join(", ")}</p>
  `;
  var castP = document.createElement("p");
  castP.classList.add("detail-text");
  castP.classList.add("detail-bold");
  castP.innerHTML = "Cast";

  detailWrapper.innerHTML = detailInfo;
  if (r.casts.length > 0) {
    detailWrapper.appendChild(castP);
  }
  var detailGrid = document.createElement("div");
  detailGrid.classList.add("detail-grid");
  r.casts.forEach((cast) => {
    var c = getCharacter(cast);
    detailGrid.appendChild(c);
  });
  detailWrapper.appendChild(detailGrid);
  var reviewp = document.createElement("p");
  reviewp.classList.add("detail-text");
  reviewp.classList.add("detail-bold");
  reviewp.innerHTML = "Reviews";
  if (r.reviews.length > 0) {
    detailWrapper.appendChild(reviewp);
  }
  r.reviews.forEach((rev) => {
    var r = getReview(rev);
    detailWrapper.appendChild(r);
  });
  container.appendChild(detailWrapper);
  return container;
}

function getTVDetail(r, id) {
  var container = document.getElementById("detail");
  container.innerHTML = "";
  var output = `
  <span id='cross' onClick="hidePopup()">x</span>
  <img src="https://image.tmdb.org/t/p/w780${r.backdrop_path}" alt="example-img" class="detail-poster" onerror="this.src = 'asset/poster-placeholder.jpg';">
  `;
  container.innerHTML = output;
  var detailWrapper = document.createElement("div");
  detailWrapper.classList.add("detail-wrapper");
  var detailInfo = `
  <p class="detail-text detail-title">${
    r.name
  } <a href="https://www.themoviedb.org/tv/${id}" target="_blank"><span>&#9432;</span></a></p>
  <p class="detail-text detail-detail1">${
    r.first_air_date === "N/A" ? "N/A" : r.first_air_date.substring(0, 4)
  } | ${r.genres.join(", ")}</p>
  <p class="detail-text detail-detail2"><span>&#9733;${(
    r.vote_average / 2
  ).toFixed(1)}/5</span> &#160;${r.vote_count} votes</p>
  <p class="detail-text detail-overview">${r.overview}</p>
  <p class="detail-text detail-language">Spoken Languages: ${r.spoken_languages.join(
    ", "
  )}</p>
  `;
  var castP = document.createElement("p");
  castP.classList.add("detail-text");
  castP.classList.add("detail-bold");
  castP.innerHTML = "Cast";

  detailWrapper.innerHTML = detailInfo;
  if (r.casts.length > 0) {
    detailWrapper.appendChild(castP);
  }
  var detailGrid = document.createElement("div");
  detailGrid.classList.add("detail-grid");
  r.casts.forEach((cast) => {
    var c = getCharacter(cast);
    detailGrid.appendChild(c);
  });
  detailWrapper.appendChild(detailGrid);
  var reviewp = document.createElement("p");
  reviewp.classList.add("detail-text");
  reviewp.classList.add("detail-bold");
  reviewp.innerHTML = "Reviews";
  if (r.reviews.length > 0) {
    detailWrapper.appendChild(reviewp);
  }
  r.reviews.forEach((rev) => {
    var r = getReview(rev);
    detailWrapper.appendChild(r);
  });
  container.appendChild(detailWrapper);
  return container;
}

function getReview(rev) {
  var review = document.createElement("div");
  review.classList.add("review");
  var m = new Date(rev.created_at);
  var dateString =
    m.getUTCMonth() + 1 + "/" + m.getUTCDate() + "/" + m.getUTCFullYear();

  var output = `
  <p class="review-name-time"><span class="review-name-time-span">${
    rev.author
  }</span>  on  ${dateString}</p>
  ${
    rev.rating !== "N/A" && rev.rating !== null
      ? '<p class="review-rating">&#9733;' +
        (rev.rating / 2).toFixed(1) +
        " /5</p>"
      : ""
  }
  <p class="info-overview">${rev.content}</p>
  <hr class="divider">
  `;

  review.innerHTML = output;
  return review;
}

function getCharacter(cast) {
  var character = document.createElement("div");
  character.classList.add("character");
  var output = `
    <img src="https://image.tmdb.org/t/p/w185${cast.profile_path}" alt="example-img" class="detail-poster" onerror="this.src = 'asset/person-placeholder.png';">
    <p class="character-name name-bold">${cast.name}</p>
    <p class="character-name">AS</p>
    <p class="character-name">${cast.character}</p>
  `;
  character.innerHTML = output;
  return character;
}

window.onload = function () {
  document.getElementById("defaultOpen").click();
  loadAndShowTrending();
  loadAndShowAiring();
  // showPopup(155, "movie");
};
