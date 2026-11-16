// App entry: Expo Router, plus the Android home screen widget's task handler,
// which must be registered before the app renders (it also runs headless,
// when only the widget is updated).
import 'expo-router/entry';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { widgetTaskHandler } from './src/features/widget/widgetTaskHandler';

registerWidgetTaskHandler(widgetTaskHandler);
