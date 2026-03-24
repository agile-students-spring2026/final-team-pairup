import { mockDiscoverUsers } from "../data/mockDiscoverUsers";

export function fetchDiscoverUsers() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDiscoverUsers);
    }, 250);
  });
}