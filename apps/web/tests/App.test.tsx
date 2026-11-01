import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { App } from '../src/App';
import { MODELS } from '../src/content/models';
import { loadCheckpoint } from '../src/features/plant/checkpoint';
import { PlantRoot } from '../src/features/plant/PlantRoot';
import { services } from './plantFixtures';

function renderApp() {
  const plantServices = services();
  render(
    <PlantRoot services={plantServices}>
      <App />
    </PlantRoot>,
  );
  return plantServices;
}

describe('App', () => {
  it('renders the name, the breakers and every section', () => {
    renderApp();
    expect(screen.getByRole('heading', { level: 1, name: 'Gabriel Diem' })).toBeInTheDocument();
    expect(screen.getAllByRole('switch')).toHaveLength(3);
    for (const name of [
      'Thirteen years on one roll of paper',
      'I like AI the way I like any machine',
      `Tune in to ${MODELS.length} models hunting concurrency bugs`,
      'Other equipment on site',
      'Call the control room',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });

  it('opens the timeline with the current job', () => {
    renderApp();
    const items = within(
      screen.getByRole('heading', { name: /Thirteen years/ }).closest('section') as HTMLElement,
    ).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Principal Data & AI Architect at Salesforce');
    expect(items.at(-1)).toHaveTextContent('Technician in electromechanical equipment');
  });

  it('lists public profiles only in the footer', () => {
    renderApp();
    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'LinkedIn',
      'GitHub',
      'dev.to',
    ]);
  });

  it('flips a breaker, logs the trip and updates the counter', async () => {
    const user = userEvent.setup();
    renderApp();
    const breaker = screen.getByRole('switch', { name: 'Replica G2 breaker' });
    await user.click(breaker);
    expect(breaker).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('log')).toHaveTextContent('G2 breaker tripped.');
    expect(screen.getByTestId('trips')).toHaveTextContent('0001');
  });

  it('blacks out on the last replica, locks the page and comes back from the knife switch', async () => {
    const user = userEvent.setup();
    renderApp();
    for (const name of ['G1', 'G2', 'G3']) {
      await user.click(screen.getByRole('switch', { name: `Replica ${name} breaker` }));
    }
    const dialog = await screen.findByRole('dialog', { name: 'That was the last replica' });
    expect(document.body).toHaveClass('dark');
    const knife = within(dialog).getByRole('button', { name: 'Black start' });
    expect(knife).toHaveFocus();

    await user.click(knife);
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(document.body).not.toHaveClass('dark');
    await vi.waitFor(
      () =>
        expect(screen.getByRole('switch', { name: 'Replica G3 breaker' })).toHaveAttribute(
          'aria-checked',
          'true',
        ),
      { timeout: 3000 },
    );
  });

  it('starts on the default station and tunes through the range input', () => {
    renderApp();
    expect(screen.getByTestId('station')).toHaveTextContent('gpt-5.4-nano');
    const tuner = screen.getByRole('slider', { name: 'Tune to a model' });
    fireEvent.change(tuner, { target: { value: '0' } });
    expect(screen.getByTestId('station')).toHaveTextContent('granite4:350m-h');
  });
});

describe('bug test', () => {
  it('walks from a wrong line to the full-marks fix', async () => {
    const user = userEvent.setup();
    Element.prototype.scrollIntoView = vi.fn();
    const { checkpoint } = renderApp();

    await user.click(screen.getByRole('button', { name: 'Line: defer to.mu.Unlock()' }));
    expect(screen.getByText('3 out of 20')).toBeInTheDocument();
    expect(screen.getByTestId('station')).toHaveTextContent('You');

    await user.click(screen.getByRole('button', { name: 'Line: go transfer(b, a, 50)' }));
    expect(screen.getByText('9 out of 20')).toBeInTheDocument();

    const hit = screen.getByRole('button', { name: 'Line: to.mu.Lock()' });
    await user.click(hit);
    expect(screen.getByText('15 out of 20')).toBeInTheDocument();
    expect(hit).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Always lock the two accounts/ }));
    expect(screen.getByText('20 out of 20')).toBeInTheDocument();
    expect(screen.getByTestId('remark')).toHaveTextContent(`Ahead of ${MODELS.length} of the`);
    expect(checkpoint.you).toBe(20);
    expect(loadCheckpoint(localStorage).you).toBe(20);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('tunes back to You on a return visit', () => {
    const first = services();
    first.plant.saveScore(9);
    renderApp();
    expect(screen.getByTestId('station')).toHaveTextContent('You');
    expect(screen.getByTestId('remark')).toHaveTextContent('Your score from last time');
  });
});
