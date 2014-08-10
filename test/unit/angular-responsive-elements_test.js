'use strict';

describe('ConfigService', function () {
  var $rootScope;
  var $compile;
  var $window;
  var $timeout;
  var RespondConfig;
  var element;
  var scope;

  beforeEach(module('mm.responsiveElements'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$window_, _$timeout_, _RespondConfig_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $window = _$window_;
    $timeout = _$timeout_;
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

      beforeEach(function () {
        scope.config.doInterval = true;
        scope.config.start = 100;
        scope.config.end = 300;
        scope.config.interval = 100;
      });

      it('should return an array', function () {
        expect(scope.generateIntervalBreakpoints() instanceof Array).toBeTruthy();
      });

      it('should call getClassName() the correct number of times', function () {
        var getClassName = spyOn(scope, 'getClassName');
        var numOfItems = Math.floor((scope.config.end - scope.config.start) / scope.config.interval) + 1;
        scope.generateIntervalBreakpoints();
        expect(getClassName.calls.count()).toEqual(numOfItems);
      });

      it('should pass the correct value to getClassName()', function () {
        var getClassName = spyOn(scope, 'getClassName');
        scope.generateIntervalBreakpoints();
        expect(getClassName.calls.first().args[0]).toEqual(100);
        expect(getClassName.calls.all()[1].args[0]).toEqual(200);
        expect(getClassName.calls.mostRecent().args[0]).toEqual(300);
      });

      it('should return an array of the values returned from getClassName()', function () {
        var getClassName = spyOn(scope, 'getClassName').and.returnValue('foo');
        expect(scope.generateIntervalBreakpoints()).toEqual(['foo', 'foo', 'foo']);
      });

    });

    describe('generateCustomBreakpoints()', function () {

      beforeEach(function () {
        scope.config.doInterval = false;
        scope.config.doCustom = false;
        scope.config.custom = [320, 768, 1280];
      });

      it('should return an array', function () {
        expect(scope.generateCustomBreakpoints() instanceof Array).toBeTruthy();
      });

      it('should call getClassName() the correct number of times', function () {
        var getClassName = spyOn(scope, 'getClassName');
        scope.generateCustomBreakpoints();
        expect(getClassName.calls.count()).toEqual(scope.config.custom.length);
      });

      it('should pass the correct value to getClassName()', function () {
        var getClassName = spyOn(scope, 'getClassName');
        scope.generateCustomBreakpoints();
        expect(getClassName.calls.first().args[0]).toEqual(320);
        expect(getClassName.calls.all()[1].args[0]).toEqual(768);
        expect(getClassName.calls.mostRecent().args[0]).toEqual(1280);
      });

      it('should return an array of the values returned from getClassName()', function () {
        var getClassName = spyOn(scope, 'getClassName').and.returnValue('foo');
        expect(scope.generateCustomBreakpoints()).toEqual(['foo', 'foo', 'foo']);
      });

    });

    describe('getClassName()', function () {

      beforeEach(function () {
        scope.config.equalsPrefix = 'foo';
        spyOn(scope, 'getElementWidth').and.returnValue(300);
      });

      it('should return a string', function () {
        expect(typeof scope.getClassName(200)).toBe('string');
      });

      it('should prepend `lt` if element width is less than passed value', function () {
        expect(scope.getClassName(400)).toBe('lt400');
      });

      it('should prepend `gt` if element width is less than passed value', function () {
        expect(scope.getClassName(200)).toBe('gt200');
      });

      it('should prepend `config.equalsPrefix` if element width is equal to passed value', function () {
        expect(scope.getClassName(300)).toBe('foo300');
      });

    });

    describe('removeBreakpointClasses()', function () {

      var parseBreakpointClasses;

      beforeEach(function () {
        parseBreakpointClasses = spyOn(scope, 'parseBreakpointClasses').and.returnValue(['foo', 'bar']);
      });

      it('should call parseBreakpointClasses()', function () {
        expect(parseBreakpointClasses).not.toHaveBeenCalled();
        scope.removeBreakpointClasses();
        expect(parseBreakpointClasses).toHaveBeenCalled();
      });

      it('should remove classes on element returned from parseBreakpointClasses()', function () {
        element.addClass('foo bar');
        expect(element.hasClass('foo bar')).toBeTruthy();
        scope.removeBreakpointClasses();
        expect(element.hasClass('foo bar')).toBeFalsy();
      });

    });

    describe('parseBreakpointClasses()', function () {

      beforeEach(function () {
        scope.config.equalsPrefix = 'foo';
      });

      it('should return an array', function () {
        expect(scope.parseBreakpointClasses() instanceof Array).toBeTruthy();
      });

      it('should return all `lt`, `gt` and `config.equalsPrefix` prefixed classes on element', function () {
        element.attr('class', 'lt100 lt200 gt100 gt200 foo100 foo200 bar100 bar200');
        expect(scope.parseBreakpointClasses()).toEqual(['lt100', 'lt200', 'gt100', 'gt200', 'foo100', 'foo200']);
      });

      it('should only return classes if prefix is followed by a number', function () {
        element.attr('class', 'lt ltfoo lt100 gt gtbar gt100 foo foobaz foo100');
        expect(scope.parseBreakpointClasses()).toEqual(['lt100', 'gt100', 'foo100']);
      });

    });

    describe('debounce()', function () {

      var debounceFunc;

      beforeEach(function () {
        debounceFunc = jasmine.createSpy('debounceFunc');
      });

      it('should invoke callback after specified delay', function () {
        scope.debounce(debounceFunc, 100);
        expect(debounceFunc).not.toHaveBeenCalled();
        $timeout.flush(100);
        expect(debounceFunc).toHaveBeenCalled();
      });

      it('should wait again if another call arrives during wait', function () {
        scope.debounce(debounceFunc, 100);
        $timeout.flush(99);
        scope.debounce(debounceFunc, 100);
        $timeout.flush(99);
        expect(debounceFunc).not.toHaveBeenCalled();
        $timeout.flush(1);
        expect(debounceFunc).toHaveBeenCalled();
      });

    });

  });

});