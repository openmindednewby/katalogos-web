/**
 * Shared style definitions for the login route. Extracted so the route file
 * stays under the 200-line `max-lines` cap. Identical structure between
 * erevna-web and katalogos-web — keep these in lockstep.
 */
import { StyleSheet } from 'react-native';

const BOX_SHADOW = '0px 2px 8px rgba(0, 0, 0, 0.1)';

export const loginStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  formContainer: { width: '100%', maxWidth: 400, borderRadius: 12, padding: 24, boxShadow: BOX_SHADOW, elevation: 5 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 32, textAlign: 'center' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  buttonContainer: { marginTop: 8, marginBottom: 16 },
  pwaButtonContainer: { marginTop: 16 },
});
