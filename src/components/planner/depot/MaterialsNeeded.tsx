import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import CraftingIcon from "./CraftingIcon";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Button, Tooltip } from "@mui/material";
import React, { useCallback, useState } from "react";

import itemsJson from "data/items.json";
import { Ingredient, Item } from "types/item";

import ItemInfoPopover from "../ItemInfoPopover";
import ItemNeeded from "./ItemNeeded";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";
import DepotItem from "types/depotItem";
import ExportImportDialog from "./ExportImportDialog";
import Board from "components/base/Board";
import canCompleteByCrafting from "util/fns/depot/canCompleteByCrafting";
import { LocalStorageSettings } from "types/localStorageSettings";
import depotToExp from "util/fns/depot/depotToExp";
import { PlannerGoal } from "types/goal";

interface Props {
  goals: PlannerGoal[];
  depot: Record<string, DepotItem>;
  putDepot: (depotItem: DepotItem[]) => void;
  settings: LocalStorageSettings;
  setSettings: (settings: LocalStorageSettings | ((settings: LocalStorageSettings) => LocalStorageSettings)) => void;
}

const EXP = ["2001", "2002", "2003", "2004"];
const MaterialsNeeded = React.memo((props: Props) => {
  const { goals, depot, putDepot, settings, setSettings } = props;

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverItemId, setPopoverItemId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isSettingsMenuOpen = Boolean(anchorEl);
  const [exportImportOpen, setExportImportOpen] = useState<boolean>(false);

  const craftToggleTooltips = ["Toggle only craftable materials ON","Toggle all crafting states ON","Reset all crafting states"];
  const initialCraftToggle = 1;
  const [craftToggle, setCraftToggle] = useState(initialCraftToggle);

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
      const data: DepotItem = { material_id: itemId, stock: newQuantity };
      putDepot([data]);
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

  const canCraftOne = useCallback(
    (itemId: string) => {
      const updatedDatas: DepotItem[] = [];
      let canCraft = true;
      const { ingredients } = itemsJson[itemId as keyof typeof itemsJson] as Item;
      if (!ingredients) return false;

      ingredients.forEach((ingr) => {
        const ingrData: DepotItem = { ...depot[ingr.id] };
        const remaining = (depot[ingr.id]?.stock ?? 0) - ingr.quantity;
        if (remaining < 0) canCraft = false;
        ingrData.stock = remaining;
        updatedDatas.push(ingrData);
      });

      return canCraft;
    },
    [depot]
  );

  const handleCraftOne = useCallback(
    (itemId: string) => {
      const { ingredients, yield: itemYield } = itemsJson[itemId as keyof typeof itemsJson] as Item;
      if (!ingredients) return;
      const updatedDatas: DepotItem[] = [];

      ingredients.forEach((ingr) => {
        const ingrData: DepotItem = { ...depot[ingr.id] };
        ingrData.stock = Math.max((depot[ingr.id]?.stock ?? 0) - ingr.quantity, 0);
        updatedDatas.push(ingrData);
      });
      const craftedData: DepotItem = { ...depot[itemId] };
      craftedData.stock = (depot[itemId]?.stock ?? 0) + (itemYield ?? 1);
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
      //switch to default state from manual imput, or to empty
      setCraftToggle(depotSettings.crafting.length === 0 ? 0 : initialCraftToggle);
    },
    [settings, setSettings]
  );
  
  const handleCraftingToggleAll = useCallback(
    () => {
      const depotSettings = { ...settings.depotSettings };
      const crafting = [...depotSettings.crafting];

      //cycle through crafting states:
      // 0 = reset, 1 = only craftable, 2 = full crafting 
      const nextCraftState = craftToggle < 2 ? craftToggle + 1 : 0;

      //for non reset states filter and add craftable items
      //[crafting]: 2 adds all > 0 (empties) > 1 (adds only craftable) > 2 (adds all) >...
      if (nextCraftState > 0) {
        Object.keys(depot).filter(
          (itemID) => {
            const Item = itemsJson[itemID as keyof typeof itemsJson] as Item;
            return (Boolean(Item.ingredients)
              //non-chips (but include dualchips)
              && !Item.name.includes(" Chip")
              //not already in crafting
              && crafting.indexOf(itemID) === -1
              //state 1 add only craftable (after empty state)
              //or state 2: add missing 
              && (nextCraftState === 1 && (craftableItems[itemID] ?? false)
                ||
                nextCraftState === 2)
            );
          }).forEach((itemID) => crafting.push(itemID));
        depotSettings.crafting = crafting;
      } else {
        depotSettings.crafting = [];
      }
      setCraftToggle(nextCraftState);
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
    setCraftToggle(0);
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
  goals.flatMap(getGoalIngredients).forEach((ingredient: Ingredient) => {
    materialsNeeded[ingredient.id] = (materialsNeeded[ingredient.id] ?? 0) + ingredient.quantity;
  });
  if (materialsNeeded.EXP) {
    EXP.forEach((exp) => {
      materialsNeeded[exp] = 0;
    });
  }

  // 3. calculate what ingredients can be fulfilled by crafting
  const _depot = { ...depot }; // need to hypothetically deduct from stock
  const { craftableItems, ingredientToCraftedItemsMapping } = canCompleteByCrafting(
    materialsNeeded,
    _depot,
    settings.depotSettings.crafting
  );

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
        (craftableItems[itemIdA] ? 1 : 0) - (craftableItems[itemIdB] ? 1 : 0) ||
        compareBySortId
      );
    }
    return compareBySortId;
  });

  const expOwned = depotToExp(depot);

  return (
    <>
      <Board
        title="Depot"
        TitleAction={
          <Box display="flex" gap={2}>
            <Tooltip arrow title={craftToggleTooltips[craftToggle]}>
              <Button
                onClick={handleCraftingToggleAll}
                variant="contained"
                startIcon={
                  craftToggle === 1 ? (
                    <CraftingIcon />
                  ) : craftToggle === 2 ? (
                    <CheckCircleIcon sx={{ width: "30px", height: "30px" }} />
                  ) :  (
                    <RadioButtonUncheckedIcon sx={{ width: "30px", height: "30px" }} />
                  )}
                color="primary">
                Crafting States
              </Button>
            </Tooltip>
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
          </Box>
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
            <ListItemText inset sx={{ color: "error.light" }}>
              Reset crafting states
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={handleResetStock}>
            <ListItemText inset sx={{ color: "error.light" }}>
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
              canCompleteByCrafting={craftableItems[itemId]}
              canCraftOne={canCraftOne(itemId)}
              isCrafting={settings.depotSettings.crafting.includes(itemId) ?? false}
              onChange={handleChange}
              onCraftOne={handleCraftOne}
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
