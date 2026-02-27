import { loadStyle } from 'lightning/platformResourceLoader';
import AZURE_THEME from '@salesforce/resourceUrl/azureTheme';

let _themeLoaded = false;
let _pendingPromise = null;

/**
 * Loads the azureTheme static resource CSS (design tokens) into the page.
 * Call this in connectedCallback() of any component that uses the tokens.
 *
 * Usage:
 *   import { loadAzureTheme } from 'c/azureThemeLoader';
 *   ...
 *   connectedCallback() {
 *       loadAzureTheme(this);
 *   }
 */
export function loadAzureTheme(component) {
    if (_themeLoaded) return Promise.resolve();
    if (_pendingPromise) return _pendingPromise;

    _pendingPromise = loadStyle(component, AZURE_THEME + '/azureTheme.css')
        .then(() => {
            _themeLoaded = true;
            _pendingPromise = null;
        })
        .catch(err => {
            _pendingPromise = null;
            console.error('[AzureTheme] Failed to load theme CSS:', err);
        });

    return _pendingPromise;
}

/**
 * Also exports the base resource URL so components can reference
 * fonts and icons without hardcoding the resource name.
 *
 * Usage:
 *   import { AZURE_RESOURCE_URL } from 'c/azureThemeLoader';
 *   const iconUrl = `${AZURE_RESOURCE_URL}/icons/azure-icons.svg#icon-pool`;
 */
export { AZURE_THEME as AZURE_RESOURCE_URL };
