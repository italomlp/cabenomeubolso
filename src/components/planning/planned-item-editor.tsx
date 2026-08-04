import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton, AppColumn, AppRow, AppSelect, AppSheet, AppTextField } from '@/components/ui';
import { useNativeState } from '@/components/ui/expo-ui';
import { useAppTheme } from '@/design-system/theme-context';
import type { SupportedCurrency } from '@/domain/currency';
import type { ShoppingListUnitCode } from '@/domain/shopping-list';
import {
  formatCurrencyMinor,
  formatQuantityMilli,
  LocaleInputParseError,
  parseCurrencyMinor,
  parseQuantityMilli,
} from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';

type PlannedItemDraft = {
  name: string;
  plannedUnitMinor: number;
  quantityMilli: number;
  unitCode: ShoppingListUnitCode;
};

type PlannedItemEditorSheetProps = {
  currencyCode: SupportedCurrency;
  initialUnitCode?: ShoppingListUnitCode;
  onCancel: () => void;
  onSave: (draft: PlannedItemDraft) => void;
  visible: boolean;
};

function isFractionalQuantityUnit(unitCode: ShoppingListUnitCode): boolean {
  return unitCode === 'kg' || unitCode === 'l';
}

function parseErrorMessage(code: LocaleInputParseError['code'], t: (key: string) => string): string {
  switch (code) {
    case 'ambiguous':
      return t('plannedItem.errors.ambiguous');
    case 'empty':
      return t('plannedItem.errors.empty');
    case 'invalid':
      return t('plannedItem.errors.invalid');
    case 'nonPositive':
      return t('plannedItem.errors.nonPositive');
    case 'precision':
      return t('plannedItem.errors.precision');
    case 'unsafe':
      return t('plannedItem.errors.unsafe');
    default:
      return t('plannedItem.errors.invalid');
  }
}

export function PlannedItemEditorSheet({ currencyCode, initialUnitCode = 'piece', onCancel, onSave, visible }: PlannedItemEditorSheetProps) {
  const theme = useAppTheme();
  const { t } = useTranslation(undefined, { i18n });
  const locale = i18n.resolvedLanguage ?? i18n.language;

  const unitOptions = useMemo(
    () => [
      { label: t('units.piece'), value: 'piece' as const },
      { label: t('units.pack'), value: 'pack' as const },
      { label: t('units.kg'), value: 'kg' as const },
      { label: t('units.g'), value: 'g' as const },
      { label: t('units.l'), value: 'l' as const },
      { label: t('units.ml'), value: 'ml' as const },
    ],
    [t]
  );

  const [name, setName] = useState('');
  const [unitCode, setUnitCode] = useState<ShoppingListUnitCode>(initialUnitCode);
  const [quantityText, setQuantityText] = useState('');
  const [quantityMilli, setQuantityMilli] = useState<number | null>(null);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [quantityFocused, setQuantityFocused] = useState(false);
  const [priceText, setPriceText] = useState('');
  const [plannedUnitMinor, setPlannedUnitMinor] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceFocused, setPriceFocused] = useState(false);
  const nameTextRef = useRef('');
  const quantityTextRef = useRef('');
  const priceTextRef = useRef('');
  const nameState = useNativeState(name);
  const quantityState = useNativeState('');
  const priceState = useNativeState('');

  const unitLabel = unitOptions.find((option) => option.value === unitCode)?.label ?? unitCode;
  const quantityHint = isFractionalQuantityUnit(unitCode)
    ? t('plannedItem.quantityHintFractional')
    : t('plannedItem.quantityHintWhole');
  const priceLabel = t('plannedItem.priceLabel', { unit: unitLabel });
  const priceHint = t('plannedItem.priceHint', { currency: currencyCode });

  const formatQuantity = (value: number) => formatQuantityMilli(locale, unitCode, value);
  const formatPrice = (value: number) => formatCurrencyMinor(locale, value, currencyCode);

  const commitQuantity = () => {
    try {
      const parsed = parseQuantityMilli(locale, quantityTextRef.current, unitCode);

      setQuantityMilli(parsed);
      setQuantityError(null);
      setQuantityText(formatQuantity(parsed));
      quantityTextRef.current = formatQuantity(parsed);

      return parsed;
    } catch (error) {
      if (error instanceof LocaleInputParseError) {
        setQuantityError(parseErrorMessage(error.code, t));
        return null;
      }

      throw error;
    }
  };

  const commitPrice = () => {
    try {
      const parsed = parseCurrencyMinor(locale, priceTextRef.current, currencyCode);

      setPlannedUnitMinor(parsed);
      setPriceError(null);
      setPriceText(formatPrice(parsed));
      priceTextRef.current = formatPrice(parsed);

      return parsed;
    } catch (error) {
      if (error instanceof LocaleInputParseError) {
        setPriceError(parseErrorMessage(error.code, t));
        return null;
      }

      throw error;
    }
  };

  const resetAndClose = () => {
    setName('');
    nameTextRef.current = '';
    setUnitCode(initialUnitCode);
    setQuantityText('');
    quantityTextRef.current = '';
    setQuantityMilli(null);
    setQuantityError(null);
    setQuantityFocused(false);
    setPriceText('');
    priceTextRef.current = '';
    setPlannedUnitMinor(null);
    setPriceError(null);
    setPriceFocused(false);
    onCancel();
  };

  const handleSave = () => {
    const normalizedName = nameTextRef.current.trim();
    const nextQuantityMilli = commitQuantity();
    const nextPlannedUnitMinor = commitPrice();

    if (normalizedName.length === 0 || nextQuantityMilli === null || nextPlannedUnitMinor === null) {
      return;
    }

    onSave({
      name: normalizedName,
      plannedUnitMinor: nextPlannedUnitMinor,
      quantityMilli: nextQuantityMilli,
      unitCode,
    });

    resetAndClose();
  };

  const quantityDisplayValue = quantityFocused || quantityError !== null
    ? quantityText
    : quantityMilli !== null
      ? formatQuantity(quantityMilli)
      : '';
  const priceDisplayValue = priceFocused || priceError !== null
    ? priceText
    : plannedUnitMinor !== null
      ? formatPrice(plannedUnitMinor)
      : '';

  useEffect(() => {
    nameState.set(name);
  }, [name, nameState]);

  useEffect(() => {
    quantityState.set(quantityDisplayValue);
  }, [quantityDisplayValue, quantityState]);

  useEffect(() => {
    priceState.set(priceDisplayValue);
  }, [priceDisplayValue, priceState]);

  if (!visible) {
    return null;
  }

  return (
    <AppSheet onClose={resetAndClose} title={t('plannedItem.title')} visible={visible}>
      <AppColumn spacing={theme.space.md}>
        <AppTextField
          accessibilityHint={t('plannedItem.nameHint')}
          helperText={t('plannedItem.nameHint')}
          label={t('plannedItem.nameLabel')}
          onChangeText={(nextName) => {
            nameTextRef.current = nextName;
            setName(nextName);
          }}
          placeholder={t('plannedItem.namePlaceholder')}
          testID="planned-item-name"
          value={nameState}
        />

        <AppSelect
          helperText={t('plannedItem.unitHint')}
          label={t('plannedItem.unitLabel')}
          onValueChange={(nextUnit) => {
            const nextValue = nextUnit as ShoppingListUnitCode;

            setUnitCode(nextValue);
            setQuantityText('');
            quantityTextRef.current = '';
            setQuantityMilli(null);
            setQuantityError(null);
            setQuantityFocused(false);
            setPriceText('');
            priceTextRef.current = '';
            setPlannedUnitMinor(null);
            setPriceError(null);
            setPriceFocused(false);
          }}
          options={unitOptions}
          testID="planned-item-unit"
          value={unitCode}
        />

        <AppTextField
          accessibilityHint={quantityError ?? quantityHint}
          helperText={quantityError ?? quantityHint}
          keyboardType="decimal-pad"
          label={t('plannedItem.quantityLabel')}
          onBlur={() => {
            setQuantityFocused(false);
            commitQuantity();
          }}
          onChangeText={(nextQuantityText) => {
            quantityTextRef.current = nextQuantityText;
            setQuantityText(nextQuantityText);
          }}
          onFocus={() => {
            setQuantityFocused(true);
            setQuantityError(null);
          }}
          placeholder={isFractionalQuantityUnit(unitCode) ? '1.5' : '2'}
          testID="planned-item-quantity"
          value={quantityState}
        />

        <AppTextField
          accessibilityHint={priceError ?? priceHint}
          helperText={priceError ?? priceHint}
          keyboardType="decimal-pad"
          label={priceLabel}
          onBlur={() => {
            setPriceFocused(false);
            commitPrice();
          }}
          onChangeText={(nextPriceText) => {
            priceTextRef.current = nextPriceText;
            setPriceText(nextPriceText);
          }}
          onFocus={() => {
            setPriceFocused(true);
            setPriceError(null);
          }}
          placeholder={currencyCode === 'BRL' ? '12,34' : '12.34'}
          testID="planned-item-price"
          value={priceState}
        />

        <AppRow spacing={theme.space.sm}>
          <AppButton label={t('plannedItem.save')} onPress={handleSave} testID="planned-item-save" />
          <AppButton label={t('plannedItem.close')} onPress={resetAndClose} testID="planned-item-close" variant="ghost" />
        </AppRow>
      </AppColumn>
    </AppSheet>
  );
}

export type { PlannedItemDraft };
