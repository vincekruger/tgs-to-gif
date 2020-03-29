const fs = require('fs');
const path = require('path');
const { ArgumentParser } = require('argparse');
const { createBrowser, convertFile } = require('./index.js');

const convertImage = async (file) => {
  const pathinfo = require('pathinfo')
  const fs = require('fs')
  const extractFrames = require('gif-extract-frames')
  const pi = pathinfo(file)
  const outputdir = `${pi.dirname}/${pi.basename}-frames`

  /// Check if directory exists
  if (fs.existsSync(outputdir)) {
    fs.rmdirSync(outputdir, { recursive: true })
  }

  /// Create a new directory
  fs.mkdirSync(outputdir)

  /// Extract Frames
  const results = await extractFrames({
    input: file,
    output: `${outputdir}/frame-%d.png`,
    coalesce: false
  })

  /// Output
  console.log(`Extracted ${pi.basename}`, 'Number of frames', results.shape[0])
  return true
}

const convertFiles = async function (filePaths, browser, options) {
  for (const filePath of filePaths) {
    console.log(`Converting ${filePath}...`);

    try {
      await convertFile(filePath, { output: `${filePath}.gif`, browser, ...options });
      await convertImage(filePath + '.gif')
    } catch (e) {
      console.error(e);
    }
  }
};

const main = async function () {
  const parser = new ArgumentParser({
    description: 'Animated stickers for Telegram (*.tgs) to animated GIFs converter',
  });
  parser.addArgument('--height', { help: 'Output image height. Default: auto', type: Number });
  parser.addArgument('--width', { help: 'Output image width. Default: auto', type: Number });
  parser.addArgument('paths', { help: 'Paths to .tgs files to convert', nargs: '+' });

  const args = parser.parseArgs();

  const paths = args.paths;
  for (let i = 0; i < paths.length; ++i) {
    let filePath = paths[i];
    if (fs.lstatSync(filePath).isDirectory()) {
      for (const subFilePath of fs.readdirSync(filePath)) {
        if (path.extname(subFilePath) === '.tgs') {
          paths.push(path.join(filePath, subFilePath));
        }
      }
      paths.splice(i--, 1);
    }
  }

  const browser = await createBrowser({
    chromiumPath: process.env['CHROMIUM_PATH'],
    useSandbox: JSON.parse(process.env['USE_SANDBOX'] || 'true'),
  });
  await convertFiles(paths, browser, { width: args.width, height: args.height });
  await browser.close();
};

main();
