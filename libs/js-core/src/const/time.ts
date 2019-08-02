/**
 * Define const variables.
 *
 * [More descriptions for this component in multiple line]
 *
 * @flow
 */
// Polling interval in MS unit.
const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;

// the max delay value in setInterval: 32 bit integer in ms, ~ 25 days
const maxInterval = (Math.pow(2, 31) - 1);

export const Time = {
  second,
  minute,
  hour,
  day,
  week,
  maxInterval
};
