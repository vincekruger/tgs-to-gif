const pathinfo = require('pathinfo')
const fs = require('fs')

const convertImage = async (file) => {
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

(async () => {
    if (undefined === process.argv[2]) console.error('Need a path to a gif image / directory containing gif images')
    const file = process.argv[2]

    /// Directory
    if (fs.lstatSync(file).isDirectory()) {
        const fileList = fs.readdirSync(file)
        fileList.forEach(async (i) => {
            const loc = `${file}/${i}`
            const pi = pathinfo(loc)
            if(pi.extname !== '.gif') return

            await convertImage(loc)
        })
        return
    }

    /// Single File
    await convertImage(file)
    return
})()