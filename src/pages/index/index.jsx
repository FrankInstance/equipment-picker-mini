import { useEffect, useMemo, useState } from 'react';
import { Image, Input, ScrollView, Text, View } from '@tarojs/components';
import { EQUIPMENT_DATA } from '../../data/equipment-data';
import { UI_TEXT as TEXT } from '../../constants/ui-text';
import {
  createRecommendations,
  createSlotFilters,
  filterEquipment,
  normalizeEquipment
} from '../../utils/equipment';
import './index.css';

const SLOT_FILTERS = createSlotFilters();

const renderAttrValue = (attr) => `${attr.label} ${attr.value}`;

export default function Index() {
  const [isBooting, setIsBooting] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [activeSlot, setActiveSlot] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const normalizedData = useMemo(() => EQUIPMENT_DATA.map(normalizeEquipment), []);

  useEffect(() => {
    const duration = 1200;
    const step = 30;
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        const next = Math.min(100, prev + Math.ceil((step / duration) * 100));
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsBooting(false), 120);
        }
        return next;
      });
    }, step);

    return () => clearInterval(timer);
  }, []);

  const filteredEquipment = useMemo(
    () => filterEquipment(normalizedData, activeSlot, searchTerm),
    [normalizedData, activeSlot, searchTerm]
  );

  const recommendations = useMemo(
    () => createRecommendations(normalizedData, selectedEquipment),
    [normalizedData, selectedEquipment]
  );

  const handleSelect = (item) => {
    setSelectedEquipment(item);
    setIsPickerOpen(false);
  };

  return (
    <View className="page-shell">
      <View className={`boot-screen ${isBooting ? 'boot-screen--active' : 'boot-screen--hidden'}`}>
        <View className="boot-screen__rail">
          <View className="boot-screen__rail-fill" style={{ height: `${loadingProgress}%` }} />
        </View>
        <View className="boot-screen__grid" />
        <View className="boot-screen__topography" />
        <View className="boot-screen__content">
          <Image className="boot-screen__logo" src="/images/ui/endfield-loading-logo.png" mode="widthFix" />
          <View className="boot-screen__meta">
            <View className="boot-screen__system-row">
              <View className="boot-screen__signal" />
              <Text>{TEXT.loadingSystem}</Text>
            </View>
            <Text className="boot-screen__status">{TEXT.loadingStatus}</Text>
            <Text className="boot-screen__substatus">{TEXT.loadingSubstatus}</Text>
            <Text className="boot-screen__tagline">{TEXT.loadingTagline}</Text>
          </View>
        </View>
        <View className="boot-screen__progress">{`${loadingProgress}${TEXT.loadingPercentSuffix}`}</View>
      </View>

      <View className={`page ${isBooting ? 'page--hidden' : 'page--ready'}`}>
        <View className="page__backdrop" style={{ backgroundImage: "linear-gradient(180deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.72)), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(180deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px), url(/images/backgrounds/wiki-endfield-bg.png)" }} />
        <View className="hero">
          <Text className="hero__eyebrow">ARKNIGHTS: ENDFIELD</Text>
          <Text className="hero__title">{TEXT.title}</Text>
        </View>

        <View className="panel panel--current">
          <View className="panel__head">
            <Text className="panel__title">{TEXT.current}</Text>
            <View className="action-button" onClick={() => setIsPickerOpen(true)}>
              <Text>{TEXT.choose}</Text>
            </View>
          </View>

          {selectedEquipment ? (
            <View className="selection-card">
              <Image className="selection-card__image" src={selectedEquipment.image} mode="aspectFill" />
              <View className="selection-card__body">
                <Text className="selection-card__name">{selectedEquipment.name}</Text>
                <Text className="selection-card__slot">{selectedEquipment.slot}</Text>
                <View className="selection-card__attrs">
                  {selectedEquipment.attributes.map((attr) => (
                    <Text className="selection-card__attr" key={`${selectedEquipment.id}-${attr.key}`}>
                      {renderAttrValue(attr)}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View className="empty-card">
              <Text className="empty-card__title">{TEXT.unselected}</Text>
              <Text className="empty-card__hint">{TEXT.chooseHint}</Text>
            </View>
          )}
        </View>

        <View className="panel panel--recommendation">
          <Text className="panel__title">{TEXT.recommendation}</Text>
          <Text className="panel__hint">{TEXT.recommendationHint}</Text>

          {selectedEquipment ? (
            <View className="recommendation-list">
              {recommendations.map(({ attribute, list }) => (
                <View className="recommendation-group" key={attribute.key}>
                  <Text className="recommendation-group__title">{`${attribute.label}${TEXT.recommendationTitleSuffix}`}</Text>
                  <Text className="recommendation-group__sub">{`${TEXT.recommendationSubPrefix}${attribute.value}`}</Text>

                  {list.length ? (
                    list.map(({ item, attribute: match, fitLevel }) => (
                      <View className="recommendation-card" key={`${attribute.key}-${item.id}`}>
                        <Image className="recommendation-card__image" src={item.image} mode="aspectFill" />
                        <View className="recommendation-card__body">
                          <Text className="recommendation-card__name">{item.name}</Text>
                          <View className="recommendation-card__meta-row">
                            <Text className="recommendation-card__meta">{renderAttrValue(match)}</Text>
                            <Text className={`recommendation-card__fit recommendation-card__fit--${fitLevel}`}>
                              {fitLevel === 'better' ? TEXT.fitBetter : TEXT.fitStandard}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View className="recommendation-empty">
                      <Text>{TEXT.recommendationUnavailable}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View className="recommendation-empty recommendation-empty--idle">
              <Text>{TEXT.recommendationEmpty}</Text>
            </View>
          )}
        </View>
      </View>

      {isPickerOpen ? (
        <View className="picker-overlay">
          <View className="picker-mask" onClick={() => setIsPickerOpen(false)} />
          <View className="picker-sheet">
            <View className="picker-sheet__head">
              <View>
                <Text className="picker-sheet__eyebrow">{TEXT.library}</Text>
                <Text className="picker-sheet__title">{TEXT.choose}</Text>
              </View>
              <View className="sheet-close" onClick={() => setIsPickerOpen(false)}>
                <Text>{TEXT.close}</Text>
              </View>
            </View>

            <View className="search-box">
              <Input
                className="search-box__input"
                placeholder={TEXT.searchPlaceholder}
                value={searchTerm}
                onInput={(event) => setSearchTerm(event.detail.value)}
              />
            </View>

            <ScrollView className="slot-filter" scrollX enableFlex>
              {SLOT_FILTERS.map((slot) => (
                <View
                  className={`slot-chip ${activeSlot === slot.value ? 'slot-chip--active' : ''}`}
                  key={slot.value}
                  onClick={() => setActiveSlot(slot.value)}
                >
                  <Text>{slot.label}</Text>
                </View>
              ))}
            </ScrollView>

            <ScrollView className="picker-list" scrollY>
              {filteredEquipment.length ? (
                filteredEquipment.map((item) => (
                  <View className="picker-card" key={item.id} onClick={() => handleSelect(item)}>
                    <Image className="picker-card__image" src={item.image} mode="aspectFill" />
                    <View className="picker-card__body">
                      <Text className="picker-card__name">{item.name}</Text>
                      <Text className="picker-card__attrs">
                        {item.attributes.map((attr) => renderAttrValue(attr)).join(' / ')}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className="picker-empty">
                  <Text>{TEXT.searchEmpty}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      ) : null}
    </View>
  );
}
