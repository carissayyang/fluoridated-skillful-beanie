var i = 0,
  minimizedWidth = new Array(),
  minimizedHeight = new Array(),
  windowTopPos = new Array(),
  windowLeftPos = new Array(),
  panel,
  id;

function adjustFullScreenSize() {
  $(".fullSizeWindow .wincontent").css("width", window.innerWidth - 32);
  $(".fullSizeWindow .wincontent").css("height", window.innerHeight - 98);
}
function makeWindowActive(thisid) {
  $(".window").each(function () {
    $(this).css("z-index", $(this).css("z-index") - 1);
  });
  $("#window" + thisid).css("z-index", 1000);
  $(".window").removeClass("activeWindow");
  $("#window" + thisid).addClass("activeWindow");

  $(".taskbarPanel").removeClass("activeTab");

  $("#minimPanel" + thisid).addClass("activeTab");
}

function minimizeWindow(id) {
  windowTopPos[id] = $("#window" + id).css("top");
  windowLeftPos[id] = $("#window" + id).css("left");

  $("#window" + id).animate(
    {
      top: 800,
      left: 0,
    },
    200,
    function () {
      //animation complete
      $("#window" + id).addClass("minimizedWindow");
      $("#minimPanel" + id).addClass("minimizedTab");
      $("#minimPanel" + id).removeClass("activeTab");
    }
  );
}

function openWindow(id) {
  if ($("#window" + id).hasClass("minimizedWindow")) {
    openMinimized(id);
  } else {
    makeWindowActive(id);
    $("#window" + id).removeClass("closed");
    $("#minimPanel" + id).removeClass("closed");
  }
}
function closeWindow(id) {
  $("#window" + id).addClass("closed");
  $("#minimPanel" + id).addClass("closed");
}

function openMinimized(id) {
  $("#window" + id).removeClass("minimizedWindow");
  $("#minimPanel" + id).removeClass("minimizedTab");
  makeWindowActive(id);

  $("#window" + id).animate(
    {
      top: windowTopPos[id],
      left: windowLeftPos[id],
    },
    200,
    function () {}
  );
}

$(document).ready(function () {
  $(".window").each(function () {
    // window template
    $(this).css("z-index", 1000);
    $(this).attr("data-id", i);
    minimizedWidth[i] = $(this).width();
    minimizedHeight[i] = $(this).height();
    windowTopPos[i] = $(this).css("top");
    windowLeftPos[i] = $(this).css("left");
    $("#taskbar").append(
      '<div class="taskbarPanel" id="minimPanel' +
        i +
        '" data-id="' +
        i +
        '">' +
        $(this).attr("data-title") +
        "</div>"
    );
    if ($(this).hasClass("closed")) {
      $("#minimPanel" + i).addClass("closed");
    }
    $(this).attr("id", "window" + i++);
    $(this).wrapInner('<div class="wincontent"></div>');
    $(this).prepend(
      '<div class="windowHeader"><strong>' +
        $(this).attr("data-title") +
        '</strong><span title="Minimize" class="winminimize"><span></span></span><span title="Maximize" class="winmaximize"><span></span><span></span></span><span title="Close" class="winclose">x</span></div>'
    );
  });

  $("#minimPanel" + (i - 1)).addClass("activeTab");
  $("#window" + (i - 1)).addClass("activeWindow");

  $(".wincontent").resizable(); // resizable
$(".window").draggable({
    cancel: ".wincontent",
    containment: [10, 10, window.innerWidth - $(".window").outerWidth(), window.innerHeight - $(".window").outerHeight()]
});

  
  $(".window").mousedown(function () {
    // active window on top (z-index 1000)
    makeWindowActive($(this).attr("data-id"));
  });

  $(".winclose").click(function () {
    // close window
    closeWindow($(this).parent().parent().attr("data-id"));
  });

  $(".winminimize").click(function () {
    // minimize window
    minimizeWindow($(this).parent().parent().attr("data-id"));
  });

  $(".taskbarPanel").click(function () {
    // taskbar click
    id = $(this).attr("data-id");
    if ($(this).hasClass("activeTab")) {
      // minimize if active
      minimizeWindow($(this).attr("data-id"));
    } else {
      if ($(this).hasClass("minimizedTab")) {
        // open if minimized
        openMinimized(id);
      } else {
        // activate if inactive
        makeWindowActive(id);
      }
    }
  });

  $(".openWindow").click(function () {
    // open closed window
    openWindow($(this).attr("data-id"));
  });

  $(".winmaximize").click(function () {
    if ($(this).parent().parent().hasClass("fullSizeWindow")) {
      // minimize

      $(this).parent().parent().removeClass("fullSizeWindow");
      $(this)
        .parent()
        .parent()
        .children(".wincontent")
        .height(minimizedHeight[$(this).parent().parent().attr("data-id")]);
      $(this)
        .parent()
        .parent()
        .children(".wincontent")
        .width(minimizedWidth[$(this).parent().parent().attr("data-id")]);
    } else {
      // maximize
      $(this).parent().parent().addClass("fullSizeWindow");

      minimizedHeight[$(this).parent().parent().attr("data-id")] = $(this)
        .parent()
        .parent()
        .children(".wincontent")
        .height();
      minimizedWidth[$(this).parent().parent().attr("data-id")] = $(this)
        .parent()
        .parent()
        .children(".wincontent")
        .width();

      adjustFullScreenSize();
    }
  });
  adjustFullScreenSize();
});

async function loadNotes() {
  try {
    const response = await fetch("notes.json");
    const notes = await response.json();

    const notesList = document.getElementById("notes-list");
    const noteContent = document.getElementById("note-content");

    notesList.innerHTML = ""; // Clear existing list

    notes.forEach((note, index) => {
      const noteItem = document.createElement("div");
      noteItem.classList.add("note-item");
      noteItem.textContent = note.date; // Show only date

      noteItem.addEventListener("click", () => {
        // Remove active class from all notes
        document.querySelectorAll(".note-item").forEach(item => item.classList.remove("active-note"));

        // Set content and highlight active note
        noteContent.innerHTML = note.content.replace(/\n/g, "<br>");
        noteItem.classList.add("active-note");
      });

      notesList.appendChild(noteItem);
    });

    // Automatically open the first note if it exists
    if (notes.length > 0) {
      noteContent.innerHTML = notes[0].content.replace(/\n/g, "<br>");
      notesList.firstChild.classList.add("active-note"); // Highlight first note
    }
  } catch (error) {
    console.error("Error loading notes:", error);
  }
}

loadNotes();

async function loadGames() {
  try {
    const response = await fetch("games.json");
    const games = await response.json();

    const gamesList = document.getElementById("games-list");
    const gamesContent = document.getElementById("games-content");

    gamesList.innerHTML = ""; // Clear existing list

    // Loop through all the games
    games.forEach((game, index) => {
      const gameItem = document.createElement("div");
      gameItem.classList.add("game-item");

      // Add the game title to the list
      gameItem.textContent = game.title;

      // Add an event listener to show the game's content when clicked
      gameItem.addEventListener("click", () => {
        // Remove active class from all game items
        document.querySelectorAll(".game-item").forEach(item => item.classList.remove("active-game"));

        // Set content and highlight the active game
        gamesContent.innerHTML = `
          <h2>${game.title}</h2>
          <p>${game.description}</p>
          <img src="${game.image}" alt="${game.title}" style="width: 100%;" />
        `;
        gameItem.classList.add("active-game");  // Highlight the active game item
      });

      gamesList.appendChild(gameItem);  // Append the game item to the list
    });

    // Automatically open the first game if it exists
    if (games.length > 0) {
      gamesContent.innerHTML = `
        <h2>${games[0].title}</h2>
        <p>${games[0].description}</p>
        <img src="${games[0].image}" alt="${games[0].title}" style="width: 100%;" />
      `;
      gamesList.firstChild.classList.add("active-game");  // Highlight the first game item
    }
  } catch (error) {
    console.error("Error loading games:", error);
  }
}

// Call the loadGames function to populate the list when the page loads
loadGames();

async function loadSearches() {
    try {
        const response = await fetch("searches.json");
        if (!response.ok) throw new Error("Failed to load searches.json");

        const searches = await response.json();
        const searchList = document.getElementById("search-list");

        searchList.innerHTML = ""; // Clear existing content

        searches.forEach(search => {
            const searchItem = document.createElement("div");
            searchItem.classList.add("search-item");
            searchItem.textContent = `${search.date} - ${search.query}`;
            searchList.appendChild(searchItem);
        });

        // Add the note about automatic deletion
        const deletionNote = document.createElement("p");
        deletionNote.textContent = "Searches older than 15 days are automatically deleted.";
        deletionNote.style.fontSize = "12px";
        deletionNote.style.color = "#888";
        deletionNote.style.marginTop = "10px";
        deletionNote.style.textAlign = "center";

        searchList.appendChild(deletionNote);

    } catch (error) {
        console.error("Error loading searches:", error);
    }
}

loadSearches();



$(".window[data-title='Messages']").on("resize", function () {
  $("#messagesFrame").css({
    width: "100%",
    height: "100%",
  });
});

document.addEventListener("DOMContentLoaded", function () {
    const musicWindow = document.querySelector(".window[data-title='Music']");
    const playlistTabs = document.getElementById("playlist-tabs");
    const trackList = document.getElementById("track-list");
    const audioPlayer = document.getElementById("audio-player");

    if (!musicWindow || !playlistTabs || !trackList || !audioPlayer) {
        console.error("❌ Music window elements not found!");
        return;
    }

    // Fetch the playlists from music.json
    fetch("music.json")
        .then(response => response.json())
        .then(data => {
            const playlists = data.Playlists;
            if (!playlists) {
                console.error("❌ No playlists found in JSON!");
                return;
            }

            // Populate playlist tabs
            Object.keys(playlists).forEach((playlistName, index) => {
                let tab = document.createElement("button");
                tab.classList.add("playlist-tab");
                tab.textContent = playlistName;

                tab.addEventListener("click", () => {
                    loadPlaylist(playlists[playlistName]);
                });

                playlistTabs.appendChild(tab);

                // Load the first playlist by default
                if (index === 0) {
                    loadPlaylist(playlists[playlistName]);
                }
            });
        })
        .catch(error => console.error("❌ Error loading music.json:", error));

    // Load and display songs from the selected playlist
    function loadPlaylist(songs) {
        trackList.innerHTML = ""; // Clear previous tracks

        songs.forEach((song, index) => {
            let track = document.createElement("div");
            track.classList.add("track-item");
            track.textContent = song.name; // Display song title

            track.addEventListener("click", () => {
                playSong(song.file, song.name);
            });

            trackList.appendChild(track);
        });
    }

    // Play the selected song
    function playSong(songPath, songTitle) {
        audioPlayer.src = songPath;
        audioPlayer.play();

        // Optional: Display the song title in the player area
        document.getElementById("now-playing").textContent = `Now Playing: ${songTitle}`;
    }
  
  // Stop music when the window is closed
    musicWindow.querySelector(".winclose").addEventListener("click", function () {
        audioPlayer.pause();
        audioPlayer.currentTime = 0; // Reset to beginning
    });
});

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      enterFullscreen();
      animateLoginScreen();
    }
  });
});

function animateLoginScreen() {
  const loginScreen = document.getElementById("login-screen");
  loginScreen.classList.add("hidden"); // Apply the scrolling animation

  // Delay the reveal of the desktop until animation is complete
  setTimeout(() => {
    loginScreen.style.display = "none"; // Hide it completely after animation
    document.getElementById("desktop").classList.remove("hidden");
  }, 500); // Matches the CSS transition time
}

function enterFullscreen() {
  let elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

function openImage(url) {
    const viewer = document.getElementById("image-viewer");
    const viewerImg = document.getElementById("viewer-image");
    const loader = document.getElementById("image-loader"); // Get loader element

    // Show viewer and loader, hide image initially
    viewer.style.visibility = "visible";
    viewer.style.opacity = "1";
    loader.style.visibility = "visible"; // Ensure loader is visible
    loader.style.opacity = "1";
    viewerImg.style.display = "none";

    // Force repaint so loader actually appears before loading starts
    loader.offsetHeight;  // This line forces a reflow before setting image src
  
    // Load the image
    viewerImg.src = url;

    viewerImg.onload = () => {
        loader.style.visibility = "hidden"; // Hide loader when image loads
        loader.style.opacity = "0";
        viewerImg.style.display = "block"; // Show image
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const closeButton = document.getElementById("close-viewer");
    const viewer = document.getElementById("image-viewer");

    if (closeButton) {
        closeButton.addEventListener("click", closeViewer);
    } else {
        console.error("❌ close-viewer button not found!");
    }

    if (viewer) {
        viewer.addEventListener("click", (event) => {
            if (event.target === viewer) {
                closeViewer();
            }
        });
    } else {
        console.error("❌ image-viewer container not found!");
    }
});

function closeViewer() {
    const viewer = document.getElementById("image-viewer");
    const viewerImg = document.getElementById("viewer-image");
    const loader = document.getElementById("image-loader");

    if (viewer) {
        viewer.style.opacity = "0";
        setTimeout(() => {
            viewer.style.visibility = "hidden";
            viewerImg.src = ""; // Clear image
            loader.style.visibility = "hidden"; // Ensure loader is hidden
            loader.style.opacity = "0";
        }, 300);
    }
}

//file explorer code
document.addEventListener("DOMContentLoaded", function () {
    const fileExplorer = document.querySelector(".window[data-title='File Explorer']");
    const fileList = document.getElementById("file-list");
    const backButton = document.querySelector(".back-button");
    const fileExplorerIcon = document.querySelector(".openWindow[data-id='7']"); // Ensure correct data-id

    if (!fileExplorer || !fileList || !backButton || !fileExplorerIcon) {
        console.error("❌ File Explorer elements not found!");
        return;
    }

    let currentPath = ["Main Directory"];

    let fileSystem = {
        "Main Directory": {
            "Documents": {
                "Resume.pdf": "file",
                "Art_Ideas.txt": "file"
            },
            "Downloads": {
                "Image1.png": "file",
                "Software.exe": "file"
            },
            "Projects": {
                "Code.java": "file",
                "Notes.docx": "file"
            }
        }
    };

    function openFolder(path) {
        let folder = fileSystem;
        for (let part of path) {
            folder = folder[part];
        }

        fileList.innerHTML = "";
        backButton.style.display = path.length > 1 ? "block" : "none"; // Hide back button at root

        for (let name in folder) {
            let item = document.createElement("div");
            item.classList.add("file-icon");
            item.innerHTML = `<span class="material-symbols-outlined">
                ${folder[name] === "file" ? "insert_drive_file" : "folder"}
            </span> <span>${name}</span>`;

            if (folder[name] !== "file") {
                item.classList.add("file-folder");
                item.addEventListener("click", function () {
                    currentPath.push(name);
                    openFolder(currentPath);
                });
            } else {
                item.classList.add("file-item");
                item.addEventListener("click", function () {
                    createErrorWindow(`Cannot open ${name}: Admin permissions required.`);
                });
            }

            fileList.appendChild(item);
        }
    }

    function createErrorWindow(message) {
        const desktop = document.getElementById("desktop");

        let errorWindow = document.createElement("div");
        errorWindow.classList.add("window");
        errorWindow.style.width = "300px";
        errorWindow.style.height = "150px";
        errorWindow.style.position = "absolute";
        errorWindow.style.top = "50%";
        errorWindow.style.left = "50%";
        errorWindow.style.transform = "translate(-50%, -50%)";
        errorWindow.style.backgroundColor = "#fff";
        errorWindow.style.border = "2px solid #000";
        errorWindow.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
        errorWindow.style.zIndex = "1001";
        errorWindow.style.display = "flex";
        errorWindow.style.flexDirection = "column";
        errorWindow.style.alignItems = "center";
        errorWindow.style.justifyContent = "space-between";
        errorWindow.style.padding = "10px";
        errorWindow.innerHTML = `
            <div class="windowHeader" style="width: 100%; background-color: red; color: white; padding: 5px; text-align: center;">
                Error
                <button class="winclose" style="float: right; background: none; border: none; color: white; cursor: pointer;">&times;</button>
            </div>
            <div class="wincontent" style="padding: 10px; text-align: center;">
                ${message}
            </div>
        `;

        errorWindow.querySelector(".winclose").addEventListener("click", function () {
            errorWindow.remove();
        });

        desktop.appendChild(errorWindow);
    }

    backButton.addEventListener("click", function () {
        if (currentPath.length > 1) {
            currentPath.pop();
            openFolder(currentPath);
        }
    });

    fileExplorerIcon.addEventListener("click", function () {
        fileExplorer.classList.remove("closed");
        openFolder(["Main Directory"]);
    });

    fileExplorer.querySelector(".winclose").addEventListener("click", function () {
        fileExplorer.classList.add("closed");
    });
});
