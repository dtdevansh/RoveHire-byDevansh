import { renderToBuffer } from '@react-pdf/renderer';
import { OfferLetter } from './OfferLetter.js';
import type { OfferLetterData } from './OfferLetter.js';
import { NDA } from './NDA.js';
import type { NDAData } from './NDA.js';
import { createElement } from 'react';

/**
 * Render the Offer Letter template to a PDF buffer.
 */
export async function renderOfferLetter(data: OfferLetterData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(OfferLetter, { data }) as any;
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}

/**
 * Render the NDA template to a PDF buffer.
 */
export async function renderNDA(data: NDAData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(NDA, { data }) as any;
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}
