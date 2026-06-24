import { localeOverrides } from "./locale-overrides/index.mjs";

function replaceStringProperty(source, key, value) {
  const pattern = new RegExp(`(\\b${key}\\s*:\\s*)"(?:[^"\\\\]|\\\\.)*"`, "g");
  return source.replace(pattern, `$1${JSON.stringify(value)}`);
}

function normalizeSeoSource(source) {
  return source
    .replaceAll("https://taxibbessen.de", "https://www.taxibbessen.de")
    .replaceAll("https://www.taxibbessen.de/#localbusiness", "https://www.taxibbessen.de/#organization")
    .replaceAll('"MedicalBusiness"', '"Service"')
    .replaceAll('"MedicalTherapy"', '"Service"');
}

export function localeContentPlugin() {
  return {
    name: "taxi-safe-locale-content",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("/src/")) return null;

      let output = normalizeSeoSource(code);
      const match = id.match(/\/src\/i18n\/locales\/(de|en|fr|tr|ar)\.ts$/);

      if (match) {
        for (const [key, value] of Object.entries(localeOverrides[match[1]] ?? {})) {
          output = replaceStringProperty(output, key, value);
        }
      }

      return output === code ? null : { code: output, map: null };
    },
  };
}
