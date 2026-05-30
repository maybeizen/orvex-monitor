import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AccountSettings } from "@orvex/types";

import { fetchAccount, updateProfile } from "@/lib/account-api";
import { useAuthStore } from "@/stores/auth.store";

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const res = await fetchAccount();
      return res.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setApiUser = useAuthStore((s) => s.setApiUser);

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      const user = res.data.user;
      setApiUser(user);
      queryClient.setQueryData<AccountSettings>(["account"], (prev) =>
        prev ? { ...prev, ...user } : prev,
      );
    },
  });
}
