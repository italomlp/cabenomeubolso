import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppButton, AppColumn, AppFormSheet, AppRow, AppScreen, AppText, AppTextField } from '@/components/ui';
import { useNativeState } from '@/components/ui/expo-ui';
import { useAppTheme } from '@/design-system/theme-context';
import type { RecurrenceTemplate } from '@/domain/recurrence-template';
import type { ShoppingList } from '@/domain/shopping-list';
import { formatCurrencyMinor } from '@/lib/locale-input';
import { i18n } from '@/lib/localization/i18n';
import { useEpic06Runtime, type Epic06Runtime } from './epic06-runtime';

export function TrashScreen({ dependencies }: { dependencies?: Epic06Runtime } = {}) {
  const { t } = useTranslation(undefined, { i18n }); const theme = useAppTheme(); const runtime = useEpic06Runtime(dependencies);
  const [lists, setLists] = useState<readonly ShoppingList[]>([]); const [error, setError] = useState(false); const [confirm, setConfirm] = useState<ShoppingList | null>(null);
  const load = useCallback(async () => { if (!runtime) return; try { setLists(await runtime.listUseCases.listTrash()); setError(false); } catch { setError(true); } }, [runtime]);
  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);
  if (!runtime) return <AppScreen><AppText>{t('app.loading')}</AppText></AppScreen>;
  return <AppScreen testID="trash-screen"><AppColumn spacing={theme.space.lg}>
    <AppColumn spacing={theme.space.xs}><AppText textStyle={{ color: theme.colors.onSurface, fontSize: theme.typography.display.fontSize, fontWeight: theme.typography.display.fontWeight }}>{t('trash.title')}</AppText><AppText>{t('trash.subtitle')}</AppText></AppColumn>
    {error ? <AppColumn spacing={theme.space.sm}><AppText>{t('trash.loadError')}</AppText><AppButton label={t('trash.retry')} onPress={() => void load()} variant="secondary" /></AppColumn> : null}
    {lists.length === 0 && !error ? <AppText>{t('trash.empty')}</AppText> : lists.map((list) => <AppColumn key={list.id} spacing={theme.space.sm} style={{ borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg, padding: theme.space.md }}>
      <AppText textStyle={{ color: theme.colors.onSurface, fontSize: theme.typography.title.fontSize, fontWeight: theme.typography.title.fontWeight }}>{list.name}</AppText><AppText>{formatCurrencyMinor(i18n.resolvedLanguage ?? i18n.language, list.budgetMinor, list.currencyCode)}</AppText>
      <AppRow spacing={theme.space.sm}><AppButton label={t('trash.restore')} accessibilityHint={t('trash.restoreHint')} onPress={() => void runtime.listUseCases.restoreList(list.id).then(load).catch(() => setError(true))} /><AppButton label={t('trash.deleteForever')} variant="destructive" onPress={() => setConfirm(list)} /></AppRow>
    </AppColumn>)}
    <AppFormSheet cancelLabel={t('trash.cancel')} onCancel={() => setConfirm(null)} onSave={() => { if (confirm) void runtime.listUseCases.permanentlyDeleteList(confirm.id, true).then(() => { setConfirm(null); return load(); }).catch(() => setError(true)); }} saveLabel={t('trash.confirmDelete')} title={t('trash.confirmTitle')} visible={confirm !== null}><AppText>{t('trash.confirmBody')}</AppText></AppFormSheet>
  </AppColumn></AppScreen>;
}

export function TemplatesScreen({ dependencies }: { dependencies?: Epic06Runtime } = {}) {
  const { t } = useTranslation(undefined, { i18n }); const theme = useAppTheme(); const runtime = useEpic06Runtime(dependencies);
  const [templates, setTemplates] = useState<readonly RecurrenceTemplate[]>([]); const [lists, setLists] = useState<readonly ShoppingList[]>([]); const [error, setError] = useState(false); const [editing, setEditing] = useState<RecurrenceTemplate | null>(null); const name = useNativeState(''); const cadence = useNativeState('manual');
  const load = useCallback(async () => { if (!runtime) return; try { setTemplates(await runtime.templateUseCases.listTemplates()); setLists(await runtime.lists.list()); setError(false); } catch { setError(true); } }, [runtime]); useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);
  if (!runtime) return <AppScreen><AppText>{t('app.loading')}</AppText></AppScreen>;
  return <AppScreen testID="templates-screen"><AppColumn spacing={theme.space.lg}><AppColumn spacing={theme.space.xs}><AppText textStyle={{ color: theme.colors.onSurface, fontSize: theme.typography.display.fontSize, fontWeight: theme.typography.display.fontWeight }}>{t('templates.title')}</AppText><AppText>{t('templates.subtitle')}</AppText></AppColumn>
    {error ? <AppColumn spacing={theme.space.sm}><AppText>{t('templates.loadError')}</AppText><AppButton label={t('templates.retry')} onPress={() => void load()} variant="secondary" /></AppColumn> : null}
    {lists.length > 0 ? <AppButton label={t('templates.create')} onPress={() => { const source = lists[0]; if (source) void runtime.templateUseCases.createFromList(source.id).then(load).catch(() => setError(true)); }} /> : null}
    {templates.map((template) => <AppColumn key={template.id} spacing={theme.space.sm} style={{ borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg, padding: theme.space.md }}><AppText textStyle={{ color: theme.colors.onSurface, fontSize: theme.typography.title.fontSize, fontWeight: theme.typography.title.fontWeight }}>{template.name}</AppText><AppText>{t('templates.snapshot', { count: template.items.length, cadence: template.cadence })}</AppText><AppRow spacing={theme.space.sm}><AppButton label={t('templates.generate')} onPress={() => void runtime.templateUseCases.generateNow(template.id).catch(() => setError(true))} /><AppButton label={t('templates.edit')} variant="secondary" onPress={() => { setEditing(template); name.set(template.name); cadence.set(template.cadence); }} /></AppRow></AppColumn>)}
    <AppFormSheet cancelLabel={t('templates.cancel')} onCancel={() => setEditing(null)} onSave={() => { if (!editing) return; void runtime.templateUseCases.saveTemplate({ ...editing, name: name.value, cadence: cadence.value, updatedAt: new Date().toISOString() }).then(() => { setEditing(null); return load(); }).catch(() => setError(true)); }} saveLabel={t('templates.save')} title={t('templates.editTitle')} visible={editing !== null}><AppColumn spacing={theme.space.md}><AppTextField label={t('templates.name')} value={name} onChangeText={(value) => name.set(value)} /><AppTextField label={t('templates.cadence')} value={cadence} onChangeText={(value) => cadence.set(value)} /></AppColumn></AppFormSheet>
  </AppColumn></AppScreen>;
}
