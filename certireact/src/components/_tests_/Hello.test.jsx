// certireact/src/components/__tests__/Hello.test.jsx
import { render, screen } from '@testing-library/react';
import Hello from '../Hello';
import { describe, it, expect } from 'vitest';

describe('Hello component', () => {
  it('renders greeting with provided name', () => {
    render(<Hello name="Tejas" />);
    expect(screen.getByText('Hello, Tejas!')).toBeInTheDocument();
  });
});
