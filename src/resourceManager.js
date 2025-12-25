class ResourceManager{
    constructor(resources, defaultLang = "en-US") {
        this._resources = resources;
        this._defaultLang = defaultLang;
        this._lang = this._resolveLanguage();
        this._strings = this._resources[this._lang];
    }
    _resolveLanguage() {
        const lang = navigator.language;
        const baseLang = lang.split("-")[0]
        if (this._resources[lang]) {
            return lang;
        }
        const fallback = Object.keys(this._resources)
            .find(key => key.startsWith(baseLang));
        if (fallback) {
            return fallback;
        }
        return this._defaultLang;
    }
    get(key, ...values) {
        const template = this._strings[key] ?? this._resources[this._defaultLang]?.key ?? key;
        return this.format(template, values);
    }

    format(template, values) {
        return template.replace(/{(\d+)}/g, (match, index) =>
            values[index] !== undefined ? values[index] : match);
    }
}