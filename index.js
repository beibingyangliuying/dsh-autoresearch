// Host half of the bundle's own plugin row.
//
// The interesting half is `client.js`: it adds the Autoresearch page to the settings panel. A host
// row must exist for the bundle to be a plugin at all, and it deliberately does nothing — this preset
// works through its own declaration and its preset-scoped rows, not through host behaviour.
export function apply() {
  // no host behaviour: the settings page is entirely client-side
}
