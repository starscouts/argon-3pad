(async () => {
    const fs = require('fs');
    const axios = require('axios');
    const child_process = require('child_process');

    if (fs.existsSync("./output")) fs.rmSync("./output", { recursive: true });
    fs.mkdirSync("./output");

    let output = {};
    let total = 0;
    console.log("Fetching server...");
    const songs = (await axios.get("https://argon.minteck.org/api/get_list.php")).data.songs;

    console.log("Processing songs...");
    for (let id of Object.keys(songs)) {
        if (!id.startsWith(":")) {
            const song = songs[id];
            console.log(id + " (" + song.author + " - " + song.name + ")")
            let o = {
                _total: -1,
                local: song._localViews,
                youtube: null,
                soundcloud: null
            }

            if (song.external.youtube) {
                let dl = JSON.parse(child_process.execFileSync("yt-dlp", ["-j", "https://youtu.be/" + song.external.youtube]).toString());
                console.log("    " + dl.view_count + " view(s) on YouTube");
                o.youtube = dl.view_count;
            } else {
                console.log("    Song is not on YouTube");
            }

            if (song.external.soundcloud) {
                let dl = JSON.parse(child_process.execFileSync("yt-dlp", ["-j", "https://soundcloud.com/" + song.external.soundcloud]).toString());
                console.log("    " + dl.view_count + " view(s) on SoundCloud");
                o.soundcloud = dl.view_count;
            } else {
                console.log("    Song is not on SoundCloud");
            }

            o._total = o.local + o.youtube + o.soundcloud
            total += o._total;
            output[id] = o;
        }
    }

    fs.writeFileSync("./output/data.json", JSON.stringify(output, null, 2));
    fs.writeFileSync("./output/total.json", JSON.stringify(total, null, 2));
})()