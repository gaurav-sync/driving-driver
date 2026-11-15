import { Place } from "../models/Place.js";
import { escapeRegex } from "../utils/escapeRegex.js";

const SEARCH_LIMIT = 20;

export type PlaceResult = {
  id: string;
  name: string;
  altNames: string[];
  type: string;
  state: string;
  district: string;
  taluka: string;
  lgdCode: string;
};

type PlaceLean = {
  _id: { toString(): string };
  name: string;
  altNames: string[];
  type: string;
  state: string;
  district: string;
  taluka: string;
  lgdCode: string;
};

function toPlaceResult(doc: PlaceLean): PlaceResult {
  return {
    id: doc._id.toString(),
    name: doc.name,
    altNames: doc.altNames,
    type: doc.type,
    state: doc.state,
    district: doc.district,
    taluka: doc.taluka,
    lgdCode: doc.lgdCode,
  };
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const trimmed = query.trim();
  const pattern = escapeRegex(trimmed);
  const regex = new RegExp(pattern, "i");

  const docs = (await Place.find({
    $or: [{ name: regex }, { altNames: regex }],
  })
    .limit(SEARCH_LIMIT * 3)
    .lean()) as unknown as PlaceLean[];

  const qLower = trimmed.toLowerCase();

  const scored = docs
    .map((doc) => {
      const nameLower = doc.name.toLowerCase();
      let rank = 3;
      if (nameLower === qLower) rank = 0;
      else if (nameLower.startsWith(qLower)) rank = 1;
      else if (nameLower.includes(qLower)) rank = 2;
      else if (doc.altNames.some((a) => a.toLowerCase().includes(qLower)))
        rank = 2;
      return { doc, rank };
    })
    .sort((a, b) => a.rank - b.rank || a.doc.name.localeCompare(b.doc.name))
    .slice(0, SEARCH_LIMIT);

  return scored.map(({ doc }) => toPlaceResult(doc));
}