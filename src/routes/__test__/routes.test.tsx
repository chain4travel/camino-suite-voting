import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { routes } from '../../routes'

describe('render routes', () => {
  test('test click button to skip page', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/vote'] })
    render(<RouterProvider router={router} />)
    const elements = screen.getAllByTestId('skip-page')
    fireEvent.click(elements[0])
    expect(screen.getByText(/Start new voting/i))
  })
})