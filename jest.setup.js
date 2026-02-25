// Jest setup file for Expo SDK 54
// This runs BEFORE any test files are loaded - at the very start of Jest

// Intercept require BEFORE any module is loaded
const Module = require('module');
const originalRequire = Module.prototype.require;

// Completely override require for expo winter modules before anything else runs
Module.prototype.require = function(id) {
  // Block expo winter runtime which causes the issue
  if (typeof id === 'string') {
    if (id.includes('expo/src/winter') || 
        id.includes('expo/winter') ||
        id === 'expo' ||
        id.startsWith('expo/')) {
      // Return a minimal mock that won't try to initialize anything
      return {
        registerRootComponent: () => {},
        Platform: { OS: 'android' }
      };
    }
  }
  return originalRequire.apply(this, arguments);
};

// Now define the jest mocks
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
}));

// Mock react-native-svg to avoid SvgTouchableMixin issues
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockSvg = (props) => React.createElement(View, { testID: props.testID });
  MockSvg.Circle = (props) => React.createElement(View, { testID: props.testID });
  MockSvg.Rect = (props) => React.createElement(View, { testID: props.testID });
  MockSvg.Path = (props) => React.createElement(View, { testID: props.testID });
  MockSvg.G = (props) => React.createElement(View, { testID: props.testID });
  MockSvg.Text = (props) => React.createElement(View, { testID: props.testID });
  MockSvg.Line = (props) => React.createElement(View, { testID: props.testID });
  
  return {
    __esModule: true,
    default: MockSvg,
    Circle: MockSvg.Circle,
    Rect: MockSvg.Rect,
    Path: MockSvg.Path,
    G: MockSvg.G,
    Text: MockSvg.Text,
    Line: MockSvg.Line,
  };
});

// Mock react-native - complete standalone mock without requireActual
jest.mock('react-native', () => {
  // Create mock View, Text, Pressable components that preserve testID
  const MockView = ({ children, testID, style, ...props }) => {
    const React = require('react');
    return React.createElement('View', { testID, style, ...props }, children);
  };
  
  const MockText = ({ children, testID, style, ...props }) => {
    const React = require('react');
    return React.createElement('Text', { testID, style, ...props }, children);
  };
  
  const MockPressable = ({ children, onPressIn, onPressOut, testID, style, ...props }) => {
    const React = require('react');
    return React.createElement('Pressable', { testID, style, ...props, onPressIn, onPressOut }, children);
  };

  return {
    Platform: { OS: 'android', select: jest.fn((obj) => obj.android || {}) },
    StyleSheet: {
      flatten: (style) => {
        if (Array.isArray(style)) {
          return style.reduce((acc, s) => ({ ...acc, ...(s || {}) }), {});
        }
        return style || {};
      },
      create: (styles) => styles,
      compose: (a, b) => [a, b],
      absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
      absoluteFillObject: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
      hairlineWidth: 1,
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    NativeModules: {
      AudioEngine: {
        initialize: jest.fn().mockResolvedValue(true),
        playNote: jest.fn().mockResolvedValue(true),
        stopNote: jest.fn().mockResolvedValue(true),
      },
    },
    View: MockView,
    Text: MockText,
    Pressable: MockPressable,
    TouchableOpacity: MockView,
    ScrollView: MockView,
    Modal: MockView,
    Image: MockView,
    TextInput: MockView,
    FlatList: MockView,
    VirtualizedList: MockView,
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
    Alert: {
      alert: jest.fn(),
    },
    Animated: {
      View: MockView,
      Text: MockText,
      Image: MockView,
      ScrollView: MockView,
      timing: jest.fn(() => ({ start: jest.fn() })),
      Value: jest.fn(() => ({ setValue: jest.fn(), interpolate: jest.fn() })),
    },
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
    },
    Vibration: {
      vibrate: jest.fn(),
    },
    Linking: {
      openURL: jest.fn(),
      canOpenURL: jest.fn(),
    },
    PermissionsAndroid: {
      request: jest.fn(),
    },
    DevMenu: {},
    DevSettings: {},
  };
});

jest.mock('zustand', () => ({
  create: (fn) => fn(),
}));
