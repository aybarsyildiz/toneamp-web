// static song + artist pages from the app catalog, run after vite build.
// catalog source: ../ToneAmp/SeedCatalog.json (app repo), snapshotted to data/catalog.json
// so a clean checkout of this repo still builds.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://toneamp.netnucleus.solutions';
const STORE = 'https://apps.apple.com/app/id6792555370';
const APP_SRC = path.resolve(ROOT, '../ToneAmp/SeedCatalog.json');
const SNAP = path.join(ROOT, 'data/catalog.json');

if (fs.existsSync(APP_SRC)) {
  fs.mkdirSync(path.dirname(SNAP), {recursive: true});
  fs.copyFileSync(APP_SRC, SNAP);
}
if (!fs.existsSync(DIST)) throw new Error('dist/ missing, run vite build first');
const songs = JSON.parse(fs.readFileSync(SNAP, 'utf8'));

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.toLowerCase().replace(/ı/g, 'i').replace(/&/g, ' and ').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const num = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const isTR = (s) => s.genre === 'Anadolu Rock';
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');
const write = (rel, html) => {
  const file = path.join(DIST, rel, 'index.html');
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, html);
};

const T = {
  en: {amp: 'Amp', guitar: 'Guitar', pickup: 'Pickup', chain: 'Signal chain', notes: 'Notes', key: 'Key', chords: 'Chords',
    more: 'More by', all: 'All songs', open: 'Open in ToneAmp', adapt: 'Adapt this tone to your own amp and pedals in the app.',
    disclaimer: 'These are starting points, not gospel. Every amp is a little different, so let your ears do the last 10%.',
    crumbs: 'Artists', direct: 'no pedals, straight into the amp'},
  tr: {amp: 'Amfi', guitar: 'Gitar', pickup: 'Manyetik', chain: 'Sinyal zinciri', notes: 'Notlar', key: 'Ton', chords: 'Akorlar',
    more: 'Diğer şarkılar:', all: 'Tüm şarkılar', open: "ToneAmp'te aç", adapt: 'Bu tonu uygulamada kendi amfine ve pedallarına uyarla.',
    disclaimer: 'Bunlar başlangıç noktası. Her amfi biraz farklı, son ayarı kulağınla yap.',
    crumbs: 'Sanatçılar', direct: 'pedal yok, direkt amfiye'},
};

const CSS = `:root{--g:#0a0908;--bone:#f1ece1;--acc:#ff6a1a;--dim:rgba(241,236,225,.58);--hair:rgba(241,236,225,.12);--card:#14120f}
*{box-sizing:border-box}body{margin:0;background:var(--g);color:var(--bone);font:17px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:inherit}.mono{font-family:ui-monospace,Menlo,monospace}.wrap{max-width:860px;margin:0 auto;padding:0 20px}
header.top{display:flex;justify-content:space-between;align-items:center;padding:22px 0;border-bottom:1px solid var(--hair)}
header.top a.logo{color:var(--acc);font-weight:800;letter-spacing:.12em;text-decoration:none;font-size:14px}
nav{display:flex;gap:14px;flex-wrap:wrap;justify-content:flex-end}nav a{color:var(--dim);text-decoration:none;font-size:14px}nav a:hover{color:var(--bone)}
.crumbs{font-size:13px;color:var(--dim);margin:28px 0 8px}.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--bone)}
.hero{display:flex;gap:18px;align-items:center;margin:8px 0 28px}.hero>div{min-width:0}.hero img{width:132px;height:132px;border-radius:18px;flex:none}
h1{overflow-wrap:break-word;font-size:clamp(28px,7vw,46px);line-height:1.08;margin:0 0 8px;letter-spacing:-.02em}.meta{color:var(--dim);margin:0}
.tone{background:var(--card);border:1px solid var(--hair);border-radius:22px;padding:24px;margin:22px 0}
.tone h2{margin:0 0 4px;font-size:24px}.tone .char{color:var(--acc);font-size:13px;letter-spacing:.1em;text-transform:uppercase}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(160px,100%),1fr));gap:8px 20px;margin:16px 0;font-size:15px}
.facts b{display:block;font-size:12px;color:var(--dim);font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.knobs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:18px 0}
.knob{border:1px solid var(--hair);border-radius:14px;padding:10px 12px}.knob span{font-size:11px;color:var(--dim);letter-spacing:.1em}
.knob strong{display:block;font-size:30px;line-height:1.1}.bar{height:4px;background:var(--hair);border-radius:2px;margin-top:6px}
.bar i{display:block;height:100%;background:var(--acc);border-radius:2px}
.chain{list-style:none;padding:0;margin:12px 0}.chain li{border-left:2px solid var(--acc);padding:6px 0 6px 14px;margin:0 0 10px}
.chain .ctl{font-size:13px;color:var(--dim)}.notes{color:var(--dim);margin:12px 0 0}
.cta{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin:30px 0;padding:22px;border:1px solid rgba(255,106,26,.4);border-radius:22px}
.cta a.btn{background:var(--acc);color:var(--g);font-weight:700;padding:12px 20px;border-radius:12px;text-decoration:none}
.cta p{margin:0;color:var(--dim);flex:1;min-width:200px}.small{font-size:14px;color:var(--dim)}
@media(max-width:520px){.tone{padding:18px}.hero img{width:96px;height:96px}.knob strong{font-size:24px}}
html,body{overflow-x:hidden}ul.list{columns:2 240px;padding:0;list-style:none}ul.list li{margin:0 0 6px;break-inside:avoid}ul.list a{text-decoration:none}ul.list a:hover{color:var(--acc)}
h2.sec{font-size:22px;margin:34px 0 10px}footer{border-top:1px solid var(--hair);margin-top:48px;padding:24px 0 40px;font-size:13px;color:var(--dim)}`;

const head = ({lang, title, desc, url, ld}) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:site_name" content="ToneAmp"><meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/og.png">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#0a0908">
<link rel="stylesheet" href="/songpages.css">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script></head><body><div class="wrap">
<header class="top"><a class="logo mono" href="/">TONEAMP</a><nav><a href="/artists/">${lang === 'tr' ? 'Sanatçılar' : 'Artists'}</a><a href="/tr/sarkilar/">Türkçe</a><a href="${STORE}">App Store</a></nav></header>`;
const foot = `<footer>© ${new Date().getFullYear()} NetNucleus · Song data and artwork from Apple's iTunes catalog · <a href="/">ToneAmp</a></footer></div></body></html>`;

const byArtist = new Map();
for (const s of songs) {
  const a = slug(s.artist);
  if (!byArtist.has(a)) byArtist.set(a, {name: s.artist, songs: []});
  byArtist.get(a).songs.push(s);
}
const urls = [`${SITE}/`];

// song pages
for (const s of songs) {
  const lang = isTR(s) ? 'tr' : 'en', L = T[lang], url = `${SITE}/songs/${s.id}/`, aslug = slug(s.artist);
  const t0 = s.tones[0], st = t0.settings, pedalNames = t0.pedals.map((p) => p.name);
  const title = lang === 'tr'
    ? `${s.title} gitar tonu ve amfi ayarları (${s.artist}) | ToneAmp`
    : `${s.title} by ${s.artist}: guitar tone & amp settings | ToneAmp`;
  const desc = clip(lang === 'tr'
    ? `${s.artist}, ${s.title} için amfi ayarları ve pedal zinciri: ${t0.amp}, gain ${num(st.gain)}, mid ${num(st.mid)}${pedalNames.length ? ', ' + pedalNames.join(', ') : ''}.`
    : `${t0.amp}, gain ${num(st.gain)}, mid ${num(st.mid)}${pedalNames.length ? ', ' + pedalNames.join(', ') : ''}. Real amp settings and pedal chain for ${s.title} by ${s.artist}${s.tones.length > 1 ? `, ${s.tones.length} tones` : ''}.`, 158);
  const ld = {'@context': 'https://schema.org', '@graph': [
    {'@type': 'WebPage', '@id': url, url, name: title, inLanguage: lang, description: desc,
      about: {'@type': 'MusicRecording', name: s.title, byArtist: {'@type': 'MusicGroup', name: s.artist},
        inAlbum: s.album ? {'@type': 'MusicAlbum', name: s.album} : undefined, genre: s.genre, ...(s.artworkURL ? {image: s.artworkURL} : {})},
      breadcrumb: {'@id': url + '#crumbs'}},
    {'@type': 'BreadcrumbList', '@id': url + '#crumbs', itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'ToneAmp', item: `${SITE}/`},
      {'@type': 'ListItem', position: 2, name: s.artist, item: `${SITE}/artists/${aslug}/`},
      {'@type': 'ListItem', position: 3, name: s.title, item: url}]},
  ]};
  const tones = s.tones.map((t) => {
    const knobs = ['gain', 'bass', 'mid', 'treble', 'presence', 'reverb'].map((k) =>
      `<div class="knob"><span class="mono">${k.toUpperCase()}</span><strong>${num(t.settings[k])}</strong><div class="bar"><i style="width:${t.settings[k] * 10}%"></i></div></div>`).join('');
    const chain = t.pedals.length
      ? `<ol class="chain">${t.pedals.map((p) => `<li><b>${esc(p.name)}</b> <span class="small">${esc(p.type)}</span><div class="ctl mono">${p.controls.map((c) => `${esc(c.name)} ${num(c.value)}`).join(' · ')}</div>${p.note ? `<div class="small">${esc(p.note)}</div>` : ''}</li>`).join('')}</ol>`
      : `<p class="small">${L.direct}</p>`;
    return `<section class="tone"><span class="char mono">${esc(t.character)}</span><h2>${esc(t.name)}</h2>
<div class="facts"><div><b>${L.amp}</b>${esc(t.amp)}</div><div><b>${L.guitar}</b>${esc(t.guitar)}</div><div><b>${L.pickup}</b>${esc(t.pickup)}</div></div>
<div class="knobs">${knobs}</div><h3 class="small mono">${L.chain.toUpperCase()}</h3>${chain}${t.notes ? `<p class="notes">${esc(t.notes)}</p>` : ''}</section>`;
  }).join('');
  const extra = (s.key ? `<div><b>${L.key}</b>${esc(s.key)}</div>` : '') + (s.chords ? `<div><b>${L.chords}</b>${esc(Array.isArray(s.chords) ? s.chords.join(' · ') : s.chords)}</div>` : '');
  const more = byArtist.get(aslug).songs.filter((x) => x.id !== s.id).slice(0, 14);
  const h1 = lang === 'tr' ? `${esc(s.title)} gitar tonu` : `${esc(s.title)} guitar tone`;
  write(`songs/${s.id}`, head({lang, title, desc, url, ld}) + `
<p class="crumbs mono"><a href="/artists/">${L.crumbs}</a> / <a href="/artists/${aslug}/">${esc(s.artist)}</a></p>
<div class="hero">${s.artworkURL ? `<img src="${esc(s.artworkURL)}" alt="${esc(s.album || s.title)} artwork" width="132" height="132" loading="eager">` : ''}
<div><h1>${h1}</h1><p class="meta">${esc(s.artist)}${s.album ? ' · ' + esc(s.album) : ''}${s.year ? ' · ' + s.year : ''} · ${esc(s.genre)}</p></div></div>
${extra ? `<div class="facts">${extra}</div>` : ''}${tones}
<p class="small">${L.disclaimer}</p>
<div class="cta"><a class="btn" href="${STORE}">${L.open}</a><p>${L.adapt}</p></div>
${more.length ? `<h2 class="sec">${L.more} ${esc(s.artist)}</h2><ul class="list">${more.map((x) => `<li><a href="/songs/${x.id}/">${esc(x.title)}</a></li>`).join('')}</ul>` : ''}
` + foot);
  urls.push(url);
}

// artist hubs
const artists = [...byArtist.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name, 'en'));
for (const [aslug, a] of artists) {
  const tr = a.songs.every(isTR), lang = tr ? 'tr' : 'en', url = `${SITE}/artists/${aslug}/`;
  const title = tr ? `${a.name} gitar tonları ve amfi ayarları | ToneAmp` : `${a.name} guitar tones & amp settings | ToneAmp`;
  const desc = tr ? `${a.name} şarkılarının gitar tonları: ${a.songs.length} şarkı için amfi ayarları ve pedal zincirleri.`
    : `Amp settings and pedal chains for ${a.songs.length} ${a.name} songs, from ${a.songs.slice(0, 3).map((x) => x.title).join(', ')} and more.`;
  const ld = {'@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url, inLanguage: lang, about: {'@type': 'MusicGroup', name: a.name}};
  const list = [...a.songs].sort((x, y) => x.title.localeCompare(y.title));
  write(`artists/${aslug}`, head({lang, title, desc, url, ld}) + `
<p class="crumbs mono"><a href="/artists/">${tr ? 'Sanatçılar' : 'Artists'}</a></p>
<h1>${esc(a.name)} ${tr ? 'gitar tonları' : 'guitar tones'}</h1><p class="meta">${a.songs.length} ${tr ? 'şarkı' : a.songs.length === 1 ? 'song' : 'songs'}</p>
<ul class="list">${list.map((x) => `<li><a href="/songs/${x.id}/">${esc(x.title)}</a> <span class="small">${esc(x.tones[0].amp)}</span></li>`).join('')}</ul>
<div class="cta"><a class="btn" href="${STORE}">${T[lang].open}</a><p>${T[lang].adapt}</p></div>` + foot);
  urls.push(url);
}

// artist index + turkish songs index
const letters = new Map();
for (const [aslug, a] of artists) {
  const k = a.name[0].toUpperCase().normalize('NFD')[0].replace(/[^A-Z]/, '#');
  if (!letters.has(k)) letters.set(k, []);
  letters.get(k).push([aslug, a]);
}
write('artists', head({lang: 'en', title: `Guitar tones for ${songs.length} songs by ${artists.length} artists | ToneAmp`,
  desc: `Browse real amp settings and pedal chains for ${songs.length} songs, by artist. Rock, metal, blues, grunge and Turkish rock.`,
  url: `${SITE}/artists/`, ld: {'@context': 'https://schema.org', '@type': 'CollectionPage', name: 'ToneAmp artists', url: `${SITE}/artists/`}}) + `
<h1>Every song's tone, by artist</h1><p class="meta">${songs.length} songs · ${artists.length} artists</p>
${[...letters.entries()].map(([k, list]) => `<h2 class="sec mono">${k}</h2><ul class="list">${list.map(([aslug, a]) => `<li><a href="/artists/${aslug}/">${esc(a.name)}</a> <span class="small">${a.songs.length}</span></li>`).join('')}</ul>`).join('')}` + foot);
urls.push(`${SITE}/artists/`);

const trSongs = songs.filter(isTR).sort((a, b) => a.artist.localeCompare(b.artist, 'tr') || a.title.localeCompare(b.title, 'tr'));
write('tr/sarkilar', head({lang: 'tr', title: `Türkçe rock şarkılarının gitar tonları: ${trSongs.length} şarkı | ToneAmp`,
  desc: `${trSongs.length} Türkçe rock şarkısı için amfi ayarları ve pedal zincirleri. Duman, Mor ve Ötesi, maNga, Şebnem Ferah, Barış Manço ve daha fazlası.`,
  url: `${SITE}/tr/sarkilar/`, ld: {'@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Türkçe rock gitar tonları', url: `${SITE}/tr/sarkilar/`, inLanguage: 'tr'}}) + `
<h1>Türkçe rock şarkılarının gitar tonları</h1><p class="meta">${trSongs.length} şarkı</p>
<ul class="list">${trSongs.map((x) => `<li><a href="/songs/${x.id}/">${esc(x.artist)} · ${esc(x.title)}</a></li>`).join('')}</ul>
<div class="cta"><a class="btn" href="${STORE}">${T.tr.open}</a><p>${T.tr.adapt}</p></div>` + foot);
urls.push(`${SITE}/tr/sarkilar/`);

fs.writeFileSync(path.join(DIST, 'songpages.css'), CSS);
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log(`songpages: ${songs.length} songs, ${artists.length} artists, ${urls.length} urls in sitemap`);
