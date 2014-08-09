module.exports = function (config) {

  config.set({

    basePath: '../../',

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'angular-responsive-elements.js',
      'test/unit/*_test.js'
    ],

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    plugins: [
      'karma-jasmine',
      'karma-junit-reporter',
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-coverage'
    ],

    reporters: [
      'progress', 'junit', 'coverage'
    ],

    preprocessors: {
      'angular-responsive-elements.js': 'coverage'
    },

    coverageReporter: {
      type: "lcov",
      dir: "coverage/"
    },

    junitReporter: {
      outputFile: 'test-results.xml'
    }

  });

};