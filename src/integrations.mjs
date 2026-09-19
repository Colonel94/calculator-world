import {config} from './config.mjs';
// Deliberately no remote scripts, cookies or network tracking in this release.
// A future consent-aware adapter can listen for these events after consent.
export function track(name,parameters={}) {
 if(!config.analytics.enabled || !config.analytics.measurementId) return;
 const allowed=['calculator_use','search','related_calculator_click'];
 if(allowed.includes(name)) document.dispatchEvent(new CustomEvent('cw:analytics',{detail:{name,parameters}}));
}
export function initIntegrations(){
 // Ad positions are generated centrally and stay hidden until a reviewed
 // publisher/slot and consent integration is implemented here.
 // Never send calculator inputs or raw search phrases to analytics.
}
