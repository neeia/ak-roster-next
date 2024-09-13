import { supabaseApi, UID } from "./apiSlice";
import supabaseClient from 'supabase/supabaseClient';
import AccountData from "types/auth/accountData";
import { Operator } from "types/operator";
import { Json } from "../types/supabase";
import { OperatorSupport } from "../types/operators/supports";
import supabase from "supabase/supabaseClient";


const extendedApi = supabaseApi.injectEndpoints({
  endpoints: (builder) => ({
    supportsGet: builder.query<OperatorSupport[], UID>({
      queryFn: async ({ user_id }) => {
        const { data, error } = await supabaseClient
          .from("supports")
          .select()
          .eq('user_id', user_id)

        return { data: data as OperatorSupport[] };
      },
      providesTags: ["supports"],
    }),
    currentSupportsGet: builder.query<OperatorSupport[], void>({
      queryFn: async () => {

        const {data: session} = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { data, error } = await supabaseClient
          .from("supports")
          .select()
          .eq('user_id', user_id)

        return { data: data as OperatorSupport[] };
      },
      providesTags: ["supports"],
    }),
    supportSet: builder.mutation<boolean, OperatorSupport>({
      queryFn: async (support: OperatorSupport) => {

        const {data: session} = await supabase.auth.getSession();
        const user_id = session.session?.user.id ?? "";

        const { data, error } = await supabaseClient
          .from("supports")
          .upsert(support)
          .eq('user_id', user_id)
          .select()
          .single();
        return { data: !!error };
      },
      invalidatesTags: ["supports"],
    }),
    supportSkillSet: builder.mutation<boolean, { supportSlot: number, skillSlot: number }>({
      queryFn: async ({ supportSlot, skillSlot }) => {
        const { data, error } = await supabaseClient
          .from("supports")
          .update({ skill: skillSlot })
          .eq('slot', supportSlot)
          .select()
          .single();
        return { data: !!error };
      },
      invalidatesTags: ["supports"],
    }),
    supportRemove: builder.mutation<boolean, number>({
      queryFn: async (slot: number) => {
        const { error } = await supabaseClient
          .from("supports")
          .delete()
          .eq('slot', slot)
          .select()
        return { data: !!error };
      },
      invalidatesTags: ["supports"],
    })
  }),
  overrideExisting: false,
})

export const { useSupportsGetQuery, useCurrentSupportsGetQuery, useSupportSetMutation, useSupportSkillSetMutation, useSupportRemoveMutation } = extendedApi