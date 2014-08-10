'use strict';

describe('ConfigService', function () {
  var $rootScope;
  var $compile;
  var $window;
  var RespondConfig;
  var element;
  var scope;

  beforeEach(module('mm.responsiveElements'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$window_, _RespondConfig_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $window = _$window_;
    RespondConfig = _RespondConfig_;
    element = angular.element('<div respond></div>');
    $compile(element)($rootScope);
    scope = element.isolateScope();
  }));

  describe('respond', function () {

    describe('config', function () {

      it('should use RespondConfig for configuration', function () {
        expect(scope.config).toMatch(RespondConfig);
      });

      it('should allow custom config per element', function () {
        element = angular.element('<div respond respond-config="{start:300}"></div>');
        $compile(element)($rootScope);
        scope = element.isolateScope();
        expect(scope.config.start).toMatch(300);
      });

    });

    describe('init()', function () {

      it('should call renderBreakpointClasses()', function () {
        var renderBreakpointClasses = spyOn(scope, 'renderBreakpointClasses');
        scope.init();
        expect(renderBreakpointClasses).toHaveBeenCalled();
      });

      it('should add listener that calls debounce() on window resize event', function () {
        var debounce = spyOn(scope, 'debounce');
        scope.init();
        expect(debounce).not.toHaveBeenCalled();
        angular.element($window).triggerHandler('resize');
        expect(debounce).toHaveBeenCalled();
      });

    });

    describe('getElementWidth()', function () {

      it('should return a number', function () {
        expect(typeof scope.getElementWidth()).toBe('number');
      });

    });

    describe('renderBreakpointClasses()', function () {

      it('should call generateBreakpoints()', function () {
        var generateBreakpoints = spyOn(scope, 'generateBreakpoints').and.returnValue([]);
        scope.renderBreakpointClasses();
        expect(generateBreakpoints).toHaveBeenCalled();
      });

      it('should call removeBreakpointClasses()', function () {
        var removeBreakpointClasses = spyOn(scope, 'removeBreakpointClasses');
        scope.renderBreakpointClasses();
        expect(removeBreakpointClasses).toHaveBeenCalled();
      });

      it('should call add classes to element', function () {
        var generateBreakpoints = spyOn(scope, 'generateBreakpoints').and.returnValue(['foo', 'bar']);
        var removeBreakpointClasses = spyOn(scope, 'removeBreakpointClasses');
        var elementClasses = element.attr('class');
        scope.renderBreakpointClasses();
        expect(element.attr('class')).toBe(elementClasses + ' foo bar');
      });

    });

    describe('generateBreakpoints()', function () {

      it('should return an array', function () {
        expect(scope.generateBreakpoints() instanceof Array).toBeTruthy();
      });

      it('should call generateIntervalBreakpoints() when configured to do so', function () {
        var generateIntervalBreakpoints = spyOn(scope, 'generateIntervalBreakpoints').and.returnValue([]);
        scope.config.doInterval = false;
        scope.generateBreakpoints();
        expect(generateIntervalBreakpoints).not.toHaveBeenCalled();
        scope.config.doInterval = true;
        scope.generateBreakpoints();
        expect(generateIntervalBreakpoints).toHaveBeenCalled();
      });

      it('should call generateCustomBreakpoints() when configured to do so', function () {
        var generateCustomBreakpoints = spyOn(scope, 'generateCustomBreakpoints').and.returnValue([]);
        scope.config.doCustom = false;
        scope.generateBreakpoints();
        expect(generateCustomBreakpoints).not.toHaveBeenCalled();
        scope.config.doCustom = true;
        scope.generateBreakpoints();
        expect(generateCustomBreakpoints).toHaveBeenCalled();
      });

      it('should return concat value of generateIntervalBreakpoints() and generateCustomBreakpoints()', function () {
        var generateIntervalBreakpoints = spyOn(scope, 'generateIntervalBreakpoints').and.returnValue(['foo']);
        var generateCustomBreakpoints = spyOn(scope, 'generateCustomBreakpoints').and.returnValue(['bar']);
        scope.config.doInterval = true;
        scope.config.doCustom = true;
        var response = scope.generateBreakpoints();
        expect(response).toEqual(['foo', 'bar']);
      });

    });

    describe('generateIntervalBreakpoints()', function () {

      it('should return an array', function () {
        expect(scope.generateIntervalBreakpoints() instanceof Array).toBeTruthy();
      });

      it('should return the right number of class names', function () {
        spyOn(scope, 'getElementWidth').and.returnValue(250);
        scope.config.doInterval = true;
        scope.config.start = 100;
        scope.config.end = 300;
        scope.config.interval = 100;
        var numOfItems = Math.floor((scope.config.end - scope.config.start) / scope.config.interval) + 1;
        expect(scope.generateIntervalBreakpoints().length).toEqual(numOfItems);
      });

      it('should prepend `lt` to class names when element width is lower than class name value', function () {
        spyOn(scope, 'getElementWidth').and.returnValue(50);
        scope.config.doInterval = true;
        scope.config.start = 100;
        scope.config.end = 300;
        scope.config.interval = 100;
        expect(scope.generateIntervalBreakpoints()).toEqual(['lt100', 'lt200', 'lt300']);
      });

      it('should prepend `gt` to class names when element width is higher than class name value', function () {
        spyOn(scope, 'getElementWidth').and.returnValue(500);
        scope.config.doInterval = true;
        scope.config.start = 100;
        scope.config.end = 300;
        scope.config.interval = 100;
        expect(scope.generateIntervalBreakpoints()).toEqual(['gt100', 'gt200', 'gt300']);
      });

      it('should prepend `config.equalsPrefix` to class name when element width equals class name value', function () {
        spyOn(scope, 'getElementWidth').and.returnValue(200);
        scope.config.doInterval = true;
        scope.config.start = 100;
        scope.config.end = 300;
        scope.config.interval = 100;
        scope.config.equalsPrefix = 'foo';
        expect(scope.generateIntervalBreakpoints()).toEqual(['gt100', 'foo200', 'lt300']);
      });

    });

  });

});