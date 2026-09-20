/* A finite competitive market. Prices avoid indifference at reservation values. */
(function (root) {
  'use strict';
  const costs = Object.freeze([2, 3, 4, 5, 6, 7, 8, 9]);
  const values = Object.freeze([9, 8, 7, 6, 5, 4, 3, 2]);
  const equilibriumPrice = 5.5;
  const ceilings = Object.freeze([2.5, 3.5, 4.5, 5.5, 6.5, 7.5]);
  function market(ceiling) {
    if (!ceilings.includes(ceiling)) throw new RangeError('Choose a supported ceiling.');
    const price = Math.min(ceiling, equilibriumPrice);
    const supplied = costs.filter(c => c < price).length;
    const demanded = values.filter(v => v > price).length;
    const trades = Math.min(supplied, demanded);
    return Object.freeze({ ceiling, price, supplied, demanded, trades,
      shortage: demanded - supplied, binding: ceiling < equilibriumPrice });
  }
  const api = Object.freeze({ costs, values, equilibriumPrice, ceilings, market });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CeilingMarket = api;
}(typeof globalThis !== 'undefined' ? globalThis : this));
