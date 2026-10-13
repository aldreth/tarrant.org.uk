import {createHash} from 'node:crypto';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import Image from '@11ty/eleventy-img';

const socialPreviewImagesDir = 'dist/assets/og-images';
const manifestPath = '.cache/og-image-hashes.json';

let buildStartedAt = 0;

export const markOgBuildStart = () => {
  buildStartedAt = Date.now();
};

const filesIn = async (dir, extension) => {
  let entries;
  try {
    entries = await fs.readdir(dir, {withFileTypes: true});
  } catch {
    return [];
  }
  const nested = await Promise.all(
    entries.map(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return filesIn(full, extension);
      return entry.name.endsWith(extension) ? [full] : [];
    })
  );
  return nested.flat();
};

const relativeKey = file => path.relative(socialPreviewImagesDir, file).split(path.sep).join('/');

const hashFile = async file => {
  const contents = await fs.readFile(file);
  return createHash('sha256').update(contents).digest('hex');
};

const loadManifest = async () => {
  try {
    return JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  } catch {
    return {};
  }
};

const jpegFor = async (svgPath, previous) => {
  const key = relativeKey(svgPath);
  const digest = await hashFile(svgPath);
  const jpegPath = svgPath.replace(/\.svg$/, '.jpg');
  const jpegStat = await fs.stat(jpegPath).catch(() => null);
  if (jpegStat && previous[key] === digest) return [key, digest];

  // eleventy-img treats an existing output file as a cache hit and will not rewrite it
  if (jpegStat) await fs.rm(jpegPath);

  const parsed = path.parse(svgPath);
  await Image(svgPath, {
    widths: [1200],
    formats: ['jpeg'],
    outputDir: parsed.dir,
    filenameFormat: () => `${parsed.name}.jpg`,
    sharpJpegOptions: {quality: 85}
  });
  return [key, digest];
};

// A cached SVG that Eleventy did not rewrite belongs to a page that no longer exists.
const currentSvgs = async () => {
  const svgs = await filesIn(socialPreviewImagesDir, '.svg');
  if (!buildStartedAt) return {current: svgs, stale: []};
  const current = [];
  const stale = [];
  for (const svg of svgs) {
    const stat = await fs.stat(svg);
    if (stat.mtimeMs >= buildStartedAt) current.push(svg);
    else stale.push(svg);
  }
  return {current, stale};
};

const removeStalePreviews = async (staleSvgs, currentSvgs) => {
  const expectedJpegs = new Set(currentSvgs.map(svg => svg.replace(/\.svg$/, '.jpg')));
  const jpgs = await filesIn(socialPreviewImagesDir, '.jpg');
  const staleJpegs = jpgs.filter(jpg => !expectedJpegs.has(jpg));
  await Promise.all([...staleSvgs, ...staleJpegs].map(file => fs.rm(file, {force: true})));
};

export const svgToJpeg = async function () {
  const {current, stale} = await currentSvgs();
  if (!current.length) {
    console.log('⚠ No OG images dir found');
    return;
  }

  const previous = await loadManifest();
  const manifest = {};
  const batchSize = 8;
  for (let index = 0; index < current.length; index += batchSize) {
    const entries = await Promise.all(current.slice(index, index + batchSize).map(file => jpegFor(file, previous)));
    for (const [key, digest] of entries) manifest[key] = digest;
  }

  await fs.mkdir(path.dirname(manifestPath), {recursive: true});
  await fs.writeFile(manifestPath, JSON.stringify(manifest));
  await removeStalePreviews(stale, current);
};
