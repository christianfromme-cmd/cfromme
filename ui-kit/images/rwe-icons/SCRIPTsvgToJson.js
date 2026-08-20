const fs = require('fs');
const path = require('path');

const currentDir = __dirname;

// Manuell gesetzte Werte
const VARIANT = 'primary';
const META = {
  description: 'Lorem Ipsum.',
};

function getSVGsInDirectory(dir, parentFolder = null) {
  let itemsArray = [];

  const items = fs.readdirSync(dir);

  for (let item of items) {
    const fullPath = path.join(dir, item);

    if (fs.statSync(fullPath).isDirectory()) {
      // rekursive Suche in Unterverzeichnissen
      itemsArray = itemsArray.concat(
        getSVGsInDirectory(fullPath, item === 'svg' ? parentFolder : item),
      );
    } else if (path.extname(item) === '.svg') {
      const directoryName = path.basename(dir);

      itemsArray.push({
        name: path.basename(item, '.svg'),
        path: `../..${fullPath}`, // absoluter Pfad zur SVG mit `../..` vorangestellt
        variant: VARIANT,
        folder: directoryName === 'svg' ? parentFolder : directoryName, // Ordnername oder übergeordneter Ordner
      });
    }
  }

  return itemsArray;
}

const svgItems = getSVGsInDirectory(currentDir);

const output = {
  items: svgItems,
  meta: META,
};

fs.writeFileSync(
  path.join(currentDir, 'output.json'),
  JSON.stringify(output, null, 2),
);

console.log('Script abgeschlossen!');
