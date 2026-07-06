import { renderToBuffer } from '@react-pdf/renderer';
import { OfferLetter } from './OfferLetter.js';
import type { OfferLetterData } from './OfferLetter.js';
import { NDA } from './NDA.js';
import type { NDAData } from './NDA.js';

export function renderOfferLetter(data: OfferLetterData): Promise<Buffer> {
  return renderToBuffer(<OfferLetter data={data} />);
}

export function renderNDA(data: NDAData): Promise<Buffer> {
  return renderToBuffer(<NDA data={data} />);
}
