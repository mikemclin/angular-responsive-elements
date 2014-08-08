module.exports = function (config) {

  config.set({

    basePath: '..',

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'angular-responsive-elements.js',
      'test/*_unit.js'
    ],

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    plugins: [
      'karma-jasmine',
      'karma-junit-reporter',
      'karma-chrome-launcher',
      'karma-phantomjs-launcher'
    ],

    reporters: [
      'progress', 'junit'
    ],

    junitReporter: {
      outputFile: 'test-results.xml'
    }

  });

};