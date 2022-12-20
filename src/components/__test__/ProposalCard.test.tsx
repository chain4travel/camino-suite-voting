import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from "react-router-dom";
import ProposalCard from '../ProposalCard'

describe('renders a proposal card', () => {
    
    test('test title', () => {
        render(
            <MemoryRouter>
                <ProposalCard title="New Validator" ctx="" btnCtx="" url="" />;
            </MemoryRouter>
        )
        const linkElement = screen.getByText(/New Validator/i)
        expect(linkElement).toBeInTheDocument();
    })

    test('test ctx', () => {
        render(
            <MemoryRouter>
                <ProposalCard title="" ctx="Test ctx" btnCtx="" url="" />;
            </MemoryRouter>
        )
        const linkElement = screen.getByText(/Test ctx/i)
        expect(linkElement).toBeInTheDocument();
    })

    test('test btnCtx', () => {
        render(
            <MemoryRouter>
                <ProposalCard title="" ctx="" btnCtx="New Validator" url="" />;
            </MemoryRouter>
        )
        const linkElement = screen.getByText(/New Validator/i)
        expect(linkElement).toBeInTheDocument();
    })


    test('test click button skip page', () => {
        const btnCtx = "New Validator"
        render(
            <MemoryRouter initialEntries={['/vote', '/vote/validators']}>
                <ProposalCard title="" ctx="" btnCtx={btnCtx} url="validators" />;
            </MemoryRouter>
        )
        const element = screen.getByTestId('skip-page')
        fireEvent.click(element)
        // screen.getByRole('link', {name: "Start new voting"})
    })
    
})

