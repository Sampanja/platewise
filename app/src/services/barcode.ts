import { findCustomFood, useCustomFoodsStore } from '@/data/stores/customFoods';
import type { Food } from '@/data/types';
import { foodIdForBarcode, parseOffProduct, type ParsedProduct } from '@/domain/openFoodFacts';
import { strings } from '@/i18n';

/**
 * Barcode lookup from Open Food Facts (open data, ODbL). This works for real
 * already in the UI phase. Found products are cached on the device, so a
 * product scanned once also works offline. Only the barcode is sent; nothing
 * about the user.
 */

const API = 'https://world.openfoodfacts.org/api/v2/product/';
const FIELDS = [
  'product_name_fi',
  'product_name',
  'generic_name',
  'brands',
  'image_front_small_url',
  'image_front_url',
  'serving_quantity',
  'product_quantity',
  'categories_tags',
  'nutriments',
  'nutriscore_grade',
].join(',');
const TIMEOUT_MS = 10_000;
/** OFF asks API clients to identify themselves. */
const USER_AGENT = 'PlatePal/1.0 (Android; test build)';

export type BarcodeResult = ParsedProduct | { status: 'offline' };

export async function lookupBarcode(barcode: string): Promise<BarcodeResult> {
  const cached = findCustomFood(foodIdForBarcode(barcode));
  if (cached) return { status: 'found', food: cached };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API}${encodeURIComponent(barcode)}?fields=${FIELDS}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (response.status === 404) return { status: 'notFound' };
    if (!response.ok) return { status: 'offline' };
    const result = parseOffProduct(await response.json(), barcode, {
      serving: strings.product.servingLabel,
      package: strings.product.packageLabel,
    });
    if (result.status === 'found') useCustomFoodsStore.getState().upsert(result.food);
    return result;
  } catch {
    return { status: 'offline' };
  } finally {
    clearTimeout(timer);
  }
}

export function cachedProduct(barcode: string): Food | undefined {
  return findCustomFood(foodIdForBarcode(barcode));
}
