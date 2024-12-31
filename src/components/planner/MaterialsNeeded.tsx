import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import React, { useCallback, useState } from "react";

import itemsJson from "data/items.json";
import { Ingredient, Item } from "types/item";

import ItemInfoPopover from "./ItemInfoPopover";
import ItemNeeded from "./ItemNeeded";
import getGoalIngredients from "util/getGoalIngredients";
import DepotItem from "types/depotItem";
import GoalData, { getPlannerGoals } from "types/goalData";
import ExportImportDialog from "./ExportImportDialog";
import Board from "components/base/Board";
import useSettings from "util/hooks/useSettings";

const LMD_ITEM_ID = "4001";

export const BATTLE_RECORD_TO_EXP = {
  "2001": 200,
  "2002": 400,
  "2003": 1000,
  "2004": 2000,
};

interface Props {
  goals: GoalData[];
  depot: Record<string, DepotItem>;
  putDepot: (depotItem: DepotItem[]) => void;
}

const MaterialsNeeded = React.memo((props: Props) => {
  const { goals, depot, putDepot } = props;

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverItemId, setPopoverItemId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [settings, setSettings] = useSettings();

  const isSettingsMenuOpen = Boolean(anchorEl);
  const [exportImportOpen, setExportImportOpen] = useState<boolean>(false);

  const handleSettingsButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleSettingsMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleItemClick = useCallback((itemId: string) => {
    setPopoverItemId(itemId);
    setPopoverOpen(true);
  }, []);

  const handlePopoverClose = useCallback(() => {
    setPopoverOpen(false);
  }, []);

  const handleChange = useCallback(
    (itemId: string, newQuantity: number) => {
      const item = depot[itemId];
      if (item) {
        const data: DepotItem = { material_id: itemId, stock: newQuantity };
        putDepot([data]);
      }
    },
    [depot, putDepot]
  );

  const handleIncrement = useCallback(
    (itemId: string) => {
      const item = depot[itemId];
      if (item) {
        const data: DepotItem = {
          material_id: itemId,
          stock: item.stock + 1,
        };
        putDepot([data]);
      } else {
        const data: DepotItem = {
          material_id: itemId,
          stock: 1,
        };
        putDepot([data]);
      }
    },
    [depot, putDepot]
  );

  const handleDecrement = useCallback(
    (itemId: string) => {
      const item = depot[itemId];
      if (item) {
        const data: DepotItem = {
          material_id: itemId,
          stock: Math.max(item.stock - 1, 0),
        };
        putDepot([data]);
      }
    },
    [depot, putDepot]
  );

  //TODO disable crafting button if not enough ingredients to craft
  const handleCraftOne = useCallback(
    (itemId: string) => {
      const updatedDatas: DepotItem[] = [];
      const { ingredients, yield: itemYield } = itemsJson[itemId as keyof typeof itemsJson] as Item;
      if (ingredients != null) {
        ingredients.forEach((ingr) => {
          const ingrData: DepotItem = { ...depot[ingr.id] };
          ingrData.stock = Math.max((depot[ingr.id].stock ?? 0) - ingr.quantity, 0);
          updatedDatas.push(ingrData);
        });
      }
      const craftedData: DepotItem = { ...depot[itemId] };
      craftedData.stock = (depot[itemId].stock ?? 0) + (itemYield ?? 1);
      updatedDatas.push(craftedData);

      putDepot(updatedDatas);
    },
    [depot, putDepot]
  );

  const handleCraftingToggle = useCallback(
    (itemId: string) => {
      const depotSettings = { ...settings.depotSettings };
      const crafting = [...depotSettings.crafting];
      const index = settings.depotSettings.crafting.indexOf(itemId);
      if (index !== -1) {
        crafting.splice(index, 1);
      } else {
        crafting.push(itemId);
      }
      depotSettings.crafting = crafting;
      setSettings((s) => ({
        ...s,
        depotSettings,
      }));
    },
    [settings, setSettings]
  );

  const handleResetCrafting = useCallback(() => {
    const depotSettings = { ...settings.depotSettings };
    depotSettings.crafting = [];

    setSettings((s) => ({ ...s, depotSettings }));
  }, [settings, setSettings]);

  const handleSortToBottom = useCallback(() => {
    const depotSettings = { ...settings.depotSettings };
    depotSettings.sortCompletedToBottom = !depotSettings.sortCompletedToBottom;

    setSettings((s) => ({ ...s, depotSettings }));
    setAnchorEl(null);
  }, [settings, setSettings]);

  const handleShowInactive = useCallback(() => {
    const depotSettings = { ...settings.depotSettings };
    depotSettings.showInactiveMaterials = !depotSettings?.showInactiveMaterials;

    setSettings((s) => ({ ...s, depotSettings }));
    setAnchorEl(null);
  }, [settings, setSettings]);

  const handleShowButtons = useCallback(() => {
    const depotSettings = { ...settings.depotSettings };
    depotSettings.showIncrementDecrementButtons = !depotSettings?.showIncrementDecrementButtons;

    setSettings((s) => ({ ...s, depotSettings }));
    setAnchorEl(null);
  }, [settings, setSettings]);

  const handleResetStock = useCallback(() => {
    const _depot = { ...depot };
    const items = Object.values(_depot) as DepotItem[];
    items.forEach((item) => (item.stock = 0));
    putDepot(items);
    setAnchorEl(null);
  }, [depot, putDepot]);

  const handleExportImport = useCallback(() => {
    setExportImportOpen(true);
    setAnchorEl(null);
  }, []);

  const materialsNeeded: Record<string, number> = {};
  // 1. populate the ingredients required for each goal
  goals
    .flatMap((x) => getPlannerGoals(x))
    .flatMap(getGoalIngredients)
    .forEach((ingredient: Ingredient) => {
      materialsNeeded[ingredient.id] = (materialsNeeded[ingredient.id] ?? 0) + ingredient.quantity;
    });

  // 2. populate number of ingredients required for items being crafted
  const ingredientToCraftedItemsMapping: Record<string, string[]> = {};
  Object.values(itemsJson)
    .sort((a, b) => b.tier - a.tier)
    .forEach((item) => {
      // n.b. NOT equivalent to filtering the array first,
      // because we will be modifying materialsNeeded during execution
      if (materialsNeeded[item.id] != null) {
        const remaining = Math.max(materialsNeeded[item.id] - (depot[item.id]?.stock ?? 0), 0);

        if (remaining > 0 && settings.depotSettings.crafting?.includes(item.id)) {
          const itemBeingCrafted: Item = itemsJson[item.id as keyof typeof itemsJson];
          const { ingredients, yield: itemYield } = itemBeingCrafted;
          if (ingredients != null) {
            const multiplier = Math.ceil(remaining / (itemYield ?? 1));
            ingredients.forEach((ingr) => {
              ingredientToCraftedItemsMapping[ingr.id] = [...(ingredientToCraftedItemsMapping[ingr.id] ?? []), item.id];
              materialsNeeded[ingr.id] = (materialsNeeded[ingr.id] ?? 0) + ingr.quantity * multiplier;
            });
          }
        }
      }
    });

  // 3. calculate what ingredients can be fulfilled by crafting
  const _depot = { ...depot }; // need to hypothetically deduct from stock
  const canCompleteByCrafting: Record<string, boolean> = {};
  Object.keys(depot)
    .filter(
      (craftedItemId) =>
        materialsNeeded[craftedItemId] != null &&
        materialsNeeded[craftedItemId] - (depot[craftedItemId]?.stock ?? 0) > 0
    )
    .sort(
      (itemA, itemB) =>
        itemsJson[itemA as keyof typeof itemsJson].tier - itemsJson[itemB as keyof typeof itemsJson].tier
    )
    .forEach((craftedItemId) => {
      const shortage = materialsNeeded[craftedItemId] - (depot[craftedItemId].stock ?? 0);
      const craftedItem: Item = itemsJson[craftedItemId as keyof typeof itemsJson];
      const ingredients = craftedItem.ingredients?.filter((ingr) => ingr.id !== LMD_ITEM_ID);
      if (ingredients != null) {
        const itemYield = craftedItem.yield ?? 1;
        // numTimesCraftable: max number of times the formula can be executed
        const numTimesCraftable = Math.min(
          ...ingredients.map(
            (ingr) => Math.floor((_depot[ingr.id]?.stock ?? 0) / ingr.quantity) //here
          )
        );
        // numTimesToCraft: how many times we'll actually execute the formula
        const numTimesToCraft = Math.min(numTimesCraftable, Math.ceil(shortage / itemYield));
        // now deduct from crafting supply
        ingredients.forEach((ingr) => {
          const copy = { ..._depot[ingr.id] };
          copy.stock = Math.max(
            //here
            (_depot[ingr.id]?.stock ?? 0) - ingr.quantity * numTimesToCraft //here
          );
          _depot[ingr.id] = copy;
        });
        if (shortage - numTimesToCraft <= 0) {
          canCompleteByCrafting[craftedItemId] = true;
        }
        // even if the crafted item can't be completed, update our hypothetical depot counts
        const copy = { ..._depot[craftedItemId] };
        copy.stock = (_depot[craftedItemId].stock ?? 0) + numTimesToCraft * itemYield; //here //here
        _depot[craftedItemId] = copy;
      }
    });

  Object.keys(ingredientToCraftedItemsMapping).forEach((ingrId) => {
    if ((materialsNeeded[ingrId] ?? 0) - (_depot[ingrId]?.stock ?? 0) <= 0) {
      canCompleteByCrafting[ingrId] = true;
    }
  });

  const allItems: [string, number][] = Object.values(itemsJson).map((item) => [item.id, materialsNeeded[item.id] ?? 0]);

  const sortedMaterialsNeeded = (
    settings.depotSettings.showInactiveMaterials ? allItems : Object.entries(materialsNeeded)
  ).sort(([itemIdA, neededA], [itemIdB, neededB]) => {
    const itemA = itemsJson[itemIdA as keyof typeof itemsJson];
    const itemB = itemsJson[itemIdB as keyof typeof itemsJson];

    if (!itemA) console.log(itemIdA);
    const compareBySortId = itemA.sortId - itemB.sortId;
    if (settings.depotSettings.sortCompletedToBottom) {
      return (
        (neededA && neededA <= depot[itemIdA]?.stock ? 1 : 0) - (neededB && neededB <= depot[itemIdB]?.stock ? 1 : 0) ||
        (canCompleteByCrafting[itemIdA] ? 1 : 0) - (canCompleteByCrafting[itemIdB] ? 1 : 0) ||
        compareBySortId
      );
    }
    return compareBySortId;
  });

  const expOwned = Object.entries(BATTLE_RECORD_TO_EXP).reduce(
    (acc, [id, value]) => acc + (depot[id]?.stock ?? 0) * value,
    0
  );

  return (
    <>
      <Board
        title="Depot"
        TitleAction={
          <IconButton
            id="settings-button"
            onClick={handleSettingsButtonClick}
            sx={{ alignSelf: "start", justifySelf: "end" }}
            aria-label="Settings"
            aria-haspopup="true"
            aria-expanded={isSettingsMenuOpen ? "true" : undefined}
            aria-controls={isSettingsMenuOpen ? "settings-menu" : undefined}
          >
            <SettingsIcon />
          </IconButton>
        }
        sx={{ borderRadius: { xs: "0px 0px 4px 4px", md: "4px" } }}
      >
        <Menu
          id="settings-menu"
          anchorEl={anchorEl}
          open={isSettingsMenuOpen}
          onClose={handleSettingsMenuClose}
          MenuListProps={{
            "aria-labelledby": "settings-button",
          }}
          hideBackdrop={false}
          slotProps={{
            root: {
              slotProps: {
                backdrop: {
                  invisible: false,
                },
              },
            },
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <SettingsMenuItem onClick={handleSortToBottom} checked={settings.depotSettings.sortCompletedToBottom}>
            Sort completed items to bottom
          </SettingsMenuItem>
          <SettingsMenuItem onClick={handleShowInactive} checked={settings.depotSettings.showInactiveMaterials}>
            Show inactive materials
          </SettingsMenuItem>
          <SettingsMenuItem onClick={handleShowButtons} checked={settings.depotSettings.showIncrementDecrementButtons}>
            Show increment/decrement buttons
          </SettingsMenuItem>
          <Divider />
          <MenuItem onClick={handleExportImport}>
            <ListItemText inset>Export/Import</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleResetCrafting}>
            <ListItemText inset sx={{ color: (theme) => theme.palette.error.light }}>
              Reset crafting states
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={handleResetStock}>
            <ListItemText inset sx={{ color: (theme) => theme.palette.error.light }}>
              Reset stock
            </ListItemText>
          </MenuItem>
        </Menu>
        <Box
          component="ul"
          sx={{
            display: "grid",
            mt: 2,
            mb: 0,
            mx: 0,
            p: 0,
            columnGap: { xs: 1, sm: 2 },
            rowGap: 2,
            gridTemplateColumns: {
              xs: "repeat(auto-fill, minmax(96px, 1fr))",
              sm: "repeat(auto-fill, minmax(108px, 1fr))",
            },
          }}
        >
          {sortedMaterialsNeeded.map(([itemId, needed]) => (
            <ItemNeeded
              key={itemId}
              component="li"
              itemId={itemId}
              owned={itemId === "EXP" ? expOwned : depot[itemId]?.stock ?? 0}
              quantity={needed}
              canCompleteByCrafting={canCompleteByCrafting[itemId]}
              isCrafting={settings.depotSettings.crafting.includes(itemId) ?? false}
              onChange={handleChange}
              onCraftOne={handleCraftOne}
              onDecrement={handleDecrement}
              onIncrement={handleIncrement}
              onCraftingToggle={handleCraftingToggle}
              onClick={handleItemClick}
              hideIncrementDecrementButtons={
                (itemId === "4001" || itemId === "EXP" || !settings.depotSettings.showIncrementDecrementButtons) ??
                false
              }
            />
          ))}
        </Box>
        <ItemInfoPopover
          itemId={popoverItemId}
          ingredientToCraftedItemsMapping={ingredientToCraftedItemsMapping}
          open={popoverOpen}
          onClose={handlePopoverClose}
        />
      </Board>
      <ExportImportDialog
        open={exportImportOpen}
        onClose={() => {
          setExportImportOpen(false);
        }}
      />
    </>
  );
});
MaterialsNeeded.displayName = "MaterialsNeeded";
export default MaterialsNeeded;

const SettingsMenuItem: React.FC<
  React.PropsWithChildren<{
    onClick: () => void;
    checked: boolean;
  }>
> = (props) => {
  const { onClick, checked, children } = props;
  return (
    <MenuItem onClick={onClick}>
      {checked ? (
        <>
          <ListItemIcon>
            <CheckIcon />
          </ListItemIcon>
          {children}
        </>
      ) : (
        <ListItemText inset>{children}</ListItemText>
      )}
    </MenuItem>
  );
};
