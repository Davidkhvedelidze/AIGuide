import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button, EmptyState } from '@/components/ui';

describe('design system', () => {
  it('Button calls onPress and exposes its label to screen readers', async () => {
    const onPress = jest.fn();
    await render(<Button title="Listen now" onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('Listen now'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('a loading Button cannot be pressed', async () => {
    const onPress = jest.fn();
    await render(<Button title="Continue" loading onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('Continue'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('EmptyState shows its action', async () => {
    const onAction = jest.fn();
    await render(<EmptyState title="Nothing here yet" message="Scan a place" action="Open map" onAction={onAction} />);
    expect(screen.getByText('Nothing here yet')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Open map'));
    expect(onAction).toHaveBeenCalled();
  });
});
