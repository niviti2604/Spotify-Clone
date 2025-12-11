console.log("Script loaded successfully.");
let currentsong = new Audio();
let songname = [];
let songs = [];
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    
    // Manual list for GitHub Pages (No directory scanning)
    // Make sure these match your filenames exactly!
    let localSongs = [
        "Mileya Mileya",
        "Shut Up Bounce", 
        "Be My Baby",
        "Radha",
        "Dooron Dooron",
        "Tum Ho Toh"
    ];

    // Clear arrays
    songs = [];
    songname = [];

    for (let i = 0; i < localSongs.length; i++) {
        // FIX: Removed leading slash to make path relative for GitHub Pages
        // It now produces "songs/ncs/SongName.mp3" instead of "/songs/ncs/..."
        let fullPath = `${folder}/${localSongs[i]}.mp3`;
        songs.push(fullPath);
        songname.push(localSongs[i]);
    }
    
    return songs;
}

const playMusic = (track, paused = false) => {
    // FIX: Removed leading slash here too
    currentsong.src = `${currFolder}/` + track + ".mp3";
    
    if (!paused) {
        currentsong.play();
        document.querySelector("#play").src = "pause.svg";
    } else {
        document.querySelector("#play").src = "play-button.svg";
    }

    // Decode %20 back to spaces for display
    let decodedName = track.replaceAll("%20", " ");
    document.querySelector(".song-title").innerHTML = decodedName;
    
    let songImage = document.querySelector(".song-info-image");
    if (songImage) {
        songImage.src = decodedName + ".jpg";
    }
    document.title = "Spotify - " + decodedName;
}

async function main() {
    // Ensure this folder path matches your actual folder structure
    await getSongs("songs/ncs");
    
    // Load first song but don't play
    if (songname.length > 0) {
        playMusic(songname[0], true);
    }

    // --- 1. Auto-Generate Library List ---
    let songul = document.querySelector(".lib-cards ul");
    if (songul) {
        songul.innerHTML = ""; // Clear existing
        for (const name of songname) {
            // FIX: Removed the typo "class=>"
            songul.innerHTML += `<li> 
                <img src="${name}.jpg" alt="${name}" onerror="this.src='music-note-svgrepo-com.svg'">
                <div class="info">
                    <div class="bold">${name}</div>
                    <div class="normal">Niviti Sharma</div>
                </div>
                <div class="lib-circle">
                    <img src="play-button.svg" alt="">
                </div>
            </li>`;
        }
    }

    // --- 2. Auto-Generate Playlist Cards ---
    let cardContainer = document.querySelector(".cards");
    if (cardContainer) {
        cardContainer.innerHTML = ""; 
        for (const name of songname) {
            cardContainer.innerHTML += `
                <div class="card bg-grey-light round-border">
                    <img src="${name}.jpg" alt="${name}" onerror="this.src='music-note-svgrepo-com.svg'">
                    <div class="cardtitle">${name}</div>
                    <div class="about">Niviti Sharma</div>
                </div>`;
        }
    }

    // --- 3. Attach Click Listeners to Library ---
    Array.from(document.querySelector(".lib-cards").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let songToPlay = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songToPlay);
        })
    })

    // --- 4. Attach Click Listeners to New Cards ---
    Array.from(document.querySelectorAll(".cards .card")).forEach(card => {
        card.addEventListener("click", e => {
            let cardTitle = card.querySelector(".cardtitle").innerHTML.trim();
            // FIX: Directly play the title. Don't encode with %20 yet, playMusic handles the src.
            // The logic: songname array has "Name Name", cardTitle is "Name Name". They match.
            if (songname.includes(cardTitle)) {
                playMusic(cardTitle);
            }
        });
    });

    // --- Playbar & Controls ---
    let playbutton = document.querySelector("#play")
    playbutton.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            playbutton.src = "pause.svg"
        }
        else {
            currentsong.pause();
            playbutton.src = "play-button.svg"
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".starttime").innerHTML = formatTime(currentsong.currentTime);
        document.querySelector(".currenttime").innerHTML = formatTime(currentsong.duration);
        
        // Prevent NaN error when song hasn't started
        if(!isNaN(currentsong.duration)){
             document.querySelector(".circle").style.left = ((currentsong.currentTime) / (currentsong.duration)) * 100 + "%";
        }
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        let leftBox = document.querySelector(".left");
        if (leftBox.style.left === "0%" || leftBox.style.left === "0px") {
            leftBox.style.left = "-100%";
        } else {
            leftBox.style.left = "0%";
        }
    });

    const id = document.querySelector("#play");
    let previous = document.querySelector("#previous");
    let next = document.querySelector("#next");

    previous.addEventListener("click", () => {
        currentsong.pause();
        let currentFileName = currentsong.src.split("/").slice(-1)[0];
        // FIX: Decode URI component to turn "Tum%20Ho" back into "Tum Ho"
        let currentName = decodeURIComponent(currentFileName).replace(".mp3", "");
        
        let index = songname.indexOf(currentName);
        if ((index - 1) >= 0) {
            playMusic(songname[index - 1]);
            id.src="pause.svg";
        }
    })

    next.addEventListener("click", () => {
        currentsong.pause();
        let currentFileName = currentsong.src.split("/").slice(-1)[0];
        // FIX: Decode URI component here as well
        let currentName = decodeURIComponent(currentFileName).replace(".mp3", "");
        
        let index = songname.indexOf(currentName);
        if ((index + 1) < songname.length) {
            playMusic(songname[index + 1]);
            id.src="pause.svg";
        }
    })

    document.querySelector(".volume-seekbar").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentsong.volume = parseInt(e.target.value)/100;
    })
}
main();
