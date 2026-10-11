export class QuoteError extends Error {
  constructor(message, status = 400, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

const enumValue = (value, choices, field, fallback) => {
  const selected = value ?? fallback;
  if (!choices.includes(selected)) throw new QuoteError('Please check your design choices.', 422, { [field]: 'Choose a supported option.' });
  return selected;
};

const cleanText = (value, max = 100) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, max + 1);
};

export function validateConfig(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new QuoteError('Your design is missing.', 422, { config: 'Choose your room specification.' });
  const { width, depth } = input;
  if (![3, 4].includes(width) || ![2, 3, 4, 5, 6].includes(depth) || (width === 4 && depth === 3)) {
    throw new QuoteError('This CasaNova size is unavailable.', 422, { size: 'Choose a supported Biohort module size.' });
  }
  const glass = input.glass ?? 0;
  if (![0, 1, 2].includes(glass)) throw new QuoteError('Please check the glazing.', 422, { glass: 'Select zero, one or two glass elements.' });
  if (input.window !== undefined && typeof input.window !== 'boolean') throw new QuoteError('Please check the window selection.', 422);
  const accessories = input.accessories ?? [];
  if (!Array.isArray(accessories) || accessories.length > 5 || new Set(accessories).size !== accessories.length || accessories.some(item => !['lights', 'table', 'shelf', 'bike', 'floorframe'].includes(item))) {
    throw new QuoteError('Please check your accessories.', 422, { accessories: 'Choose each supported accessory once.' });
  }
  if (depth === 2 && accessories.some(item => ['table', 'shelf'].includes(item))) {
    throw new QuoteError('This accessory needs a deeper room.', 422, { accessories: 'The folding table and standard shelves are unavailable at this depth.' });
  }
  const purpose = cleanText(input.purpose ?? 'Relax & unwind', 60);
  const timeline = cleanText(input.timeline ?? 'Just exploring', 60);
  if (!purpose || purpose.length > 60 || !timeline || timeline.length > 60 || /[\x00-\x1f\x7f]/.test(purpose + timeline)) throw new QuoteError('Please check the project details.', 422);
  return {
    width, depth,
    color: enumValue(input.color, ['dark', 'quartz'], 'color', 'dark'),
    door: enumValue(input.door, ['standard', 'double', 'glass'], 'door', 'standard'),
    doorPosition: enumValue(input.doorPosition === 'centre' ? 'center' : input.doorPosition, ['left', 'center', 'right'], 'doorPosition', 'left'),
    glass,
    window: input.window ?? false,
    foundation: enumValue(input.foundation, ['existing', 'concrete', 'advice'], 'foundation', 'advice'),
    assembly: enumValue(input.assembly, ['self', 'professional'], 'assembly', 'professional'),
    purpose, timeline, accessories: [...accessories],
  };
}

export function validatePreviewImage(input) {
  if (!input) return null;
  if (typeof input !== 'string' || !input.startsWith('data:image/png;base64,') || input.length > 2_000_000) throw new QuoteError('The preview could not be saved. Please try again.', 422);
  const encoded = input.slice(22);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) || encoded.length % 4 !== 0) throw new QuoteError('The preview image is invalid.', 422);
  const bytes = Buffer.from(encoded, 'base64');
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 33 || bytes.length > 1_500_000 || !bytes.subarray(0, 8).equals(signature) || bytes.toString('ascii', 12, 16) !== 'IHDR') throw new QuoteError('The preview image is invalid.', 422);
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (!width || !height || width > 2048 || height > 2048 || width * height > 3_000_000) throw new QuoteError('The preview is too large. Please try again.', 422);
  // Browser canvas exports use 8-bit non-interlaced PNG. Bound decompression as
  // well as the upload so a forged small IHDR cannot hide an oversized stream.
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[bytes[25]];
  if (bytes.readUInt32BE(8) !== 13 || bytes[24] !== 8 || !channels || bytes[26] !== 0 || bytes[27] !== 0 || bytes[28] !== 0) throw new QuoteError('The preview image is invalid.', 422);
  const idat = [];
  let offset = 8, ended = false;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (length > bytes.length - offset - 12) throw new QuoteError('The preview image is invalid.', 422);
    if (type === 'IDAT') idat.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
    if (type === 'IEND') { ended = length === 0 && offset === bytes.length; break; }
  }
  if (!ended || !idat.length) throw new QuoteError('The preview image is invalid.', 422);
  const rowBytes = width * channels + 1;
  try {
    const pixels = inflateSync(Buffer.concat(idat), { maxOutputLength: rowBytes * height });
    if (pixels.length !== rowBytes * height) throw new Error('PNG scanline length mismatch');
    for (let row = 0; row < height; row++) if (pixels[row * rowBytes] > 4) throw new Error('Invalid PNG filter');
  } catch { throw new QuoteError('The preview image is invalid.', 422); }
  return input;
}

export function validateSubmission(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new QuoteError('Please check your enquiry.', 400);
  if (input.website || input['bot-field']) throw new QuoteError('Please check your enquiry.', 400);
  const contactInput = input.contact && typeof input.contact === 'object' ? input.contact : input;
  const name = cleanText(contactInput.name, 80);
  const email = cleanText(contactInput.email, 254).toLowerCase();
  const postcode = cleanText(contactInput.postcode, 12).toUpperCase().replace(/\s/g, '');
  const phone = cleanText(contactInput.phone ?? '', 35);
  const country = enumValue(contactInput.country, ['UK', 'GB', 'United Kingdom'], 'country', 'UK');
  const fields = {};
  if (name.length < 2 || name.length > 80 || !/\p{L}/u.test(name) || /[\x00-\x1f\x7f<>]/.test(name)) fields.name = 'Enter your name.';
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>.]{2,}$/.test(email)) fields.email = 'Enter a valid email address.';
  if (!/^(?:GIR0AA|[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2})$/.test(postcode)) fields.postcode = 'Enter a valid UK project postcode.';
  if (phone && (phone.length > 35 || !/^[+\d() .-]{6,35}$/.test(phone))) fields.phone = 'Enter a valid phone number or leave it blank.';
  if (contactInput.marketing !== undefined && typeof contactInput.marketing !== 'boolean') fields.marketing = 'Choose whether you would like marketing updates.';
  if (Object.keys(fields).length) throw new QuoteError('Please check the highlighted fields.', 422, fields);
  return {
    contact: { name, email, postcode: postcode.slice(0, -3) + ' ' + postcode.slice(-3), phone, country: 'GB', marketing: contactInput.marketing === true },
    config: validateConfig(input.config),
    previewImage: validatePreviewImage(input.previewImage),
  };
}

export const validToken = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
import { inflateSync } from 'node:zlib';
