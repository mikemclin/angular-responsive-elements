/**
 * Angular Responsive Elements <https://github.com/mikemclin/angular-responsive-elements>
 * Copyright (c) 2014 Mike McLin
 *
 * Based on:
 * Responsive Elements <https://github.com/kumailht/responsive-elements>
 * Copyright (c) 2013 Kumail Hunaid
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

angular.module('mm.responsiveElements', []);

angular.module('mm.responsiveElements').provider('RespondConfig', function () {
  var config = {
    start: 100,
    end: 900,
    interval: 50,
    equalsPrefix: 'gt',
    maxRefreshRate: 5,
    custom: [],
    doInterval: true,
    doCustom: false
  };
  return {
    config: function (userConfig) {
      angular.extend(config, userConfig);
    }, $get: function () {
      return config;
    }
  };
});

angular.module('mm.responsiveElements').directive('respond', [
  'RespondConfig', '$window', function (RespondConfig, $window) {

    return {
      restrict: 'A',
      scope: {
        respondConfig: '='
      },
      link: function (scope, element, attrs) {

        scope.config = angular.extend(angular.copy(RespondConfig), scope.respondConfig);

        scope.init = function () {

          scope.renderBreakpointClasses();
          angular.element($window).on('resize', function () {
            scope.debounce(scope.renderBreakpointClasses, scope.config.maxRefreshRate);
          });

        };

        scope.getElementWidth = function () {

          return element[0].clientWidth;

        };

        scope.renderBreakpointClasses = function () {

          var breakpoints = scope.generateBreakpoints();

          scope.removeBreakpointClasses();
          element.addClass(breakpoints.join(' '));

        };

        scope.generateBreakpoints = function () {

          var intervalClasses = [], customClasses = [];

          if (scope.config.doInterval) {
            intervalClasses = scope.generateIntervalBreakpoints();
          }
          if (scope.config.doCustom) {
            customClasses = scope.generateCustomBreakpoints();
          }

          return intervalClasses.concat(customClasses);

        };

        scope.generateIntervalBreakpoints = function () {

          var start = scope.config.start,
            end = scope.config.end,
            interval = scope.config.interval,
            value = interval > start ? interval : ~~(start / interval) * interval,
            classes = [];

          while (value <= end) {
            classes.push(scope.getClassName(value));
            value += interval;
          }

          return classes;

        };

        scope.generateCustomBreakpoints = function () {

          var custom = scope.config.custom,
            i = 0,
            len = custom.length,
            classes = [];

          for (; i < len; i++) {
            classes.push(scope.getClassName(custom[i]));
          }

          return classes;

        };

        scope.getClassName = function (value) {

          var elementWidth = scope.getElementWidth(),
            equalsPrefix = scope.config.equalsPrefix;

          if (value < elementWidth) {
            return 'gt' + value;
          }
          if (value > elementWidth) {
            return 'lt' + value;
          }
          if (parseInt(value) === parseInt(elementWidth)) {
            return equalsPrefix + value;
          }

        };

        scope.removeBreakpointClasses = function () {
          var classesToCleanup = scope.parseBreakpointClasses();
          element.removeClass(classesToCleanup.join(' '));
        };

        scope.parseBreakpointClasses = function () {
          var breakpointsString = element.attr('class') || '',
            classes = breakpointsString.split(/\s+/),
            breakpointClasses = [];

          for (var i = 0, len = classes.length; i < len; i++) {
            if (classes[i].match(/^gt\d+|lt\d+$/)) {
              breakpointClasses.push(classes[i]);
            }
          }

          return breakpointClasses;
        };

        /**
         * Debounce is part of Underscore.js 1.5.2 http://underscorejs.org
         * (c) 2009-2013 Jeremy Ashkenas. Distributed under the MIT license.
         *
         * Returns a function, that, as long as it continues to be invoked,
         * will not be triggered. The function will be called after it stops
         * being called for N milliseconds. If `immediate` is passed,
         * trigger the function on the leading edge, instead of the trailing.
         *
         * @param func
         * @param wait
         * @param immediate
         * @returns {Function}
         */
        scope.debounce = function (func, wait, immediate) {
          var result;
          var timeout = null;
          return function () {
            var context = this, args = arguments;
            var later = function () {
              timeout = null;
              if (!immediate) {
                result = func.apply(context, args);
              }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
              result = func.apply(context, args);
            }
            return result;
          };
        };

        scope.init();

      }
    };
  }
]);