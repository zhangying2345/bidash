import { assert } from 'chai';

import { ArrayEx } from './array.extension';

// describe('suite name', () => {});
// The rule to define the 'suite name': use the path replaced with a dot without the test file postfix names ".spec.ts".
// This is a work around for karma to genereate correct unit test execution report for sonarqube 5.6.3.
//   It must depends on the karma reporter plugin: karma-sonarqube-unit-reporter@0.0.9
//   Check the .scaffold/karma/ng2.ts.config.common.js, it define a function to do convertion from the 'suite name'.
describe('src.utils.array.extension', () => {

  // arrange
  beforeEach(function (){
  });

  it('Test contains', () => {
    // act && assert
    const str1 = 'hello';
    const str2 = 'helloxx';
    const strArray = [str1, 'world'];

    let contains = ArrayEx.contains(strArray, str1);
    assert.isTrue(contains);

    contains = ArrayEx.contains(strArray, str2);
    assert.isFalse(contains);

    // act && assert
    const obj1 = {1: 'hello'};
    const obj2 = {1: 'helloxx'};
    const objArray = [obj1, {1: 'world'}];

    contains = ArrayEx.contains(objArray, obj1);
    assert.isTrue(contains);

    contains = ArrayEx.contains(objArray, obj2);
    assert.isFalse(contains);
  });
});
