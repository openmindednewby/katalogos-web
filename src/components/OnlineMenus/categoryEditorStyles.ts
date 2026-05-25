/**
 * Styles for CategoryEditor component.
 */
import { StyleSheet } from 'react-native';

const PHONE_CARD_PADDING = 10;

export const categoryEditorStyles = StyleSheet.create({
  categoryCard: { borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 12 },
  categoryCardPhone: { padding: PHONE_CARD_PADDING },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 },
  categoryTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  smallButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  smallButtonText: { fontSize: 12, fontWeight: '600' },
  button: { padding: 10, borderRadius: 6, marginTop: 8 },
  buttonText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  flexOne: { flex: 1 },
  contentPickersSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  contentPickersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  contentPickersRowPhone: { flexDirection: 'column' },
  contentPickerWrapper: { flex: 1, minWidth: 200, maxWidth: 300 },
  contentPickerWrapperPhone: { minWidth: 0, maxWidth: '100%' },
});
