/**
 * hmsThemeLoader - Singleton service module for loading HMS dark theme CSS.
 * Usage: import { loadHmsTheme } from 'c/hmsThemeLoader';
 *        connectedCallback() { loadHmsTheme(this); }
 */
import { loadStyle } from 'lightning/platformResourceLoader';
import HMS_THEME from '@salesforce/resourceUrl/hmsTheme';

let _themeLoaded = false;
let _pendingPromise = null;

export function loadHmsTheme(component) {
    if (_themeLoaded) return Promise.resolve();
    if (_pendingPromise) return _pendingPromise;
    _pendingPromise = loadStyle(component, HMS_THEME + '/hmsTheme.css')
        .then(() => {
            _themeLoaded = true;
            _pendingPromise = null;
        })
        .catch(err => {
            _pendingPromise = null;
            console.error('[HmsTheme] Failed to load theme CSS:', err);
        });
    return _pendingPromise;
}

export { HMS_THEME as HMS_RESOURCE_URL };
