import React, { useCallback, useState } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import Layout from "components/Layout";
import SearchDialog from "components/data/collate/SearchDialog";
import FilterDialog from "components/data/collate/FilterDialog";
import SortDialog from "components/data/collate/SortDialog";
import useSort from "util/hooks/useSort";
import useFilter from "util/hooks/useFilter";
import useOperators from "util/hooks/useOperators";
import { defaultOperatorObject } from "util/changeOperator";
import Toolbar from "components/data/Toolbar";

const EditOperator = dynamic(() => import("components/data/input/EditOperator"), { ssr: false });
const OperatorSelector = dynamic(() => import("components/data/input/OperatorSelector"), { ssr: false });

const Input: NextPage = () => {
  const [roster, onChange] = useOperators();

  const [opId, setOpId] = useState<string>();
  const [editOpen, setEditOpen] = useState(false);

  const { sorts, setSorts, toggleSort, sortFunction, sortFunctions } = useSort([{ key: "Rarity", desc: true }]);
  const { filters, toggleFilter, clearFilters, filterFunction, setSearch } = useFilter();

  const selectOp = useCallback((id: string) => {
    setOpId(id);
    setEditOpen(true);
  }, []);

  return (
    <Layout tab="/data" page="/input">
      <Box 
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Toolbar>
          <SortDialog sortFns={sortFunctions} sortQueue={sorts} setSortQueue={setSorts} toggleSort={toggleSort} />
          <FilterDialog filter={filters} toggleFilter={toggleFilter} clearFilters={clearFilters} />
          <SearchDialog onChange={setSearch} />
        </Toolbar>
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gridTemplateRows: "min-content",
            justifyContent: "center",
            gap: { xs: 0.5, sm: 1 },
            margin: 0,
            padding: 0,
            "& .unowned": {
              opacity: 0.75,
            },
            "& .hidden": {
              display: "none",
            },
          }}
        >
          <OperatorSelector roster={roster} onClick={selectOp} sort={sortFunction} filter={filterFunction} />
          <EditOperator
            op={opId ? roster[opId] ?? defaultOperatorObject(opId) : undefined}
            open={editOpen}
            onClose={() => setEditOpen(false)}
            onChange={onChange}
          />
        </Box>
      </Box>
    </Layout>
  );
};
export default Input;
