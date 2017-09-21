import chai from 'chai';

const { expect } = chai;

/**
 * Be descriptive with titles here.
 * The describe and it titles combined read like a sentence.
 */

describe('Sample factory', () => {
  it('has a dummy spec to test 2 + 2', () => {
    // An intentionally failing test.
    // No code within expect() will never equal 4.
    expect(2 + 2).toEqual(4);
  });
});
