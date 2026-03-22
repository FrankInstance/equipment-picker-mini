import { ATTRIBUTE_LABELS } from '../data/equipment-data';
import { UI_TEXT as TEXT } from '../constants/ui-text';

const NON_REFINABLE_KEYS = new Set(['defense']);

export const resolveSlot = (item) => {
  if (String(item.id).startsWith('armor_')) return TEXT.armor;
  if (String(item.id).startsWith('gloves_')) return TEXT.gloves;
  if (String(item.id).startsWith('accessory_')) return TEXT.accessory;
  return item.slot || TEXT.unknown;
};

export const normalizeEquipment = (item) => ({
  id: item.id ?? item.name,
  name: item.name ?? TEXT.unnamed,
  slot: resolveSlot(item),
  image: item.image || '',
  attributes: Array.isArray(item.attributes)
    ? item.attributes.map((attr) => ({
        key: attr.key ?? 'unknown',
        label: attr.label ?? ATTRIBUTE_LABELS[attr.key] ?? attr.key,
        value: String(attr.value ?? '0'),
        sortValue: Number(attr.sortValue ?? 0)
      }))
    : []
});

export const createSlotFilters = () => [
  { label: TEXT.all, value: 'all' },
  { label: TEXT.armor, value: TEXT.armor },
  { label: TEXT.gloves, value: TEXT.gloves },
  { label: TEXT.accessory, value: TEXT.accessory }
];

export const filterEquipment = (list, activeSlot, searchTerm) => {
  const term = searchTerm.trim().toLowerCase();
  return list.filter((item) => {
    const matchSlot = activeSlot === 'all' || item.slot === activeSlot;
    const haystack = [
      item.name,
      item.slot,
      ...item.attributes.map((attr) => attr.label),
      ...item.attributes.map((attr) => attr.key)
    ].join(' ').toLowerCase();
    return matchSlot && (!term || haystack.includes(term));
  });
};

export const createRecommendations = (list, selectedEquipment) => {
  if (!selectedEquipment) return [];
  const candidates = list.filter((item) => item.slot === selectedEquipment.slot);
  return selectedEquipment.attributes
    .filter((attr) => !NON_REFINABLE_KEYS.has(attr.key))
    .map((attr) => {
      const recommendationList = candidates
        .map((item) => {
          const match = item.attributes.find((candidateAttr) => candidateAttr.key === attr.key);
          if (!match) return null;
          return {
            item,
            attribute: match,
            fitLevel: match.sortValue > attr.sortValue ? 'better' : 'standard'
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.attribute.sortValue - a.attribute.sortValue)
        .slice(0, 6);
      return {
        attribute: attr,
        list: recommendationList
      };
    });
};
