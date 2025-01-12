import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import { Box, Stack, Typography } from "@mui/material";

import itemsJson from "data/items.json";
import { Item } from "types/item";
import ItemStack from "../depot/ItemStack";

import ItemInfoSection from "./ItemInfoSection";

interface Props {
  item: Item;
  ingredientToCraftedItemsMapping: { [ingredientId: string]: string[] };
}

const NeededToCraft: React.FC<Props> = (props) => {
  const { item, ingredientToCraftedItemsMapping } = props;
  const craftedItemIds = ingredientToCraftedItemsMapping[item.id];

  if (craftedItemIds == null || craftedItemIds.length === 0) {
    return null;
  }

  return (
    <ItemInfoSection heading="Needed to craft">
      <Stack spacing={1} direction="row" justifyContent="space-evenly" flexWrap="wrap">
        {craftedItemIds.map((craftedItemId) => {
          const craftedItem: Item =
            itemsJson[craftedItemId as keyof typeof itemsJson];
          const { quantity } = craftedItem.ingredients!.find(
            (ingr) => ingr.id === item.id
          )!;
          return (
            <Stack
              key={craftedItemId}
              alignItems="center"
              justifyContent="space-evenly"
            >
              <Box display="flex" alignItems="center">
                <ItemStack
                  itemId={item.id}
                  quantity={quantity}
                  size={60}
                  sx={{
                    color: (theme) => theme.palette.text.primary,
                  }}
                />
                <DoubleArrowIcon
                  sx={{
                    ml: -1.5,
                    mr: -2,
                    fontSize: "3rem",
                    color: "rgba(255, 255, 255, 0.8)",
                    stroke: "black",
                    strokeWidth: "0.2px",
                    zIndex: 1,
                  }}
                />
                <ItemStack
                  itemId={craftedItemId}
                  quantity={item.yield ?? 1}
                  size={60}
                  sx={{
                    color: (theme) => theme.palette.text.primary,
                  }}
                />
              </Box>
              <Typography variant="body2">{craftedItem.name}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </ItemInfoSection>
  );
};
export default NeededToCraft;
