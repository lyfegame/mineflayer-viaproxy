// const fetch = require('node-fetch');
const join = require('path').join;
const {createWriteStream} = require('fs');


const BASE_VIAPROXY_URI = 'https://ci.viaversion.com/view/Platforms/job/ViaProxy/lastStableBuild';
async function getViaProxyJar(use8) {
    const req = await fetch(BASE_VIAPROXY_URI);
    const html = await req.text();

    if (html == null) {
        return null;
    }

    const version = html.match(/ViaProxy-([0-9.]+)/)[1];
    const snapshot = html.includes('SNAPSHOT');

    // build filename
    let filename = 'ViaProxy-';
    filename += version;
    filename += snapshot ? '-SNAPSHOT' : '-RELEASE';
    filename += use8 ? '+java8' : '';
    filename += '.jar';

    return { version, snapshot, filename };
}


async function fetchViaProxyJar(path, version, filename) {
        const url = `${BASE_VIAPROXY_URI}/artifact/build/libs/${filename}`;
        const resp2 = await fetch(url);

        if (resp2.status !== 200) {
            return null;
        }

  // const path = join(__dirname, filename)
  const filepath = join(path, filename);
  const fileStream = createWriteStream(filepath);

  const stream = new WritableStream({
    write(chunk) {
      fileStream.write(chunk);
    },
  });

  if (!resp2.body) throw new Error("No body in response");
  await resp2.body.pipeTo(stream);

  return filepath;
}


(async () => {
    const info = await getViaProxyJar(false);
    if (info == null) {
        console.error("Failed to get ViaProxy jar info");
        return;
    }

   await fetchViaProxyJar(process.cwd(), info.version, info.filename);
})();
