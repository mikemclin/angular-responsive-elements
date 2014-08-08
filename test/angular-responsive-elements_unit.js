'use strict';

describe('ConfigService', function () {
  var $window;
  var RespondConfig;

  beforeEach(module('mm.responsiveElements'));

  beforeEach(inject(function (_$window_, _RespondConfig_) {

    $window = _$window_;
    RespondConfig = _RespondConfig_;

  }));

  it('should pass a test', function () {
    expect(true).toBeTruthy();
  });

});