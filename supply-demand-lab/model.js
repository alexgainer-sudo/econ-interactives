/* Numerical model only. Teaching uses graphs and tables, not curve equations. */
(function(root) {
  'use strict';
  function bounded(value, low, high) {
    if (!Number.isFinite(value) || value < low || value > high) throw new RangeError('Value outside model range');
    return value;
  }
  function equilibrium(demandShift, supplyShift) {
    const d = bounded(demandShift, 0, 30), s = bounded(supplyShift, 0, 30);
    return { p:5+(d+s)/20, q:50+(d-s)/2 };
  }
  function quantityDemanded(price) { return 100-10*bounded(price,3,7); }
  const model = Object.freeze({equilibrium, quantityDemanded});
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
  else root.CoffeeModel = model;
})(typeof window !== 'undefined' ? window : globalThis);
