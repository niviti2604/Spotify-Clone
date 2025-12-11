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

    // .padStart(2, '0') ensures "5" becomes "05"
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// async function getSongs(folder) {
//     currFolder=folder;
//     let a = await fetch(`http://127.0.0.1:5501/${folder}/`);
//     let response = await a.text();
//     console.log("response:" ,response);
//     let div = document.createElement("div");
//     div.innerHTML = response;
//     console.log("div:" , div);
//     let as = div.getElementsByTagName("a");

//     for (let i = 0; i < as.length; i++) {
//         //songs array is collection of all links to songs
//         let song = as[i];
//         if (song.href.endsWith(".mp3")) {
//             songs.push(song.href);
//             let dummy = song.href.split(`/${folder}/`)[1];
//             songname.push(dummy.replace(".mp3", ""));
//         }
//     }
//     return songs;
// }

async function getSongs(folder) {
    currFolder = folder;
    
    // GitHub Pages cannot "scan" directories. We must list files manually.
    // ADD YOUR SONG FILENAMES HERE (without .mp3)
    let localSongs = [
        "Mileya Mileya",
        "Shut Up Bounce", 
        "Be My Baby",
        "Radha",
        "Dooron Dooron",
        "Tum Ho Toh"
    ];

    // Clear the arrays to avoid duplicates if called multiple times
    songs = [];
    songname = [];

    for (let i = 0; i < localSongs.length; i++) {
        // Construct the full path manually
        // Ensure your actual files are in 'songs/ncs/' in your repo
        let fullPath = `/${folder}/` + localSongs[i] + ".mp3";
        songs.push(fullPath);
        songname.push(localSongs[i]);
    }
    
    return songs;
}
const playMusic = (ganna, paused = false) => {
    currentsong.src = `/${currFolder}/` + ganna + ".mp3";
    if (!paused) {
        currentsong.play();
        document.querySelector("#play").src = "pause.svg";
    } else {
        document.querySelector("#play").src = "play-button.svg";
    }

    let decodedName = ganna.replaceAll("%20", " ");
    document.querySelector(".song-title").innerHTML = decodedName;
    
    let songImage = document.querySelector(".song-info-image");
    if (songImage) {
        songImage.src = decodedName + ".jpg";
    }
    document.title = "Spotify - " + decodedName;
}

async function main() {
    let songs = await getSongs("songs/ncs");
    
    // Load first song but don't play
    if (songname.length > 0) {
        playMusic(songname[0], true);
    }

    // --- 1. Auto-Generate Library List (Your original code) ---
    let songul = document.querySelector(".lib-cards ul");
    if (!songul) {
        console.error("Could not find the '.lib-cards ul' element!");
        return;
    }
    
    for (const name of songname) {
        songul.innerHTML += `<li> <img src="${name.replaceAll('%20', " ") + ".jpg"}" alt="" class=>
                        <div class="info">
                            <div class="bold">${name.replaceAll('%20', " ")}</div>
                            <div class="normal">Niviti Sharma</div>
                        </div>
                           
                           <div clas="lib-circle">
                           <img src="play-button.svg" alt="" class="">
                           </div>
                        </li>`;
    }

    // --- 2. [NEW] Auto-Generate Playlist Cards ---
    let cardContainer = document.querySelector(".cards");
    if (cardContainer) {
        cardContainer.innerHTML = ""; // Clear existing hardcoded cards
        for (const name of songname) {
            let cleanName = name.replaceAll("%20", " ");
            // Creates a card for every song found in the folder
            cardContainer.innerHTML += `
                <div class="card bg-grey-light round-border">
                    <img src="${cleanName}.jpg" alt="${cleanName}" onerror="this.src='music-note-svgrepo-com.svg'">
                    <div class="cardtitle">${cleanName}</div>
                    <div class="about">Niviti Sharma</div>
                </div>`;
        }
    }

    // --- 3. Attach Click Listeners to Library ---
    Array.from(document.querySelector(".lib-cards").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let songToPlay = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songToPlay.replaceAll(" ", "%20"));
        })
    })

    // --- 4. Attach Click Listeners to New Cards ---
    Array.from(document.querySelectorAll(".cards .card")).forEach(card => {
        card.addEventListener("click", e => {
            let cardTitle = card.querySelector(".cardtitle").innerHTML.trim();
            let encodedTitle = cardTitle.replaceAll(" ", "%20");
            
            if (songname.includes(encodedTitle)) {
                playMusic(encodedTitle);
            }
        });
    });

    // --- Playbar & Controls (Kept exactly as is) ---
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
        document.querySelector(".circle").style.left = ((currentsong.currentTime) / (currentsong.duration)) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        document.querySelector(".circle").style.left = ((e.offsetX * 100) / (e.target.getBoundingClientRect().width) + "%");
        currentsong.currentTime = currentsong.duration * (e.offsetX) / (e.target.getBoundingClientRect().width);
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
        let currentName = currentFileName.replace(".mp3", "");
        let index = songname.indexOf(currentName);
        if ((index - 1) >= 0) {
            playMusic(songname[index - 1]);
            id.src="pause.svg";
        }
    })

    next.addEventListener("click", () => {
        currentsong.pause();
        let currentFileName = currentsong.src.split("/").slice(-1)[0];
        let currentName = currentFileName.replace(".mp3", "");
        let index = songname.indexOf(currentName);

        if ((index + 1) < songname.length) {
            playMusic(songname[index + 1]);
            id.src="pause.svg";
        }
    })

    document.querySelector(".volume-seekbar").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log(e.target.value);
        currentsong.volume=parseFloat(e.target.value)/100;
    })
}
main();