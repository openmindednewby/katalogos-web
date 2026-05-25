import { useReducer } from 'react';

import { FM } from '@/localization/helpers';

import { TemplateType } from '../enums/TemplateType';
import { DEFAULT_BG_COLOR, DEFAULT_FG_COLOR } from '../utils/qrCodeConstants';
import { DEFAULT_ACCENT_COLOR, DEFAULT_CTA_KEY } from '../utils/qrDesignerConstants';


/** Full state for the QR Code Designer. */
export interface DesignerState {
  template: TemplateType;
  restaurantName: string;
  tagline: string;
  callToAction: string;
  qrFgColor: string;
  qrBgColor: string;
  accentColor: string;
  publicUrl: string;
  logoDataUri: string;
}

const enum ActionType {
  SetTemplate = 'SET_TEMPLATE',
  SetRestaurantName = 'SET_RESTAURANT_NAME',
  SetTagline = 'SET_TAGLINE',
  SetCallToAction = 'SET_CALL_TO_ACTION',
  SetQrFgColor = 'SET_QR_FG_COLOR',
  SetQrBgColor = 'SET_QR_BG_COLOR',
  SetAccentColor = 'SET_ACCENT_COLOR',
  SetLogoDataUri = 'SET_LOGO_DATA_URI',
}

type DesignerAction =
  | { type: ActionType.SetTemplate; payload: TemplateType }
  | { type: ActionType.SetRestaurantName; payload: string }
  | { type: ActionType.SetTagline; payload: string }
  | { type: ActionType.SetCallToAction; payload: string }
  | { type: ActionType.SetQrFgColor; payload: string }
  | { type: ActionType.SetQrBgColor; payload: string }
  | { type: ActionType.SetAccentColor; payload: string }
  | { type: ActionType.SetLogoDataUri; payload: string };

function designerReducer(state: DesignerState, action: DesignerAction): DesignerState {
  switch (action.type) {
    case ActionType.SetTemplate:
      return { ...state, template: action.payload };
    case ActionType.SetRestaurantName:
      return { ...state, restaurantName: action.payload };
    case ActionType.SetTagline:
      return { ...state, tagline: action.payload };
    case ActionType.SetCallToAction:
      return { ...state, callToAction: action.payload };
    case ActionType.SetQrFgColor:
      return { ...state, qrFgColor: action.payload };
    case ActionType.SetQrBgColor:
      return { ...state, qrBgColor: action.payload };
    case ActionType.SetAccentColor:
      return { ...state, accentColor: action.payload };
    case ActionType.SetLogoDataUri:
      return { ...state, logoDataUri: action.payload };
    default:
      return state;
  }
}

/** Builds the initial designer state from menu data. */
export function buildInitialState(menuName: string, publicUrl: string): DesignerState {
  return {
    template: TemplateType.TableTent,
    restaurantName: menuName,
    tagline: '',
    callToAction: FM(DEFAULT_CTA_KEY),
    qrFgColor: DEFAULT_FG_COLOR,
    qrBgColor: DEFAULT_BG_COLOR,
    accentColor: DEFAULT_ACCENT_COLOR,
    publicUrl,
    logoDataUri: '',
  };
}

/** Dispatchers for each designer field. */
export interface DesignerDispatchers {
  setTemplate: (value: TemplateType) => void;
  setRestaurantName: (value: string) => void;
  setTagline: (value: string) => void;
  setCallToAction: (value: string) => void;
  setQrFgColor: (value: string) => void;
  setQrBgColor: (value: string) => void;
  setAccentColor: (value: string) => void;
  setLogoDataUri: (value: string) => void;
}

interface UseDesignerStateResult {
  state: DesignerState;
  dispatchers: DesignerDispatchers;
}

/** Hook for managing QR code designer state via reducer. */
export function useDesignerState(initial: DesignerState): UseDesignerStateResult {
  const [state, dispatch] = useReducer(designerReducer, initial);

  const dispatchers: DesignerDispatchers = {
    setTemplate: (v) => dispatch({ type: ActionType.SetTemplate, payload: v }),
    setRestaurantName: (v) => dispatch({ type: ActionType.SetRestaurantName, payload: v }),
    setTagline: (v) => dispatch({ type: ActionType.SetTagline, payload: v }),
    setCallToAction: (v) => dispatch({ type: ActionType.SetCallToAction, payload: v }),
    setQrFgColor: (v) => dispatch({ type: ActionType.SetQrFgColor, payload: v }),
    setQrBgColor: (v) => dispatch({ type: ActionType.SetQrBgColor, payload: v }),
    setAccentColor: (v) => dispatch({ type: ActionType.SetAccentColor, payload: v }),
    setLogoDataUri: (v) => dispatch({ type: ActionType.SetLogoDataUri, payload: v }),
  };

  return { state, dispatchers };
}
