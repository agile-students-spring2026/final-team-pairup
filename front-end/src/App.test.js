import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  window.history.pushState({}, '', '/onboarding/goal');
});

test('renders onboarding step 1 with progress and disabled Next until complete', async () => {
  render(<App initialIsAuthenticated />);

  expect(screen.getByRole('heading', { name: /what are you preparing for/i })).toBeInTheDocument();
  expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();

  const next = screen.getByRole('button', { name: /^next$/i });
  expect(next).toBeDisabled();

  await userEvent.type(screen.getByLabelText(/display name/i), 'Alex Chen');
  await userEvent.click(screen.getByRole('radio', { name: /software engineer/i }));

  expect(screen.getByRole('group', { name: /practice focus/i })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /algorithms & data structures/i }));

  await userEvent.click(screen.getByRole('button', { name: /^faang$/i }));
  await userEvent.click(screen.getByRole('button', { name: /1–3 months/i }));

  expect(next).not.toBeDisabled();
});

test('changing role clears practice focus selections', async () => {
  render(<App initialIsAuthenticated />);

  await userEvent.click(screen.getByRole('radio', { name: /software engineer/i }));
  await userEvent.click(screen.getByRole('button', { name: /system design/i }));
  expect(screen.getByRole('button', { name: /system design/i })).toHaveAttribute('aria-pressed', 'true');

  await userEvent.click(screen.getByRole('radio', { name: /product manager/i }));
  expect(screen.queryByRole('button', { name: /system design/i })).not.toBeInTheDocument();
});

test('Selecting Any excludes other company tiers', async () => {
  render(<App initialIsAuthenticated />);

  await userEvent.click(screen.getByRole('button', { name: /^faang$/i }));
  expect(screen.getByRole('button', { name: /^faang$/i })).toHaveAttribute('aria-pressed', 'true');

  await userEvent.click(screen.getByRole('button', { name: /^any$/i }));
  expect(screen.getByRole('button', { name: /^any$/i })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: /^faang$/i })).toHaveAttribute('aria-pressed', 'false');
});

async function completeStep1() {
  await userEvent.type(screen.getByLabelText(/display name/i), 'Alex Chen');
  await userEvent.click(screen.getByRole('radio', { name: /software engineer/i }));
  await userEvent.click(screen.getByRole('button', { name: /algorithms & data structures/i }));
  await userEvent.click(screen.getByRole('button', { name: /^faang$/i }));
  await userEvent.click(screen.getByRole('button', { name: /1–3 months/i }));
  await userEvent.click(screen.getByRole('button', { name: /^next$/i }));
}

async function completeStep2() {
  await completeStep1();
  await userEvent.click(screen.getByRole('radio', { name: /intermediate/i }));
  await userEvent.click(screen.getByRole('button', { name: /^cs undergrad$/i }));
  await userEvent.click(screen.getByRole('button', { name: /^next$/i }));
}

test('step 2: Next disabled until level and background; bio capped at 150', async () => {
  render(<App initialIsAuthenticated />);
  await completeStep1();

  expect(screen.getByRole('heading', { name: /tell us about yourself/i })).toBeInTheDocument();
  expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument();

  const next2 = screen.getByRole('button', { name: /^next$/i });
  expect(next2).toBeDisabled();

  await userEvent.click(screen.getByRole('radio', { name: /intermediate/i }));
  expect(next2).toBeDisabled();

  await userEvent.click(screen.getByRole('button', { name: /^cs undergrad$/i }));
  expect(next2).not.toBeDisabled();

  const bio = screen.getByLabelText(/^bio$/i);
  await userEvent.type(bio, 'x'.repeat(200));
  expect(bio).toHaveValue('x'.repeat(150));
  expect(screen.getByText('150/150')).toBeInTheDocument();
});

test('step 2: back returns to step 1 with data preserved', async () => {
  render(<App initialIsAuthenticated />);
  await completeStep1();

  await userEvent.click(screen.getByRole('button', { name: /back to previous step/i }));
  expect(screen.getByRole('heading', { name: /what are you preparing for/i })).toBeInTheDocument();
  expect(screen.getByDisplayValue('Alex Chen')).toBeInTheDocument();
});

test('step 3: Find my matches disabled until ≥3 slots, who goes first, and feedback style', async () => {
  render(<App initialIsAuthenticated />);
  await completeStep2();

  expect(screen.getByRole('heading', { name: /when are you free/i })).toBeInTheDocument();
  expect(screen.getByText(/step 3 of 3/i)).toBeInTheDocument();

  const submit = screen.getByRole('button', { name: /find my matches/i });
  expect(submit).toBeDisabled();
  expect(screen.getByText(/0 selected \(min 3\)/i)).toBeInTheDocument();

  const cells = screen.getAllByRole('checkbox');
  await userEvent.click(cells[0]);
  await userEvent.click(cells[1]);
  expect(submit).toBeDisabled();
  await userEvent.click(cells[2]);
  expect(submit).toBeDisabled();

  await userEvent.click(screen.getByRole('radio', { name: /go first as interviewee/i }));
  expect(submit).toBeDisabled();

  await userEvent.click(screen.getByRole('radio', { name: /structured written notes/i }));
  expect(submit).not.toBeDisabled();
});

async function completeOnboarding() {
  await completeStep2();
  const cells = screen.getAllByRole('checkbox');
  await userEvent.click(cells[0]);
  await userEvent.click(cells[1]);
  await userEvent.click(cells[2]);
  await userEvent.click(screen.getByRole('radio', { name: /go first as interviewee/i }));
  await userEvent.click(screen.getByRole('radio', { name: /structured written notes/i }));
  await userEvent.click(screen.getByRole('button', { name: /find my matches/i }));
}

test('after onboarding completes, main app shows Partners list', async () => {
  render(<App initialIsAuthenticated />);
  await completeOnboarding();

  expect(screen.getByRole('heading', { level: 1, name: /^Partners$/ })).toBeInTheDocument();
  expect(screen.getByText(/2 active prep partnerships/i)).toBeInTheDocument();
});
