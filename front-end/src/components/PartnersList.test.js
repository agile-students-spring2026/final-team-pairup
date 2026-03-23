import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PartnersList from './PartnersList';
import { PARTNERS_MOCK_NOW, partnersMock } from '../data/partnersMock';

test('empty state CTA goes to Matches', async () => {
  const onMatches = jest.fn();
  render(<PartnersList partners={[]} onOpenPartner={() => {}} onGoToMatches={onMatches} />);

  await userEvent.click(screen.getByRole('button', { name: /go to matches/i }));
  expect(onMatches).toHaveBeenCalledTimes(1);
});

test('empty state omits Matches CTA when onGoToMatches is not passed', () => {
  render(<PartnersList partners={[]} onOpenPartner={() => {}} />);
  expect(screen.queryByRole('button', { name: /go to matches/i })).not.toBeInTheDocument();
});

test('cards ordered by most recent activity; opening a card calls handler', async () => {
  const onOpen = jest.fn();
  render(
    <PartnersList partners={partnersMock} onOpenPartner={onOpen} nowMs={PARTNERS_MOCK_NOW} />,
  );

  const buttons = screen.getAllByRole('button', { name: /open partner space with/i });
  expect(buttons[0]).toHaveAccessibleName(/Jordan Kim/i);
  expect(buttons[1]).toHaveAccessibleName(/Alex Chen/i);

  await userEvent.click(buttons[0]);
  expect(onOpen).toHaveBeenCalledWith('partner-jordan');
});

test('upcoming session pill shows date and type when present', () => {
  render(
    <PartnersList partners={partnersMock} onOpenPartner={() => {}} nowMs={PARTNERS_MOCK_NOW} />,
  );

  expect(screen.getByText(/Sat, Mar 22/i)).toBeInTheDocument();
  expect(screen.getByText(/Mock interview/i)).toBeInTheDocument();
});
