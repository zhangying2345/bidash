import { assert } from 'chai';

import { StringEx } from './string.extension';

// describe('suite name', () => {});
// The rule to define the 'suite name': use the path replaced with a dot without the test file postfix names ".spec.ts".
// This is a work around for karma to genereate correct unit test execution report for sonarqube 5.6.3.
//   It must depends on the karma reporter plugin: karma-sonarqube-unit-reporter@0.0.9
//   Check the .scaffold/karma/ng2.ts.config.common.js, it define a function to do convertion from the 'suite name'.
describe('src.utils.string.extension', () => {

  // arrange
  beforeEach(function (){
  });

  it('Test contains', () => {
    // act & assert
    const str = 'hello world';

    let contains = StringEx.contains(str, 'hello');
    assert.isTrue(contains);

    contains = StringEx.contains(str, 'helloxx');
    assert.isFalse(contains);
  });

  it('Test format', () => {
    // act & assert
    const str = 'Hello {0}, You are the {1} guest.';
    const args = ['tester', 10, 'tail'];
    let expected = `Hello ${args[0]}, You are the ${args[1]} guest.`

    let formated = StringEx.format(str, args[0], args[1], args[2]);

    assert.strictEqual(formated, expected);

    formated = StringEx.format(str, ...args);
    assert.strictEqual(formated, expected);

    const str1 = '/siem/search/dashboard/application_flow?endTime={0}&factoryId={1}';
    expected = `/siem/search/dashboard/application_flow?endTime=${args[0]}&factoryId=${args[1]}`
    formated = StringEx.format(str1, ...args);
    assert.strictEqual(formated, expected);
  })
});
