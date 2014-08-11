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
  '$window', '$timeout', 'RespondConfig', function ($window, $timeout, RespondConfig) {

    return {
      restrict: 'A',
      scope: {
        respondConfig: '='
      },
      link: function (scope, element, attrs) {

        var timeout;

        scope.config = angular.extend(angular.copy(RespondConfig), scope.respondConfig);

        scope.init = function () {

          scope.renderBreakpointClasses();

          scope.addListeners();

        };

        scope.addListeners = function () {

          angular.element($window).on('resize', scope.debounceRenderBreakpointClasses);

          scope.$on('$destroy', function () {
            angular.element($window).off('resize', scope.debounceRenderBreakpointClasses);
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

        scope.debounceRenderBreakpointClasses = function () {

          scope.debounce(scope.renderBreakpointClasses, scope.config.maxRefreshRate);

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
            breakpointClasses = [],
            re = new RegExp(scope.config.equalsPrefix + '\\d+');

          for (var i = 0, len = classes.length; i < len; i++) {
            if (classes[i].match(/^gt\d+|lt\d+$/) || classes[i].match(re)) {
              breakpointClasses.push(classes[i]);
            }
          }

          return breakpointClasses;
        };

        /**
         * Debounce Utility
         *
         * http://stackoverflow.com/questions/13320015/how-to-write-a-debounce-service-in-angularjs
         *
         * @param func
         * @param wait
         * @param immediate
         */
        scope.debounce = function (func, wait, immediate) {
          var context = this, args = arguments;
          var later = function () {
            timeout = null;
            if (!immediate) {
              func.apply(context, args);
            }
          };
          var callNow = immediate && !timeout;
          if (timeout) {
            $timeout.cancel(timeout);
          }
          timeout = $timeout(later, wait);
          if (callNow) {
            func.apply(context, args);
          }
        };

        scope.init();

      }
    };
  }
]);