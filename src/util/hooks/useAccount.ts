import { useCallback, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import AccountData, { AccountDataInsert } from "types/auth/accountData";
import { enqueueSnackbar } from "notistack";
import randomName from "util/randomName";

function useAccount() {
  const [account, _setAccount] = useState<AccountData>();
  const [loading, setLoading] = useState(true);

  const setAccount = useCallback(
    async (accountData: AccountDataInsert) => {
      const updatedData: AccountData = { ...account, ...accountData } as AccountData;
      _setAccount(updatedData);

      const { user_id, ...rest } = updatedData;
      const { error } = await supabase
        .from("krooster_accounts")
        .update({ ...rest })
        .eq("user_id", user_id);

      if (error)
        enqueueSnackbar({
          message: `DB${error.code}: ${error.message}`,
          variant: "error",
        });
    },
    [account]
  );

  // fetch data from db
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user_id = session?.user.id;

      if (!user_id) return;

      const { data, error } = await supabase.from("krooster_accounts").select().eq("user_id", user_id).single();

      if (error)
        enqueueSnackbar({
          message: `DB${error.code}: ${error.message}`,
          variant: "error",
        });

      if (!data || !data.username) {
        const genName = randomName();
        const { data: accountData } = await supabase
          .from("krooster_accounts")
          .upsert({
            user_id: user_id,
            username: genName,
            display_name: genName,
          })
          .select()
          .single();

        enqueueSnackbar({
          message: "You have been assigned a random username. Change it in the settings!",
          variant: "info",
        });
        _setAccount(accountData as AccountData);
      } else {
        _setAccount(data as AccountData);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return [account, setAccount, { loading }] as const;
}

export default useAccount;
