# UI Package Testing Strategy

## Overview
The `ui` package contains reusable React Native components used throughout the application. The primary goal of testing here is to ensure components render correctly, handle user interactions properly, and maintain accessibility standards.

## Recommended Stack
- **Test Runner:** Jest
- **Testing Library:** React Native Testing Library (RNTL)
- **Snapshot Testing:** Jest Snapshots

## Testing Scope

### 1. Component Rendering (Snapshots)
- **Goal:** Detect unintended visual changes.
- **Strategy:** Create a snapshot for every atomic component in its various states (e.g., `Button` (primary, secondary, disabled)).
- **Action:**
  - Render component with `render` from RNTL.
  - Use `expect(toJSON()).toMatchSnapshot()`.

### 2. Interaction Testing
- **Goal:** Verify that components respond correctly to user input.
- **Strategy:** Simulate events like press, changeText, scroll.
- **Action:**
  - Use `fireEvent.press`, `fireEvent.changeText` from RNTL.
  - Assert on mock function calls (e.g., `onPress` prop was called).

### 3. Prop Validation
- **Goal:** Ensure components handle props correctly, including edge cases (null, empty strings).
- **Strategy:** Pass various prop combinations and assert on the rendered output.

### 4. Accessibility (A11y)
- **Goal:** Ensure components are usable by everyone.
- **Strategy:** Use `jest-axe` or built-in RNTL accessibility queries.
- **Action:**
  - Verify `accessibilityLabel` and `accessibilityRole` are passed and rendered.

## Directory Structure
Tests should be co-located with components or in a `__tests__` directory.

```
/packages/ui
  /src
    /Button
      Button.tsx
      Button.test.tsx  <-- Co-located test
```

## Example Test Spec
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('UI: Button', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<Button label="Click Me" onPress={() => {}} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('calls onPress when clicked', () => {
    const mockPress = jest.fn();
    const { getByText } = render(<Button label="Click Me" onPress={mockPress} />);
    
    fireEvent.press(getByText('Click Me'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });
});
```
