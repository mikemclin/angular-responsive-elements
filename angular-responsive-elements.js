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
    ltPrefix: 'lt',
    gtPrefix: 'gt',
    equalsPrefix: 'gt',
    maxRefreshRate: 5,
    breaks: [],
    legacy: false
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

        /**
         * Creates the config for this instance
         *
         * @returns {Object}
         */
        var setUpConfig = function () {
          // Merge the `respond-config` attribute onto the app config
          var config = angular.extend(angular.copy(RespondConfig), scope.respondConfig);
          var configPropertyName;

          // Loop through all attributes on the element
          for (var attribute in attrs) {
            if (attrs.hasOwnProperty(attribute)) {
              // If it is a respond attribute, but not `respond-config` since that's already been taken care of
              if (attribute.substring(0, 7) === 'respond' && attribute !== 'respondConfig') {
                configPropertyName = attribute.substr(7).charAt(0).toLowerCase() + attribute.slice(1);
                config[configPropertyName] = (attrs.attribute === 'false') ? false : attrs.attribute;
              }
            }
          }
          return config;
        };

        var currentClasses = [];

        scope.config = setUpConfig();

        /**
         * Initialize the directive
         */
        scope.init = function () {
          scope.renderBreakpointClasses();
          scope.addListeners();
        };

        /**
         * Add event listeners
         */
        scope.addListeners = function () {
          angular.element($window).on('resize', scope.debounceRenderBreakpointClasses);

          scope.$on('$destroy', function () {
            angular.element($window).off('resize', scope.debounceRenderBreakpointClasses);
          });
        };

        /**
         * Get the width of the element
         *
         * @returns {number}
         */
        scope.getElementWidth = function () {
          return element[0].clientWidth;
        };

        /**
         * Handles the removing and and adding of classes to the element
         */
        scope.renderBreakpointClasses = function () {
          var classes = scope.generateClasses();

          scope.removeBreakpointClasses();
          element.addClass(classes.join(' '));
          scope.setCurrentClasses(classes);
        };

        /**
         * Sets the classes that we've applied to the element
         *
         * @param $classes
         */
        scope.setCurrentClasses = function ($classes) {
          currentClasses = $classes;
        };

        /**
         * Gets the classes that we've applied to the element
         *
         * @returns {Array}
         */
        scope.getCurrentClasses = function () {
          return currentClasses;
        };

        /**
         * Debounces `renderBreakpointClasses` by adding a small delay
         * between calls to prevent overloading
         */
        scope.debounceRenderBreakpointClasses = function () {
          scope.debounce(scope.renderBreakpointClasses, scope.config.maxRefreshRate, true);
        };

        /**
         * Returns an array of class names based on config and element width
         *
         * @returns {Array}
         */
        scope.generateClasses = function () {
          return (scope.config.legacy) ? scope.generateIntervalClasses() : scope.generateCustomClasses();
        };

        /**
         * Returns class names using legacy breakpoint settings
         *
         * @returns {Array}
         */
        scope.generateIntervalClasses = function () {
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

        /**
         * Returns class names based on custom breakpoint settings
         *
         * @returns {Array}
         */
        scope.generateCustomClasses = function () {
          var custom = scope.config.custom,
              i = 0,
              len = custom.length,
              classes = [];

          for (; i < len; i++) {
            classes.push(scope.getClassName(custom[i]));
          }

          return classes;
        };

        /**
         * Generates the class name based on config and element width
         *
         * @param value
         * @returns {*}
         */
        scope.getClassName = function (value) {
          var elementWidth = scope.getElementWidth(),
              ltPrefix = scope.config.ltPrefix,
              gtPrefix = scope.config.gtPrefix,
              equalsPrefix = scope.config.equalsPrefix;

          if (parseInt(elementWidth) > parseInt(value)) {
            return gtPrefix + value;
          }
          if (parseInt(elementWidth) < parseInt(value)) {
            return ltPrefix + value;
          }
          if (parseInt(value) === parseInt(elementWidth)) {
            return equalsPrefix + value;
          }
        };

        scope.removeBreakpointClasses = function () {
          element.removeClass(scope.getCurrentClasses().join(' '));
        };

        /**
         * Debounce Utility
         *
         * http://stackoverflow.com/a/22056002
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

        // Init this instance!
        scope.init();
      }
    };
  }
]);