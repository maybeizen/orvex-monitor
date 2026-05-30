import { useQuery } from "@tanstack/react-query";

import {
  RESERVED_USERNAME_MESSAGE,
  isReservedUsername,
  isValidUsernameFormat,
} from "@orvex/types";

import { checkUsername } from "@/lib/account-api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function useUsernameAvailability(username: string) {
  const debounced = useDebouncedValue(username.trim(), 350);
  const canCheck = isValidUsernameFormat(debounced);
  const reserved = canCheck && isReservedUsername(debounced);

  const query = useQuery({
    queryKey: ["account", "username-check", debounced],
    queryFn: () => checkUsername(debounced),
    select: (res) => res.data,
    enabled: canCheck && !reserved,
    staleTime: 30_000,
    retry: 1,
  });

  const isChecking =
    canCheck &&
    !reserved &&
    (username.trim() !== debounced || query.isFetching || query.isLoading);

  const available = reserved
    ? false
    : canCheck
      ? (query.data?.available ?? undefined)
      : undefined;

  return {
    username: debounced,
    canCheck,
    available,
    reserved,
    reservedMessage: RESERVED_USERNAME_MESSAGE,
    isChecking,
    isError: query.isError,
  };
}
