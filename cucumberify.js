var through = require('through');

module.exports = function (file, options) {
  if (!/.feature$/.test(file)) {
    return through();
  }

  const requires = 'var Yadda = require(\'yadda\');\n' +
    'var FeatureParser = Yadda.parsers.FeatureParser;\n';

  const runTests = 'for (var i = 0; i < scenarios.length; i++) {\n' +
    '      var scenario = scenarios[i];\n' +
    '      test(scenario.title, buildTest(scenario));\n' +
    '      function buildTest(scenario) {\n' +
    '          return function() {\n' +
    '              Yadda.createInstance(library).run(scenario.steps);\n' +
    '          }\n' +
    '      };\n' +
    '  };\n';

  let scenario = '';

  const stream = through(write, end);

  function write(buf) {
    scenario += buf;
  }

  function end() {
    stream.queue(requires);
    stream.queue(`var text = \`${scenario}\`;\n`);
    stream.queue('var scenarios = new FeatureParser().parse(text).scenarios;\n');
    stream.queue(runTests);


    stream.queue(null);
  }

  return stream;
};
