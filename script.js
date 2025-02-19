// const hash = location.hash;
// const id= hash.split('#')[1];
// const videoElement = document.querySelector('video'); // séléctionner la balise vidéo se trouvant dans le DOM
// console.log("id",id);
// console.log(videoElement, "test");
// const peer = new Peer(id, {
//     host: location.hostname, // récupérer l'adresse locale du serveur
//     port: '3001'
// });

// console.log("host", location.hostname);

// const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// // Connexion des données
//     // demande de connexion
// const conn = peer.connect("another-peers-id");
// conn.on("open", () => {
// 	conn.send("hi!");
// });

//     // réception de la demande de connexion
// peer.on("connection", (conn) => {
// 	conn.on("data", (data) => {
// 		// Will print 'hi!'
// 		console.log(data);
// 	});
// 	conn.on("open", () => {
// 		conn.send("hello!");
// 	});
// });


// // Les appels
// // Appelant
// navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//   .then((stream) => {
//     const call = peer.call("2", stream);
//     call.on("stream", (remoteStream) => {
//         console.log("Accès aux médias réussi !");
//       // Gérer le flux distant
//     });
//   })
//   .catch((err) => {
//     console.error("Échec de l'accès aux médias", err);
//   });

// // Répondeur
// peer.on("call", (call) => {
//   navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//     .then((stream) => {
//       call.answer(stream);
//       call.on("stream", (remoteStream) => {
//         videoElement.srcObject = remoteStream;
//         videoElement.play();
//       });
//     })
//     .catch((err) => {
//       console.error("Échec de l'accès aux médias", err);
//     });
// });

const hash = location.hash;
const id = hash ? hash.substring(1) : Math.random().toString(36).substring(2, 10); // Génère un ID aléatoire si aucun n'est fourni

console.log("Mon ID PeerJS :", id); // Vérification dans la console

const peer = new Peer(id, {
    host: "localhost",
    port: 3001,
    path: "/",
    debug: 3
});

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const peerIdDisplay = document.getElementById("peer-id");
const remoteIdInput = document.getElementById("remote-id");

let localStream;

// Affichage de l'ID PeerJS
peer.on("open", (id) => {
  console.log("Mon ID PeerJS :", id);
  
  if (peerIdDisplay) {
      peerIdDisplay.textContent = id;
  } else {
      console.error("⚠️ Élément peer-id introuvable !");
  }
});

// Gestion des erreurs PeerJS
peer.on("error", (err) => {
    console.error("Erreur PeerJS :", err);
});

// Accès aux médias (caméra et micro)
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        console.log("🎥 Stream local obtenu !");
        localStream = stream;

        // Vérification des pistes audio et vidéo
        stream.getTracks().forEach(track => track.enabled = true);
        console.log("Pistes activées :", stream.getTracks());

        localVideo.srcObject = stream;
    })
    .catch((err) => {
        console.error("❌ Erreur d'accès aux médias :", err);
    });

// Fonction pour se connecter à un autre peer
function connectToPeer() {
    const remoteId = remoteIdInput.value;
    if (!remoteId) {
        alert("Veuillez entrer un ID de peer valide.");
        return;
    }

    // Connexion au peer distant
    const conn = peer.connect(remoteId);
    conn.on("open", () => {
        console.log("✅ Connecté à", remoteId);
        conn.send("Salut !");
    });

    conn.on("data", (data) => {
        console.log("📩 Message reçu :", data);
    });

    if (!localStream) {
        console.error("⚠️ Aucun flux local disponible !");
        return;
    }

    // Démarrer un appel vidéo
    const call = peer.call(remoteId, localStream);
    call.on("stream", (remoteStream) => {
        console.log("📡 Flux distant reçu !");
        remoteVideo.srcObject = remoteStream;
    });

    call.on("error", (err) => {
        console.error("❌ Erreur d'appel :", err);
    });
}

// Réception d'un appel
peer.on("call", (call) => {
    console.log("📞 Appel entrant...");

    if (!localStream) {
        console.error("⚠️ Aucun flux local pour répondre !");
        return;
    }

    call.answer(localStream);
    console.log("✅ Répond à l'appel...");

    call.on("stream", (remoteStream) => {
        console.log("📡 Flux distant reçu !");
        remoteVideo.srcObject = remoteStream;
    });

    call.on("error", (err) => {
        console.error("❌ Erreur lors de l'appel :", err);
    });
});
