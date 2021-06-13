const prompt = require('prompt-sync')();
const axios = require("axios").default;
const cheerio = require('cheerio');
const ChordSheetJS = require('chordsheetjs').default;
const fs = require('fs').promises;

const fetchHtml = async url => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch {
    console.error(
      `ERROR: An error occurred while trying to fetch the URL: ${url}`
    );
  }
};

const chordpro = new ChordSheetJS.ChordProFormatter();
const parser = new ChordSheetJS.UltimateGuitarParser({
  preserveWhitespace: false
});

const convert = (input) => {
  const parsed = parser.parse(input);
  return chordpro.format(parsed);
}

const parseCifraClubHtml = (cifraClubHtml) => {
  const $ = cheerio.load(cifraClubHtml);
  const title = $('h1.t1').text()
  const subtitle = $('h2.t3').text()
  const tune = $('span#cifra_tom > a').text()
  const chords = $('pre').text()
  return {
    title, subtitle, tune, chords
  }
}

const convertCifraClubChordObjToChordProObj = (cifraClubChordObj) => {
  cifraClubChordObj.chord = convert(cifraClubChordObj.chords)
  chordProChordObj = cifraClubChordObj;
  return chordProChordObj;
}

const convertChordProChordObjToChordProChordText = (chordProChordObj) => {
  let chordProChordText = '';
  chordProChordText += `{title: ${chordProChordObj.title}}\n`;
  chordProChordText += `{subtitle: ${chordProChordObj.subtitle}}\n\n`;
  chordProChordText += `{key: ${chordProChordObj.tune}}\n\n`;
  chordProChordText += chordProChordObj.chord;
  return chordProChordText;
}

const linkInput = (text) => {
  const urlInput = prompt(`${text} => `) || 'https://www.cifraclub.com.br/comunidade-catolica-shalom/perdoa-me/'; //link de teste
  const url = `${urlInput}`
  return url;
}

const readFile = async (filename) => {
  const file = await fs.readFile(filename, 'utf8');
  return file;
}

const stringToFile = async (filename, string) => {
  await fs.writeFile(filename, string);
}

const urlToChordProText = async (url) => {
  const html = await fetchHtml(url);
  const cifraClubChordObj = parseCifraClubHtml(html);
  const chordProChordObj = convertCifraClubChordObjToChordProObj(cifraClubChordObj);
  const chordProChordText = convertChordProChordObjToChordProChordText(chordProChordObj);
  console.log(chordProChordText)
  return chordProChordText;
}

const urlFileToUrlArray = (urlsFile) => {
  return urlsFile.split('\n');
}

const main = async () => {

  const urlsFile = await readFile('links.txt');
  const urlsArray = urlFileToUrlArray(urlsFile);

  let completeChordText = '';

  for (url of urlsArray) {
    const currentChordProChordText = await urlToChordProText(url);
    completeChordText += `\n${currentChordProChordText}`;
    completeChordText += '\n\n{new_song}\n';
  }

  stringToFile('result.cho', completeChordText);
}

main()