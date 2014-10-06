'use strict';

describe('RespondConfig service', function () {

  beforeEach(module('mm.responsiveElements'));

  it('should set default config', function () {
    inject(function (RespondConfig) {
      expect(RespondConfig).toEqual({
        start: 100,
        end: 900,
        interval: 50,
        ltPrefix: 'lt',
        gtPrefix: 'gt',
        equalsPrefix: 'gt',
        maxRefreshRate: 5,
        breaks: [],
        mobile: 'both',
        legacy: false
      });
    });
  });

  it('allow values to be changed during angular config', function () {
    module(function (RespondConfigProvider) {
      RespondConfigProvider.config({
        start: 500
      });
    });
    inject(function (RespondConfig) {
      expect(RespondConfig.start).toBe(500);
    });
  });

});

describe('respond directive', function () {
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

  describe('config', function () {

    it('should use RespondConfig for configuration', function () {
      expect(scope.config).toMatch(RespondConfig);
    });

    it('should allow custom config object per element', function () {
      element = angular.element('<div respond respond-config="{start:300}"></div>');
      $compile(element)($rootScope);
      scope = element.isolateScope();
      expect(scope.config.start).toMatch(300);
    });

  });

  describe('init()', function () {

    it('should call renderBreakpointClasses() and addListeners()', function () {
      var renderBreakpointClasses = spyOn(scope, 'renderBreakpointClasses');
      var addListeners = spyOn(scope, 'addListeners');
      scope.init();
      expect(renderBreakpointClasses).toHaveBeenCalled();
      expect(addListeners).toHaveBeenCalled();
    });

  });

  describe('addListeners()', function () {

    it('should add listener that calls debounceRenderBreakpointClasses() on window resize event', function () {
      var debounceRenderBreakpointClasses = spyOn(scope, 'debounceRenderBreakpointClasses');
      scope.addListeners();
      expect(debounceRenderBreakpointClasses).not.toHaveBeenCalled();
      angular.element($window).triggerHandler('resize');
      expect(debounceRenderBreakpointClasses).toHaveBeenCalled();
    });

    it('should remove window resize listener when element scope is destroyed', function () {
      var debounceRenderBreakpointClasses = spyOn(scope, 'debounceRenderBreakpointClasses');
      scope.addListeners();
      scope.$broadcast('$destroy');
      angular.element($window).triggerHandler('resize');
      expect(debounceRenderBreakpointClasses).not.toHaveBeenCalled();
    });

  });

  describe('getElementWidth()', function () {

    it('should return a number', function () {
      expect(typeof scope.getElementWidth()).toBe('number');
    });

  });

  describe('renderBreakpointClasses()', function () {

    it('should call generateClasses()', function () {
      var generateClasses = spyOn(scope, 'generateClasses').and.returnValue([]);
      scope.renderBreakpointClasses();
      expect(generateClasses).toHaveBeenCalled();
    });

    it('should call removeBreakpointClasses()', function () {
      var removeBreakpointClasses = spyOn(scope, 'removeBreakpointClasses');
      scope.renderBreakpointClasses();
      expect(removeBreakpointClasses).toHaveBeenCalled();
    });

    it('should call add classes to element', function () {
      var generateClasses = spyOn(scope, 'generateClasses').and.returnValue(['foo', 'bar']);
      var removeBreakpointClasses = spyOn(scope, 'removeBreakpointClasses');
      var elementClasses = element.attr('class');
      scope.renderBreakpointClasses();
      expect(element.attr('class')).toBe(elementClasses + ' foo bar');
    });

    it('should set the current class property after adding classes to element', function () {
      var generateClasses = spyOn(scope, 'generateClasses').and.returnValue(['foo', 'bar']);
      var setCurrentClasses = spyOn(scope, 'setCurrentClasses');
      scope.renderBreakpointClasses();
      expect(setCurrentClasses).toHaveBeenCalledWith(['foo', 'bar']);
    });

  });

  describe('debounceRenderBreakpointClasses()', function () {

    it('should call debounce()', function () {
      var debounce = spyOn(scope, 'debounce');
      scope.debounceRenderBreakpointClasses();
      expect(debounce).toHaveBeenCalled();
    });

    it('should pass the correct parameters to debounce ', function () {
      var debounce = spyOn(scope, 'debounce');
      scope.debounceRenderBreakpointClasses();
      expect(debounce.calls.mostRecent().args).toEqual([scope.renderBreakpointClasses, scope.config.maxRefreshRate, true]);
    });

  });

  describe('generateClasses()', function () {

    it('should return an array', function () {
      expect(scope.generateClasses() instanceof Array).toBeTruthy();
    });

    it('should call generateIntervalClasses() when configured to do so', function () {
      var generateIntervalClasses = spyOn(scope, 'generateIntervalClasses').and.returnValue([]);
      scope.config.legacy = false;
      scope.generateClasses();
      expect(generateIntervalClasses).not.toHaveBeenCalled();
      scope.config.legacy = true;
      scope.generateClasses();
      expect(generateIntervalClasses).toHaveBeenCalled();
    });

    it('should call generateCustomClasses() when configured to do so', function () {
      var generateCustomClasses = spyOn(scope, 'generateCustomClasses').and.returnValue([]);
      scope.config.legacy = true;
      scope.generateClasses();
      expect(generateCustomClasses).not.toHaveBeenCalled();
      scope.config.legacy = false;
      scope.generateClasses();
      expect(generateCustomClasses).toHaveBeenCalled();
    });

  });

  describe('generateIntervalClasses()', function () {

    beforeEach(function () {
      scope.config.legacy = true;
      scope.config.start = 100;
      scope.config.end = 300;
      scope.config.interval = 100;
    });

    it('should return an array', function () {
      expect(scope.generateIntervalClasses() instanceof Array).toBeTruthy();
    });

    it('should call getClassName() the correct number of times', function () {
      var getClassName = spyOn(scope, 'getClassName');
      var numOfItems = Math.floor((scope.config.end - scope.config.start) / scope.config.interval) + 1;
      scope.generateIntervalClasses();
      expect(getClassName.calls.count()).toEqual(numOfItems);
    });

    it('should pass the correct value to getClassName()', function () {
      var getClassName = spyOn(scope, 'getClassName');
      scope.generateIntervalClasses();
      expect(getClassName.calls.first().args[0]).toEqual(100);
      expect(getClassName.calls.all()[1].args[0]).toEqual(200);
      expect(getClassName.calls.mostRecent().args[0]).toEqual(300);
    });

    it('should return an array of the values returned from getClassName()', function () {
      var getClassName = spyOn(scope, 'getClassName').and.returnValue('foo');
      expect(scope.generateIntervalClasses()).toEqual(['foo', 'foo', 'foo']);
    });

  });

  describe('generateCustomClasses()', function () {

    beforeEach(function () {
      scope.config.legacy = false;
      scope.config.breaks = [320, 768, 1280];
    });

    it('should return an array', function () {
      expect(scope.generateCustomClasses() instanceof Array).toBeTruthy();
    });

    it('should call getClassName() the correct number of times', function () {
      var getClassName = spyOn(scope, 'getClassName');
      scope.generateCustomClasses();
      expect(getClassName.calls.count()).toEqual(scope.config.breaks.length);
    });

    it('should pass the correct value to getClassName()', function () {
      var getClassName = spyOn(scope, 'getClassName');
      scope.generateCustomClasses();
      expect(getClassName.calls.first().args[0]).toEqual(320);
      expect(getClassName.calls.all()[1].args[0]).toEqual(768);
      expect(getClassName.calls.mostRecent().args[0]).toEqual(1280);
    });

    it('should return an array of the values returned from getClassName()', function () {
      var getClassName = spyOn(scope, 'getClassName').and.returnValue('foo');
      expect(scope.generateCustomClasses()).toEqual(['foo', 'foo', 'foo']);
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

    var getCurrentClasses;

    beforeEach(function () {
      getCurrentClasses = spyOn(scope, 'getCurrentClasses').and.returnValue(['foo', 'bar']);
    });

    it('should call parseBreakpointClasses()', function () {
      expect(getCurrentClasses).not.toHaveBeenCalled();
      scope.removeBreakpointClasses();
      expect(getCurrentClasses).toHaveBeenCalled();
    });

    it('should remove classes on element returned from parseBreakpointClasses()', function () {
      element.addClass('foo bar');
      expect(element.hasClass('foo bar')).toBeTruthy();
      scope.removeBreakpointClasses();
      expect(element.hasClass('foo bar')).toBeFalsy();
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

    it('should invoke callback immediately if 3rd param is truthy', function () {
      scope.debounce(debounceFunc, 100, true);
      expect(debounceFunc).toHaveBeenCalled();
    });

  });

});
