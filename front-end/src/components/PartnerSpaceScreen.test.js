import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PartnerSpaceScreen from './PartnerSpaceScreen';
import { PARTNERS_MOCK_NOW, partnersMock } from '../data/partnersMock';

beforeEach(() => {
  sessionStorage.clear();
});

test('first visit: system intro and icebreaker in input', () => {
  const jordan = partnersMock.find((p) => p.id === 'partner-jordan');
  render(
    <PartnerSpaceScreen partner={jordan} onBack={() => {}} onDisconnect={() => {}} nowMs={PARTNERS_MOCK_NOW} />,
  );

  expect(screen.getByText(/now prepping partners/i)).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /message/i })).not.toHaveValue('');
  expect(screen.getByText(/Waiting for Jordan to pick a time/i)).toBeInTheDocument();
});

test('header manage opens disconnect dialog; disconnect calls handler', async () => {
  const jordan = partnersMock.find((p) => p.id === 'partner-jordan');
  const onDisconnect = jest.fn();
  render(
    <PartnerSpaceScreen partner={jordan} onBack={() => {}} onDisconnect={onDisconnect} nowMs={PARTNERS_MOCK_NOW} />,
  );

  await userEvent.click(screen.getByRole('button', { name: /manage or disconnect partnership/i }));
  expect(screen.getByRole('heading', { name: /disconnect from jordan kim/i })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /^disconnect$/i }));
  expect(onDisconnect).toHaveBeenCalled();
});

test('Alex: incoming proposal card (not yellow banner)', () => {
  const alex = partnersMock.find((p) => p.id === 'partner-alex');
  render(
    <PartnerSpaceScreen partner={alex} onBack={() => {}} onDisconnect={() => {}} nowMs={PARTNERS_MOCK_NOW} />,
  );

  expect(screen.queryByText(/Waiting for Alex to pick a time/i)).not.toBeInTheDocument();
  expect(screen.getByText(/Session proposal/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Sat · 10:00 AM PT/i })).toBeInTheDocument();
});

test('feedback flow: Q1 Yes → Q2 requires stars → Q3 Skip dismisses card', async () => {
  const jordan = partnersMock.find((p) => p.id === 'partner-jordan');
  render(
    <PartnerSpaceScreen partner={jordan} onBack={() => {}} onDisconnect={() => {}} nowMs={PARTNERS_MOCK_NOW} />,
  );

  expect(screen.getByRole('region', { name: /session feedback/i })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /^yes$/i }));

  expect(screen.getByText(/How was the session/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^next$/i })).toBeDisabled();
  await userEvent.click(screen.getByRole('radio', { name: /2★/ }));
  expect(screen.getByRole('button', { name: /^next$/i })).not.toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: /^next$/i }));

  expect(screen.getByText(/Suggest an improvement for PairUp/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /^skip$/i }));
  expect(screen.queryByRole('region', { name: /session feedback/i })).not.toBeInTheDocument();
});

test('Q1 No shows acknowledgement then advances to Q2 after 2s', async () => {
  jest.useFakeTimers();
  const jordan = partnersMock.find((p) => p.id === 'partner-jordan');
  sessionStorage.removeItem('pairup-feedback-done-partner-jordan-Sat Mar 15 · Coding — Arrays');
  render(
    <PartnerSpaceScreen partner={jordan} onBack={() => {}} onDisconnect={() => {}} nowMs={PARTNERS_MOCK_NOW} />,
  );

  await userEvent.click(screen.getByRole('button', { name: /^no$/i }));
  expect(screen.getByText(/noted this for partner stats/i)).toBeInTheDocument();

  await act(async () => {
    jest.advanceTimersByTime(2000);
  });

  expect(screen.getByText(/How was the session/i)).toBeInTheDocument();
  jest.useRealTimers();
});

test('completed feedback does not show card again', () => {
  const jordan = partnersMock.find((p) => p.id === 'partner-jordan');
  sessionStorage.setItem('pairup-feedback-done-partner-jordan-Sat Mar 15 · Coding — Arrays', '1');
  render(
    <PartnerSpaceScreen partner={jordan} onBack={() => {}} onDisconnect={() => {}} nowMs={PARTNERS_MOCK_NOW} />,
  );

  expect(screen.queryByRole('region', { name: /session feedback/i })).not.toBeInTheDocument();
});
