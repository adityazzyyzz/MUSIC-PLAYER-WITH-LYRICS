const accessToken = 'BQAfb2U3ZYqKJwVzThaTvg3O7lOdfWHV5phsUsOCEufgTZlYIt04IS7ZGUmqgIEMYaDCjxF0B8xZZCeuEECwcg5DMBQJ4ovTVI8zgMsQ1WlxqJ0JZyWgzMKCt1hQHQbZ2zECbefAr16wzTWtjP8-st8P_PBp7Ba6phXhhotuUqMU6bkqapIHub6WR5IWg0YX7AzXvrbcosZu7GaolmYk31tl9cISG9g3Adrw';
let currentTrackIndex = 0;
let audioPlayer = null;
let currentTracks = [];

// Function to fetch songs based on category
async function fetchSongs(category) {
  const response = await fetch(`https://api.spotify.com/v1/search?q=${category}&type=track`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  currentTracks = data.tracks.items;
  displaySongs(currentTracks);
}

// Function to search songs based on user input
async function searchSongs(query) {
  const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  const searchResults = data.tracks.items;
  displaySearchResults(searchResults);
}

// Function to display songs in the song list
function displaySongs(songs) {
  const songList = document.getElementById('songList');
  songList.innerHTML = ''; // Clear previous songs

  songs.forEach((song, index) => {
    const songDiv = document.createElement('div');
    songDiv.classList.add('song-item');
    songDiv.innerHTML = `
      <h3>${song.name}</h3>
      <p>${song.artists.map(artist => artist.name).join(', ')}</p>
    `;
    songDiv.onclick = () => selectSong(index);
    songList.appendChild(songDiv);
  });
}

// Function to display search results
function displaySearchResults(songs) {
  const searchResults = document.getElementById('searchResults');
  searchResults.innerHTML = ''; // Clear previous results

  songs.forEach((song, index) => {
    const resultDiv = document.createElement('div');
    resultDiv.classList.add('search-result-item');
    resultDiv.innerHTML = `
      <h3>${song.name}</h3>
      <p>${song.artists.map(artist => artist.name).join(', ')}</p>
    `;
    resultDiv.onclick = () => {
      selectSongFromSearch(song);
      searchResults.innerHTML = ''; // Clear search results after selecting a song
    };
    searchResults.appendChild(resultDiv);
  });
}

// Function to select a song from the search results and play it
function selectSongFromSearch(song) {
  if (audioPlayer) {
    audioPlayer.pause();
  }

  playSong(song.preview_url || song.external_urls.spotify);

  // Fetch and display lyrics from lyrics.ovh API
  fetchLyrics(song.artists[0].name, song.name);
}

// Function to select a song and play it
function selectSong(index) {
  if (audioPlayer) {
    audioPlayer.pause();
  }

  currentTrackIndex = index;
  const song = currentTracks[index];

  playSong(song.preview_url || song.external_urls.spotify);

  // Fetch and display lyrics from lyrics.ovh API
  fetchLyrics(song.artists[0].name, song.name);
}

// Function to play the song
function playSong(url) {
  audioPlayer = new Audio(url);
  audioPlayer.play();

  updateSongInfo(currentTracks[currentTrackIndex]);

  audioPlayer.addEventListener('timeupdate', updateTime);
  audioPlayer.addEventListener('ended', nextSong);
  document.getElementById('playPauseBtn').onclick = togglePlayPause;

  document.getElementById('prevBtn').onclick = prevSong;
  document.getElementById('nextBtn').onclick = nextSong;

  // Volume Control: Update volume based on range input
  const volumeControl = document.getElementById('volumeControl');
  volumeControl.addEventListener('input', (event) => {
    audioPlayer.volume = event.target.value;
  });
}

// Function to update the song information
function updateSongInfo(song) {
  document.getElementById('songTitle').innerText = `Now Playing: ${song.name}`;
}

// Function to update the song time
function updateTime() {
  const songDuration = document.getElementById('songDuration');
  const minutesElapsed = Math.floor(audioPlayer.currentTime / 60);
  const secondsElapsed = Math.floor(audioPlayer.currentTime % 60);
  const minutesDuration = Math.floor(audioPlayer.duration / 60);
  const secondsDuration = Math.floor(audioPlayer.duration % 60);

  songDuration.innerHTML = `${minutesElapsed}:${secondsElapsed < 10 ? '0' : ''}${secondsElapsed} / ${minutesDuration}:${secondsDuration < 10 ? '0' : ''}${secondsDuration}`;
}

// Function for the next song
function nextSong() {
  currentTrackIndex = (currentTrackIndex + 1) % currentTracks.length;
  selectSong(currentTrackIndex);
}

// Function for the previous song
function prevSong() {
  currentTrackIndex = (currentTrackIndex - 1 + currentTracks.length) % currentTracks.length;
  selectSong(currentTrackIndex);
}

// Function to toggle play and pause
function togglePlayPause() {
  const playPauseBtn = document.getElementById('playPauseBtn');
  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseBtn.querySelector('#playIcon').classList.replace('fa-play', 'fa-pause');
  } else {
    audioPlayer.pause();
    playPauseBtn.querySelector('#playIcon').classList.replace('fa-pause', 'fa-play');
  }
}

// Function to fetch and display lyrics using lyrics.ovh API
async function fetchLyrics(artist, title) {
  try {
    const response = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
    if (response.ok) {
      const data = await response.json();
      const lyrics = data.lyrics || "Lyrics not found.";
      document.getElementById('lyrics').innerText = lyrics;
    } else {
      document.getElementById('lyrics').innerText = "Failed to fetch lyrics.";
    }
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    document.getElementById('lyrics').innerText = "Lyrics could not be fetched.";
  }
}

// Event listeners for category clicks
document.querySelectorAll('.category-item').forEach(item => {
  item.addEventListener('click', () => {
    const category = item.getAttribute('data-category');
    fetchSongs(category);
  });
});

// Event listener for search button
document.getElementById('searchBtn').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value;
  if (query) {
    searchSongs(query);
  }
});
