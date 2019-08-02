//import { expect, assert } from 'chai';

import { FixedQueue } from './fixed-queue';

// describe('suite name', () => {});
// The rule to define the 'suite name': use the path replaced with a dot without the test file postfix names ".spec.ts".
// This is a work around for karma to genereate correct unit test execution report for sonarqube 5.6.3.
//   It must depends on the karma reporter plugin: karma-sonarqube-unit-reporter@0.0.9
//   Check the .scaffold/karma/ng2.ts.config.common.js, it define a function to do convertion from the 'suite name'.
describe('src.utils.fixed-queue', () => {
  let fixedQueue: FixedQueue;

  // arrange
  beforeEach(function () {
    fixedQueue = new FixedQueue(2);
  });

  it('Test constructor_parameterLessOne_throwException', () => {
    // act
    const constructorToThrowException = function (){
      const exceptionQueue = new FixedQueue(0);
    };
    // assert
    expect(constructorToThrowException).toThrowError('The passed in argument length should > 0.');
  });

  it('Test getData_queueIsNormal_value', () => {
    // assert
    expect(fixedQueue.data).toEqual([]);
  });

  it('Test getCurrentLength_queueIsNormal_value', () => {
    // assert
    expect(fixedQueue.length).toEqual(0);
  });

  it('Test getFixedLength_queueIsNormal_value', () => {
    // assert
    expect(fixedQueue.fixedLength).toEqual(2);
  });

  it('Test push_queueNotFull_pass', () => {
    // arrange
    const pushValue = 1;
    // act
    fixedQueue.push(pushValue);
    const result = fixedQueue.data[0];
    // assert
    expect(result).toBe(pushValue);
  });

  it('Test push_whileQueueFull_pass', () => {
    // arrange
    fixedQueue.push(1);
    fixedQueue.push(2);
    const pushValue = 3;
    // act
    fixedQueue.push(pushValue);
    const result = fixedQueue.data[0];
    // assert
    expect(result).toBe(pushValue);
  });

  it('Test push_whileOptionExist_sort', () => {
    // arrange
    const option = {
      sort: (a, b) => {
        return a - b;
      }
    };
    const expectValue = [1, 2];
    fixedQueue.push(1);
    // act
    fixedQueue.push(2, option);
    const result = fixedQueue.data;
    // assert
    expect(result).toEqual(expectValue);
  });

  it('Test contains_whileQueueEmpty_false', () => {
    // act
    const result = fixedQueue.contains(1);
    // assert
    expect(result).toBe(false);
  });

  it('Test contains_parameterNotObject_true', () => {
    // arrange
    fixedQueue.push(1);
    // act
    const result = fixedQueue.contains(1);
    // assert
    expect(result).toBe(true);
  });

  it('Test contains_parameterNotObject_false', () => {
    // arrange
    fixedQueue.push(1);
    // act
    const result = fixedQueue.contains(2);
    // assert
    expect(result).toBe(false);
  });

  it('Test contains_parameterIsObject_true', () => {
    // arrange
    const pushObject = {name: 'test',id: 1};
    fixedQueue.push(pushObject);
    // act
    const result = fixedQueue.contains(pushObject);
    // assert
    expect(result).toBe(true);
  });

  it('Test contains_parameterIsObject_false', () => {
    // arrange
    const pushObject = {name: 'test',id: 1};
    fixedQueue.push(pushObject);
    // act
    const result = fixedQueue.contains({test: 'test'});
    // assert
    expect(result).toBe(false);
  });

  it('Test contains_parameterIsEmptyObject_true', () => {
    // arrange
    const pushObject = {};
    fixedQueue.push(pushObject);
    // act
    const result = fixedQueue.contains({});
    // assert
    expect(result).toBe(true);
  });

  it('Test contains_parameterIsEmptyObject_false', () => {
    // arrange
    const pushObject = {name: 'test',id: 1};
    fixedQueue.push(pushObject);
    // act
    const result = fixedQueue.contains({});
    // assert
    expect(result).toBe(false);
  });
});
