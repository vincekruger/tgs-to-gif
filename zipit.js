const { zip } = require('zip-a-folder');
const fs = require('fs')

const main = async function () {
    await zip('/source', '/source.zip');
    fs.copyFileSync('/source.zip', '/source/archive.zip')
}

main()