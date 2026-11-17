/**
 * Translates the home screen widgets' descriptions in the Android widget
 * picker. react-native-android-widget writes each description once into
 * res/values/strings.xml (English, the fallback); this adds the same string
 * names to values-fi and values-sv so the picker follows the phone's language.
 *
 * The same for the preview images: a localised picture of each widget goes
 * to drawable-fi and drawable-sv (the default drawable is English).
 *
 * Usage in app.json: ["./plugins/withWidgetTranslations", { "descriptions": { "fi": { "TodaySmall": "…" } },
 *   "previews": { "fi": { "TodaySmall": "./assets/widget/preview-small-fi.png" } } }]
 */
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

const escapeXml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, "\\'").replace(/"/g, '\\"');

module.exports = function withWidgetTranslations(config, { descriptions: translations, previews } = {}) {
  return withDangerousMod(config, [
    'android',
    (modConfig) => {
      const resDir = path.join(modConfig.modRequest.platformProjectRoot, 'app/src/main/res');
      for (const [language, descriptions] of Object.entries(translations ?? {})) {
        const dir = path.join(resDir, `values-${language}`);
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, 'widget_strings.xml');
        const items = Object.entries(descriptions)
          .map(([widget, text]) => `    <string name="widget_${widget.toLowerCase()}_description">${escapeXml(text)}</string>`)
          .join('\n');
        fs.writeFileSync(file, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${items}\n</resources>\n`);
      }
      for (const [language, images] of Object.entries(previews ?? {})) {
        const dir = path.join(resDir, `drawable-${language}`);
        fs.mkdirSync(dir, { recursive: true });
        for (const [widget, image] of Object.entries(images)) {
          const source = path.resolve(modConfig.modRequest.projectRoot, image);
          fs.copyFileSync(source, path.join(dir, `${widget.toLowerCase()}_preview${path.extname(source)}`));
        }
      }
      return modConfig;
    },
  ]);
};
