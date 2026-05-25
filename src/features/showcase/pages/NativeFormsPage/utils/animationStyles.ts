


/**
 * CSS animation styles for native form components.
 * GPU-accelerated: uses only transform + opacity (except max-height for error messages).
 * Merged into the main stylesheet by styles.ts.
 */

const FIELD_FADE_DURATION_MS = 200;
const FIELD_STAGGER_DELAY_MS = 50;
const ERROR_APPEAR_DURATION_MS = 200;
const BUTTON_TRANSITION_MS = 150;
const CARD_ENTER_DURATION_MS = 300;
const DROPDOWN_OPEN_DURATION_MS = 150;
const FOCUS_RING_PULSE_DURATION_MS = 600;
const ERROR_MAX_HEIGHT_PX = 40;
const MAX_STAGGERED_FIELDS = 10;

function buildFieldStaggerRules(): string {
  const rules: string[] = [];
  for (let i = 1; i <= MAX_STAGGERED_FIELDS; i++) {
    const delay = i * FIELD_STAGGER_DELAY_MS;
    rules.push(
      `.form-native-field:nth-child(${i}) { animation-delay: ${delay}ms; }`
    );
  }
  return rules.join('\n');
}

export const nativeFormAnimationStyles = `
/* ===================== */
/* Keyframe Definitions  */
/* ===================== */

@keyframes field-fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes error-appear {
  from {
    opacity: 0;
    transform: translateY(-4px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: ${ERROR_MAX_HEIGHT_PX}px;
  }
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes dropdown-open {
  from {
    opacity: 0;
    transform: scaleY(0.95);
    transform-origin: top;
  }
  to {
    opacity: 1;
    transform: scaleY(1);
    transform-origin: top;
  }
}

@keyframes focus-ring-pulse {
  0% {
    box-shadow: 0 0 0 3px rgb(var(--color-primary-500, 59 130 246) / 0.15);
  }
  50% {
    box-shadow: 0 0 0 5px rgb(var(--color-primary-500, 59 130 246) / 0.08);
  }
  100% {
    box-shadow: 0 0 0 3px rgb(var(--color-primary-500, 59 130 246) / 0.15);
  }
}

/* ===================== */
/* Form Field Fade-In    */
/* ===================== */

.form-native-field {
  animation: field-fade-in ${FIELD_FADE_DURATION_MS}ms ease-out both;
}

${buildFieldStaggerRules()}

/* ===================== */
/* Error Message Appear  */
/* ===================== */

.form-native-error {
  animation: error-appear ${ERROR_APPEAR_DURATION_MS}ms ease-out both;
  overflow: hidden;
}

/* ===================== */
/* Button Interactions   */
/* ===================== */

.btn-native {
  transition:
    background-color ${BUTTON_TRANSITION_MS}ms ease-in-out,
    border-color ${BUTTON_TRANSITION_MS}ms ease-in-out,
    color ${BUTTON_TRANSITION_MS}ms ease-in-out,
    transform ${BUTTON_TRANSITION_MS}ms ease-in-out,
    box-shadow ${BUTTON_TRANSITION_MS}ms ease-in-out;
}

.btn-native:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
}

.btn-native:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.btn-native:focus-visible:not(:disabled) {
  outline: none;
  box-shadow: 0 0 0 3px rgb(var(--color-primary-500, 59 130 246) / 0.3);
  animation: focus-ring-pulse ${FOCUS_RING_PULSE_DURATION_MS}ms ease-in-out;
}

/* ===================== */
/* Form Card Entrance    */
/* ===================== */

.form-card {
  animation: card-enter ${CARD_ENTER_DURATION_MS}ms ease-out both;
  transition: box-shadow ${CARD_ENTER_DURATION_MS}ms ease-in-out;
}

.form-card:hover {
  box-shadow:
    0 4px 6px rgb(0 0 0 / 0.1),
    0 2px 4px rgb(0 0 0 / 0.06);
}

/* ===================== */
/* Dropdown Open         */
/* ===================== */

.form-native-select[data-open="true"] + .form-native-dropdown,
.form-native-dropdown--open {
  animation: dropdown-open ${DROPDOWN_OPEN_DURATION_MS}ms ease-out both;
}

.form-native-dropdown option:hover,
.form-native-dropdown-option:hover {
  transition: background-color ${BUTTON_TRANSITION_MS}ms ease-in-out;
}

/* ===================== */
/* Input Focus Ring      */
/* ===================== */

.form-native-input:focus,
.form-native-select:focus,
.form-native-textarea:focus {
  animation: focus-ring-pulse ${FOCUS_RING_PULSE_DURATION_MS}ms ease-in-out;
}

/* =============================== */
/* Reduced Motion Accessibility    */
/* =============================== */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;
