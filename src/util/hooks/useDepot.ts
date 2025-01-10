import { useCallback, useEffect, useRef, useState } from "react";
import supabase from "supabase/supabaseClient";
import DepotItem from "types/depotItem";
import handlePostgrestError from "util/fns/handlePostgrestError";
import itemJson from "data/items.json";
import useLocalStorage from "./useLocalStorage";
import { useAppSelector } from "legacyStore/hooks";
import { selectStock } from "legacyStore/depotSlice";
import { enqueueSnackbar } from "notistack";

function useDepot() {
  const [depot, _setDepot] = useLocalStorage<Record<string, DepotItem>>("v3_depot", {});

  const legacyStore = useAppSelector(selectStock);

  // change operator, push to db
  const putDepot = useCallback(
    async (items: DepotItem[]) => {
      const depotCopy = { ...depot };

      items.forEach((item) => {
        depotCopy[item.material_id] = item;
      });

      _setDepot(depotCopy);

      const { error } = await supabase.from("depot").upsert(items);
      handlePostgrestError(error);
    },
    [depot, _setDepot]
  );

  // fetch data from db
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      let isCanceled = false;
      const user_id = session?.user.id;

      if (!user_id) return;

      //fetch depot
      const { data: _depot } = await supabase.from("depot").select().eq("user_id", user_id);

      const depotResult: Record<string, DepotItem> = {};
      const depotTrash: string[] = [];
      if (_depot?.length) {
        _depot.forEach((x) => {
          if (x.material_id in itemJson) {
            depotResult[x.material_id] = x;
          } else {
            depotTrash.push(x.material_id);
          }
        });
      } else if (Object.keys(legacyStore).length) {
        Object.entries(legacyStore).forEach(([material_id, stock]) => {
          if (material_id in itemJson) {
            depotResult[material_id] = { material_id, stock };
          } else {
            depotTrash.push(material_id);
          }
        });
        const { error } = await supabase.from("depot").upsert(Object.values(depotResult));
        if (error) handlePostgrestError(error);
        else enqueueSnackbar("Finished loading data.", { variant: "success" });
      }

      if (depotTrash.length) await supabase.from("depot").delete().in("material_id", depotTrash);

      if (!isCanceled) _setDepot(depotResult);
      return () => {
        isCanceled = true;
      };
    };

    fetchData();
  }, []);

  return [depot, putDepot] as const;
}

export default useDepot;
