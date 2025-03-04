//transition: 'slide', // none/fade/slide/convex/concave/zoom

module.exports = (markdown, options) => {
	// We only want to slidify the markdown file if the creator has stated, that he wants to with the "slide-is:start"
	if(markdown.includes('slide-is:start'))
	return new Promise((resolve, reject) => {
		// Only the piece of markdown which has slide-is stuff gets slidified
		valid_markdown = markdown.split('slide-is:start -->')
		return resolve(
			valid_markdown[1]
			.split('\n')
			.map((line, index) => {
				let mode = false;
				let data = false;
				let backgroundTransition = false;

				// Farben
				let lila = "#9313CE";
				let blue = "#4952E1";
				let green = "#00AD2F";
				let magenta = "#dd1166";
				let gray = "#444433";
				let black = "#000000";

				// Graugenerator
				let shades = ["d", "e", "f"];

				function rand_grey() {
					var item1 = shades[Math.floor(Math.random() * shades.length)];
					var item2 = shades[Math.floor(Math.random() * shades.length)];
					return "#" + item1 + item2 + item1 + item2 + item1 + item2;
				}

				// Farbgenerator
				let colors = [green, blue, magenta, gray];

				function rand_color() {
					return colors[Math.floor(Math.random() * colors.length)];
				}

				// Aussage holen
				let exp = new RegExp("slide-is:(.*)", "g");
				let [all, what] = exp.exec(line) || [];


				// Aussage zerlegen
				if (what) {
					what = what.replace(/^ /, "");
					[mode, data, backgroundTransition] = what.split(/ /);
					mode = mode.replace(/ /, "");
				}

				// Klasse einbauen
				line = line.replace(/slide-is:(.*)/, "<!-- .slide: class=\"" + mode + " {{klassen}}\" {{style}}-->\n");

				// ggf. Icon einbauen
				if (line.match(/icon:(.*?)/)) {
					line = line.replace(/icon:(.*?)[ |$]/, "<i class=\"fa fa-$1\" aria-hidden=\"true\"></i>");
				}

				// ggf. Fragment einbauen
				if (line.match(/^-/)) {
					line = line + '<!-- .element: class="fragment" -->';
				}

				// Zusätzliche Aktionen einbauen
				if (mode == "welcome") {

					line = line.replace(/{{klassen}}/, "center");
					line = '<!-- .slide: data-background="' + lila + '" -->\n' + line;

				} else if (mode == "outro") {

					line = line.replace(/{{klassen}}/, "center");
					line = '<!-- .slide: data-background="' + lila + '" -->\n' + line;

				} else if (mode == "image-fullscreen") {

					line = line.replace(/{{klassen}}/, "center");
					line = '<!-- .slide: data-background="' + data + '" -->\n' + line;

				}else if (mode == "image" || mode == "image-text") {

					line = line.replace(/{{klassen}}/, "center");
					line = '<!-- .slide: data-background="' + data + '" -->\n' + line;

				} else if (mode == "interlude") {

					line = line.replace(/{{klassen}}/, "center");
					line = '<!-- .slide: data-background="' + rand_color() + '" -->\n' + line;

				}else if (mode == "video") {

					line = line.replace(/{{klassen}}/, "center");
					line = '<!-- .slide: data-background="'+black+'" -->\n' + line;

				}else if (mode == "conclusion") {

					line = line.replace(/{{klassen}}/, "center");
					line = '<!-- .slide: data-background="' + green + '" -->\n' + line;

				} else if (mode == "assignment") {

					line = line.replace(/{{klassen}}/, "center");


				} else if (mode == "simple") {

					line = line.replace(/{{klassen}}/, "center");


				} else if (mode == "explanation") {

					line = line.replace(/{{klassen}}/, "center");
					line = '<!-- .slide: data-transition="convex" data-background-transition="scroll" data-background="' + rand_grey() + '" -->\n' + line;

				}

				if(backgroundTransition){
					line = line.replace(/{{style}}/, "data-background-transition=\"" + backgroundTransition + "\"");
					
				}

				line = line.replace(/{{style}}/, "");
				return line.replace(/{{klassen}}/, "");
			})
			.join('\n')
		);
	});
};