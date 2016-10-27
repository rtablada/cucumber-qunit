/* eslint-env qunit */
const Dictionary = require('yadda').Dictionary;
const English = require('yadda').localisation.English;

const dictionary = new Dictionary().define('NUM', /(\d+)/);

window.library = English.library(dictionary)
  .given('$NUM green bottles are standing on the wall', (number) {
    wall = new Wall(number);
  })
  .when('$NUM green bottle accidentally falls', (number) {
    wall.fall(number);
  })
  .then('there (?:are|are still) $NUM green bottles standing on the wall', (number) {
    equal(number, wall.bottles);
  });

require('./x.feature');
