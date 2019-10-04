const
    cmd = require('node-run-cmd'),
    path = require("path"),
    glob = require('glob-fs')({
        gitignore: true
    }),
    prompt = require('prompt'),
    fs = require('fs-extra')

const basepath = path.resolve(__dirname) + "/.." + "/..";
const path_slidedecks = "_lehrveranstaltungen";
const fullpath_slidedecks = basepath + "/" + path_slidedecks;
const static = "--static";
const staticDefaultOutput = "static";
const slidesDefaultOutput = '_lehrveranstaltungen'
const staticDirs = `mi-slides/custom-themes`; // "../../mi-slides/custom-themes"
const staticAdditionalContent = ["examples", "images", "assignments", "links", "assas"];

const theme = "/mi-slides/custom-themes/medieninformatik-semantic.css";
const preprocessor = "mi-slides/core/reveal-md-pre.js";
const script = "mi-slides/core/reveal-md-add-icons.js";

let params = process.argv[3];
const reveal_command = {};
reveal_command.tool = "node node_modules/reveal-md/bin/cli.js --highlight-theme Vs";
reveal_command.options = "-w";
reveal_command.scripts = "--scripts " + script;
reveal_command.preprocessor = "--preprocessor " + preprocessor;
reveal_command.theme = "--theme " + theme;
reveal_command.static = (params === "static") ? " " + "--static-dirs=" + staticDirs + " " + static + " " + slidesDefaultOutput : "";
reveal_command.slides = "";


let walk = function (dir) {
    let results = []
    let list = fs.readdirSync(dir)
    list.forEach(function (file) {
        file = dir + '/' + file
        let stat = fs.statSync(file)

        if (stat && stat.isDirectory()) results = results.concat(walk(file))
        else if (!file.match(/\/assets\//) && file.match(/\.md$/)) {
            results.push(file)
        }
    })
    return results
}

let slidedecks = {};
let count = 0;

walk(fullpath_slidedecks).forEach(path => {
    let slidedeck = {};
    let slidedeckName = path.replace(fullpath_slidedecks + "/", "")

    // We dont want all the archive markdown files
    if (!slidedeckName.includes('_archiv')) {
        count++;
        slidedeck.name = path.replace(fullpath_slidedecks + "/", "");
        slidedeck.fullpath = path;
        slidedeck.relpath = slidedeck.fullpath.replace(fullpath_slidedecks, "");
        slidedeck.relpath = slidedeck.relpath.replace(/(.*)\/.*/, '$1/');
        slidedecks[count] = slidedeck;

        /**
         * As a Proof of Concept we generate the slides only for the following day
         * if we remove the if-statemanet, we generate slides for every day (if possible)
         */
        if (slidedeckName.includes('fd1-04-05.md')) {
            // Moved the prompt stuff here so we generate slides for every markdown file
            let c = create_command(slidedecks[count]);
            console.log(c);

            cmd.run(c).then(function (exitCodes) {
                if (c.match(/static/)) {
                    copyAdditionalContent(slidedecks[count]);
                }

            }, function (err) {
                console.log('Command failed to run with error: ', err);
            });
        }
    }


});

//console.log("\na: abbrechen\n");

/* Create Reveal Command 
-----------------------------------------------------------------------------*/
function create_command(slidedeck) {

    if (reveal_command["static"]) {
        reveal_command["static"] += slidedeck.relpath
    }

    let c = [];
    Object.keys(reveal_command).forEach(function (element) {
        var fileName = slidedeck.name.split('.')
        if (element == 'static') {
            var slidesDestination = `${reveal_command[element]}${fileName[0]}/slides`
            c.push(slidesDestination);
        } else {
            c.push(reveal_command[element]);
        }
    });

    return c.join(" ") + path_slidedecks + "/" + slidedeck.name;
}


/* Copy Additional Content to static Folder
-----------------------------------------------------------------------------*/
function copyAdditionalContent(slidedeck) {

    let params = {};
    const path = slidedeck.fullpath.substring(0, slidedeck.fullpath.lastIndexOf("/"));

    staticAdditionalContent.forEach(function (folder) {
        folder = escape(folder);
        params.src = path + "/" + folder;
        params.target = `${staticDefaultOutput}/${slidedeck.name}/slides${slidedeck.relpath}${folder}`;
        if (fs.existsSync(params.src)) { fs.copySync(params.src, params.target); }

    });
}