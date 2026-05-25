/**
 * Styles for the CropModal component.
 * Extracted to keep the component file under 200 lines.
 */
import { StyleSheet } from 'react-native';

/** Intentionally darker than standard CROP_OVERLAY_COLOR (0.5) to focus attention on the crop area. */
const CROP_OVERLAY_COLOR = 'rgba(0,0,0,0.85)';
const CROP_CONTAINER_HEIGHT = 400;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_PADDING_H = 24;
const BUTTON_PADDING_V = 10;

export const cropModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: CROP_OVERLAY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cropContainer: {
    position: 'relative',
    height: CROP_CONTAINER_HEIGHT,
  },
  controls: {
    padding: 16,
    gap: 12,
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoomLabel: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 40,
  },
  zoomSlider: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    paddingHorizontal: BUTTON_PADDING_H,
    paddingVertical: BUTTON_PADDING_V,
    borderRadius: BUTTON_BORDER_RADIUS,
    borderWidth: 1,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
