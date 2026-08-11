// Regenerates every raster favicon from public/favicon.svg, which is the only
// place the artwork is authored. Run after any change to the mark:
//
//   npm run favicons
//
// Source is favicon.svg rather than src/assets/logo.svg because the two differ
// only by the plate: logo.svg is the bare white monogram on transparency, which
// disappears against a light tab strip. Their <path> data and blueAccent
// gradient are byte-identical, so the mark rasterised here is the canonical one.
//
// sharp ships with Astro's image service and is declared in devDependencies so
// this script does not lean on a transitive dependency.

import { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';

import sharp from 'sharp';

const publicDir = new URL('../public/', import.meta.url);
const source = new URL('favicon.svg', publicDir);

/** Standalone PNGs referenced from <link rel="icon">. */
const PNG_SIZES = [512, 32, 16];

/** Packed into favicon.ico. 48 is carried by the .ico alone and never shipped
    as its own file, which is why this list is not PNG_SIZES. */
const ICO_SIZES = [48, 32, 16];

/* Rasterise once at 1024 and downsample, rather than re-rendering the SVG at
   each size. The gradient and the rounded plate resolve more cleanly through a
   lanczos reduction than through librsvg at 16px, where hinting the rect's
   corner radius is what tends to go wrong. */
const MASTER = 1024;

async function main() {
	const svg = await readFile(source);

	// density scales librsvg's output against the 512-unit viewBox: 72 * 2 = 1024.
	const master = await sharp(svg, { density: 144 })
		.resize(MASTER, MASTER, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.png()
		.toBuffer();

	const render = (size) =>
		sharp(master)
			.resize(size, size, { kernel: 'lanczos3' })
			.png({ compressionLevel: 9, palette: false })
			.toBuffer();

	for (const size of PNG_SIZES) {
		const buffer = await render(size);
		const target = new URL(`favicon-${size}.png`, publicDir);
		await writeFile(target, buffer);
		console.log(`favicon-${size}.png  ${buffer.length.toLocaleString()} bytes`);
	}

	const icoParts = await Promise.all(ICO_SIZES.map(render));
	const ico = buildIco(icoParts, ICO_SIZES);
	await writeFile(new URL('favicon.ico', publicDir), ico);
	console.log(`favicon.ico       ${ico.length.toLocaleString()} bytes (${ICO_SIZES.join(', ')})`);
}

/**
 * Packs PNG buffers into an ICO container.
 *
 * ICO has carried whole PNGs rather than raw DIBs since Vista, which is what
 * lets this be a header plus offsets with no pixel work. Layout: a 6-byte
 * ICONDIR, then one 16-byte ICONDIRENTRY per image, then the PNG bytes.
 * Everything multi-byte is little-endian.
 *
 * https://learn.microsoft.com/en-us/previous-versions/ms997538(v=msdn.10)
 */
function buildIco(images, sizes) {
	const HEADER = 6;
	const ENTRY = 16;

	const header = Buffer.alloc(HEADER);
	header.writeUInt16LE(0, 0); // reserved, always 0
	header.writeUInt16LE(1, 2); // 1 = icon (2 would be a cursor)
	header.writeUInt16LE(images.length, 4);

	// First image starts after the directory, so the table has to be sized first.
	let offset = HEADER + ENTRY * images.length;

	const entries = images.map((png, i) => {
		const entry = Buffer.alloc(ENTRY);
		// A single byte per axis, so 256 is stored as 0. Nothing here reaches it,
		// but the encoding is the reason these are not plain writes.
		entry.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0);
		entry.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1);
		entry.writeUInt8(0, 2); // palette size; 0 for truecolour
		entry.writeUInt8(0, 3); // reserved
		entry.writeUInt16LE(1, 4); // colour planes
		entry.writeUInt16LE(32, 6); // bits per pixel - RGBA
		entry.writeUInt32LE(png.length, 8);
		entry.writeUInt32LE(offset, 12);
		offset += png.length;
		return entry;
	});

	return Buffer.concat([header, ...entries, ...images]);
}

main().catch((error) => {
	console.error(`favicon generation failed: ${error.message}`);
	process.exitCode = 1;
});
