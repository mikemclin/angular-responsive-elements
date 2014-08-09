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
        RespondConfig.start = 100;
        expect(scope.config.start).toMatch(100);
        element = angular.element('<div respond respond-config="{start:300}"></div>');
        $compile(element)($rootScope);
        expect(scope.config.start).toMatch(300);
      });

    });

    describe('init()', function () {

      it('should call renderBreakpointClasses()', function () {
        var renderBreakpointClasses = spyOn(scope, 'renderBreakpointClasses');
        scope.init();
        expect(renderBreakpointClasses).toHaveBeenCalled();
      });

    });

  });

});