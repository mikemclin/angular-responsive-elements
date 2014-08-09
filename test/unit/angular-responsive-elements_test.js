'use strict';

describe('ConfigService', function () {
  var $scope;
  var $compile;
  var $window;
  var RespondConfig;
  var element;

  beforeEach(module('mm.responsiveElements'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$window_, _RespondConfig_) {
    $scope = _$rootScope_;
    $compile = _$compile_;
    $window = _$window_;
    RespondConfig = _RespondConfig_;
    element = angular.element('<div respond></div>');
    $compile(element)($scope);
  }));

  describe('respond', function () {

    describe('config', function () {

      it('should use RespondConfig for configuration', function () {
        expect(element.isolateScope().config).toMatch(RespondConfig);
      });

      it('should allow custom config per element', function () {
        RespondConfig.start = 100;
        expect(element.isolateScope().config.start).toMatch(100);
        element = angular.element('<div respond respond-config="{start:300}"></div>');
        $compile(element)($scope);
        expect(element.isolateScope().config.start).toMatch(300);
      });

    });

    describe('init()', function () {

      it('should call renderBreakpointClasses()', function () {
        var renderBreakpointClasses = spyOn(element.isolateScope(), 'renderBreakpointClasses');
        element.isolateScope().init();
        expect(renderBreakpointClasses).toHaveBeenCalled();
      });

    });

  });

});