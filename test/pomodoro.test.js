const assert = require('assert');

// simple localStorage stub
const storage = {};
global.localStorage = {
  getItem(key) { return storage[key] || null; },
  setItem(key, val) { storage[key] = val; },
  removeItem(key) { delete storage[key]; },
  get pomoState() { return storage['pomoState']; },
  set pomoState(val) { storage['pomoState'] = val; },
  get saveData() { return storage['saveData']; },
  set saveData(val) { storage['saveData'] = val; }
};

global.Audio = function(){ this.play = function(){}; };
global.document = {
  getElementById() { return { style:{}, innerHTML:'' }; },
  querySelector() { return { href:'' }; },
  body: {}
};
global.document.title = '';

delete require.cache[require.resolve('../js/pomodoro.js')];
const pomo = require('../js/pomodoro.js');

function resetState() {
  pomo._test.setState({
    currTime: 0,
    pomoCount: 0,
    isResting: false,
    isLongResting: false,
    isCounting: false
  });
  pomo._test.setConfig({ focusTime: 1500, shortRestTime: 300, longRestTime: 900, pomosBeforeLongRest: 4 });
}

function test(name, fn) {
  try { fn(); console.log('✓', name); }
  catch(err) { console.error('✗', name); console.error(err); process.exitCode = 1; }
}

// Test secondsToString
test('secondsToString formats numbers', () => {
  assert.strictEqual(pomo.secondsToString(0), '00:00');
  assert.strictEqual(pomo.secondsToString(65), '01:05');
});

// Test advanceTimeStep transitions
test('advanceTimeStep transitions focus -> rest -> focus', () => {
  resetState();
  // set small durations to speed
  pomo._test.setState({ currTime: 5, pomoCount: 0, isResting: false, isLongResting: false, isCounting: true });
  pomo._test.setConfig({ focusTime: 5, shortRestTime: 3, longRestTime: 10, pomosBeforeLongRest: 2 });
  pomo.advanceTimeStep();
  let s = pomo._test.getState();
  assert.strictEqual(s.isResting, true);
  assert.strictEqual(s.currTime, 0);
  pomo._test.setState({ currTime: 3, isResting: true, isLongResting: false, pomoCount: 1, isCounting: true });
  pomo.advanceTimeStep();
  s = pomo._test.getState();
  assert.strictEqual(s.isResting, false);
  assert.strictEqual(s.currTime, 0);
});

// Test saveCurrentState writes storage
test('saveCurrentState stores state', () => {
  resetState();
  pomo._test.setState({ currTime: 10, pomoCount: 2, isResting: true, isLongResting: false, isCounting: true });
  pomo.saveCurrentState();
  const saved = JSON.parse(global.localStorage.pomoState);
  assert.strictEqual(saved.currTime, 10);
  assert.strictEqual(saved.pomoCount, 2);
  assert.strictEqual(saved.isResting, true);
});

// Test loading state from localStorage
test('initialization restores saved state', () => {
  global.localStorage.pomoState = JSON.stringify({ currTime: 7, pomoCount: 1, isResting: true, isLongResting: false, isCounting: false, timestamp: Date.now() });
  delete require.cache[require.resolve('../js/pomodoro.js')];
  const reloaded = require('../js/pomodoro.js');
  const state = reloaded._test.getState();
  assert.strictEqual(state.currTime, 7);
  assert.strictEqual(state.pomoCount, 1);
  assert.strictEqual(state.isResting, true);
});
