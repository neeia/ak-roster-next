import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import Image from "next/image";
import AddCircleIcon from "@mui/icons-material/AddCircleOutlined";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircleOutlined";
import GoalData, { getGoalString, getPlannerGoals } from "types/goalData";
import PlannerGoalCard from "./PlannerGoalCard";
import React, { memo, useCallback, useState } from "react";
import { PlannerGoal } from "types/goal";
import operatorJson from "data/operators";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Operator } from "types/operators/operator";

interface Props {
  operator: Operator;
  operatorGoal: GoalData;
  onGoalDeleted: (plannerGoal: PlannerGoal) => void;
  onGoalCompleted: (plannerGoal: PlannerGoal, operator: Operator) => void;
  removeAllGoalsFromOperator: (opId: string, groupName: string) => void;
}

export const OperatorGoals = memo((props: Props) => {
  const { operator, operatorGoal, onGoalDeleted, onGoalCompleted, removeAllGoalsFromOperator } = props;

  const [expanded, setExpanded] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const imgUrl = `/img/avatars/${operatorGoal.op_id}.png`;
  const opData = operatorJson[operatorGoal.op_id];

  const handleMoreButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  }, []);

  const handleMoreMenuClose = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(null);
  }, []);

  const handleDeleteGoalsButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleMoreMenuClose(e);
      removeAllGoalsFromOperator(operatorGoal.op_id, operatorGoal.group_name);
    },
    [removeAllGoalsFromOperator, handleMoreMenuClose, operatorGoal]
  );

  const handleCompleteGoalsButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      handleMoreMenuClose(e);
    },
    [handleMoreMenuClose]
  );

  return (
    <Accordion
      onChange={(_, expanded) => setExpanded(expanded)}
      sx={{
        backgroundColor: "background.default",
        mb: 2,
        "&:before": {
          display: "none",
        },
        borderRadius: 1,
      }}
    >
      <AccordionSummary
        sx={{
          "& .MuiAccordionSummary-content": {
            my: 1,
          },
          "& .MuiAccordionSummary-content.Mui-expanded": {
            my: 1.5,
          },
        }}
      >
        <Box
          sx={{
            width: "stretch",
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <Box sx={{ gridArea: "opImage", position: "relative", marginLeft: -4 }}>
            <Box
              sx={{
                borderBottomLeftRadius: "50%",
                borderTopLeftRadius: 8,
                borderBottomRightRadius: 4,
                overflow: "hidden",
              }}
              width={64}
              height={64}
            >
              <Image src={imgUrl} width={64} height={64} alt="" />
            </Box>
            {expanded ? (
              <RemoveCircleIcon
                sx={{
                  position: "absolute",
                  bottom: "-6px",
                  left: "0",
                  borderRadius: "50%",
                  backgroundColor: "background.paper",
                }}
              />
            ) : (
              <AddCircleIcon
                sx={{
                  position: "absolute",
                  bottom: "-6px",
                  left: "0",
                  borderRadius: "50%",
                  backgroundColor: "background.paper",
                }}
              />
            )}
          </Box>
          <Box sx={{ width: "100%" }}>
            <Typography variant="h5">{opData.name}</Typography>
            <Typography sx={{ fontVariant: "small-caps" }}>{getGoalString(operatorGoal, opData)}</Typography>
          </Box>
          <IconButton sx={{ alignSelf: "center" }} onClick={handleMoreButtonClick}>
            <MoreHorizIcon />
          </IconButton>
          <Menu
            onClick={(e) => e.stopPropagation()}
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMoreMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem>
              <Typography onClick={handleCompleteGoalsButtonClick} color="success">
                Complete all goals
              </Typography>
            </MenuItem>
            <MenuItem>
              <Typography onClick={handleDeleteGoalsButtonClick} color="error">
                Delete all goals
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {getPlannerGoals(operatorGoal, { ...operator, ...opData }).map((plannerGoal, index) => (
          <PlannerGoalCard
            key={index}
            goal={plannerGoal}
            onGoalDeleted={onGoalDeleted}
            onGoalCompleted={onGoalCompleted}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
});
OperatorGoals.displayName = "OperatorGoals";
export default OperatorGoals;
