type NullableString = string | null | undefined;

export type NormalizedBagsMetadata = {
  tokenMetadata: string | null;
  uri: string | null;
};

export function normalizeBagsMetadata(tokenMetadata: NullableString, uri: NullableString): NormalizedBagsMetadata {
  const normalizedTokenMetadata = cleanValue(tokenMetadata);
  const normalizedUri = cleanValue(uri);

  if (normalizedTokenMetadata && isLikelyMetadataUri(normalizedTokenMetadata) && (!normalizedUri || normalizedUri === normalizedTokenMetadata)) {
    return {
      tokenMetadata: null,
      uri: normalizedTokenMetadata,
    };
  }

  return {
    tokenMetadata: normalizedTokenMetadata,
    uri: normalizedUri,
  };
}

export function isLikelyMetadataUri(value: NullableString): boolean {
  const normalizedValue = cleanValue(value);
  if (!normalizedValue) {
    return false;
  }

  return /^https?:\/\//i.test(normalizedValue) || /^ipfs:\/\//i.test(normalizedValue);
}

function cleanValue(value: NullableString): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
