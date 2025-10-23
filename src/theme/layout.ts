import { Dimensions } from "react-native";

export const getHeaderExtension = (screenHeight: number) =>
  screenHeight * 255 / 932;

export const HORIZONTAL_SCREEN_PADDING = 16;

// Header icon button height + gap between header icons and search input
export const HEADER_ICON_BUTTON_HEIGHT = 48;
export const HEADER_TO_SEARCH_GAP = 12;

export const uiScaleFactor = (()=>{
  const height = Dimensions.get('window').height;
  const diff = 1 - (height/874);

  return 1-(diff/2);
})()