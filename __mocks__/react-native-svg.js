const React = require('react');

const mockComponent = (name) => {
  return ({ children, ...props }) => React.createElement(name, props, children);
};

module.exports = {
  __esModule: true,
  default: mockComponent('Svg'),
  Svg: mockComponent('Svg'),
  Circle: mockComponent('Circle'),
  Rect: mockComponent('Rect'),
  Path: mockComponent('Path'),
  G: mockComponent('G'),
  Text: mockComponent('Text'),
  Defs: mockComponent('Defs'),
  LinearGradient: mockComponent('LinearGradient'),
  Stop: mockComponent('Stop'),
  ClipPath: mockComponent('ClipPath'),
  Polygon: mockComponent('Polygon'),
  Polyline: mockComponent('Polyline'),
  Line: mockComponent('Line'),
  Ellipse: mockComponent('Ellipse'),
  TSpan: mockComponent('TSpan'),
};
