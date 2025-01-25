import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  InputAdornment,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Search } from "@mui/icons-material";
import React, { useCallback, useState } from "react";
import PlannerGoalAdd from "./PlannerGoalAdd";
import operatorJson from "data/operators";
import GoalGroup from "./GoalGroup";
import Board from "components/base/Board";
import GoalData, { getPlannerGoals, GoalDataInsert } from "types/goalData";
import _ from "lodash";
import {
  changeLevel,
  changeMastery,
  changeModule,
  changePromotion,
  changeSkillLevel,
  clamp,
  defaultOperatorObject,
  MAX_LEVEL_BY_RARITY,
  MODULE_REQ_BY_RARITY,
} from "util/changeOperator";
import GoalReorderDialog from "./GoalReorderDialog";
import DepotItem from "types/depotItem";
import useGoalGroups from "util/hooks/useGoalGroups";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";
import useOperators from "util/hooks/useOperators";
import OperatorGoals from "./OperatorGoals";
import PlannerGoalCard from "./PlannerGoalCard";
import canCompleteByCrafting from "util/fns/depot/canCompleteByCrafting";
import { LocalStorageSettings } from "types/localStorageSettings";
import depotToExp from "util/fns/depot/depotToExp";
import GoalFilterDialog from "./GoalFilterDialog";
import { GoalFilterHook } from "util/hooks/useGoalFilter";
import expToBattleRecords from "util/fns/depot/expToBattleRecords";
import { levelingCost } from "pages/tools/level";
import ChangeGroupDialog from "./ChangeGroupDialog";
import { enqueueSnackbar } from "notistack";
import RenameGroupDialog from "./RenameGroupDialog";

interface Props extends GoalFilterHook {
  goals: GoalData[];
  depot: Record<string, DepotItem>;
  setDepot: (depotItem: DepotItem[]) => void;
  updateGoals: (goalsData: GoalDataInsert[]) => void;
  removeAllGoals: () => void;
  removeAllGoalsFromGroup: (groupName: string) => void;
  removeAllGoalsFromOperator: (opId: string, groupName: string) => void;
  changeLocalGoalGroup: (oldGroupName: string, newGroupName: string) => void;
  settings: LocalStorageSettings;
}

const PlannerGoals = (props: Props) => {
  const {
    goals,
    depot,
    setDepot,
    updateGoals,
    removeAllGoals,
    removeAllGoalsFromGroup,
    removeAllGoalsFromOperator,
    changeLocalGoalGroup,
    settings,
    ...filter
  } = props;
  const { groups, putGroups, removeGroup, renameGroup } = useGoalGroups();
  const [roster, onChange] = useOperators();

  const [reorderOpen, setReorderOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isSettingsMenuOpen = Boolean(anchorEl);

  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const [addGoalOpen, setAddGoalOpen] = useState<boolean>(false);
  const [opId, setOpId] = useState<string>();
  const [group, setGroup] = useState<string>();
  const onGoalEdit = (opId: string, groupName: string) => {
    setOpId(opId);
    setGroup(groupName);
    setAddGoalOpen(true);
  };

  const [moveId, setMoveId] = useState<[string, string]>();
  const onGoalMove = (opId: string, groupName: string) => {
    setMoveId([opId, groupName]);
  };
  const valid = (group_name: string) => {
    if (!moveId || !moveId[0] || !moveId[1]) return false;
    if (!groups.includes(group_name)) return false;
    const goalInTargetPosn = goals.find((x) => x.op_id === moveId[0] && x.group_name === group_name);
    if (goalInTargetPosn) return false;
    return true;
  };
  const moveGoal = (group_name: string) => {
    if (!moveId || !moveId[0] || !moveId[1]) return;
    const goal = goals.find((x) => x.op_id === moveId[0] && x.group_name === moveId[1]);

    if (!valid) {
      enqueueSnackbar("Goal already exists in target group", { variant: "error" });
      return;
    }
    setMoveId(undefined);
    if (goal) {
      const oldGoal: GoalDataInsert = { op_id: moveId[0], group_name: moveId[1], sort_order: goal.sort_order };
      updateGoals([oldGoal, { ...goal, group_name }]);
    }
  };

  const [groupToRename, setGroupToRename] = useState<string>();
  const onGroupRename = (groupName: string) => {
    setGroupToRename(groupName);
  };

  const onPlannerGoalCardGoalDeleted = useCallback(
    (plannerGoal: PlannerGoal) => {
      const opId = plannerGoal.operatorId;
      const opData = operatorJson[opId];

      if (!goals) return;

      const goal = goals.find((x) => x.op_id === opId);
      if (!goal) return;

      const _goal: GoalData = { ...goal };
      const allPlannerGoals = getPlannerGoals(goal, opData);

      switch (plannerGoal.category) {
        case OperatorGoalCategory.Elite:
          if (goal.elite_from != null && goal.elite_to != null) {
            /*
             * if goal is e0 -> e2 and goal removed is e2, then update elite_to to e1
             * otherwise, remove elite goal entirely
             * then, if operator has a level goal, then update level_to to the new max level and make sure elite_from and elite_to are non-null
             *
             * ex: e1 50 -> e2 40, remove e2
             * new goal: e1 50 -> e1 max
             *
             * ex: e0 max -> e2 40, remove e1
             * new goal: none
             *
             * ex: e0 1 -> e2 1, remove e1
             * new goal: e0 1 -> e0 max
             */

            const removedElite = plannerGoal.eliteLevel; // can either be 1 or 2
            const elite_from = _goal.elite_from ?? 0;
            const elite_to = _goal.elite_to ?? 0;
            if (removedElite === 2 && goal.elite_from === 0) {
              _goal.elite_to = 1;
            } else {
              _goal.elite_from = null;
              _goal.elite_to = null;
            }

            // update level goal if it exists
            if (goal.level_from && goal.level_to) {
              const maxFrom = MAX_LEVEL_BY_RARITY[opData.rarity][elite_from];
              const maxTo = MAX_LEVEL_BY_RARITY[opData.rarity][elite_to];
              const level_from = clamp(1, goal.level_from, maxFrom);
              const level_to = clamp(1, goal.level_to, maxTo);

              if (elite_from === elite_to && level_from === level_to) {
                // level goal is redundant and can be removed
                _goal.elite_from = null;
                _goal.elite_to = null;
                _goal.elite_from = null;
                _goal.elite_to = null;
              } else {
                // either elite is differnt or level is; either way, not redundant
                _goal.elite_from = elite_from;
                _goal.elite_to = elite_to;
                _goal.level_from = level_from;
                _goal.level_to = level_to;
              }
            }
          }
          break;
        case OperatorGoalCategory.Level:
          if (goal.level_from != null && goal.level_to != null) {
            /*
             * if goal is the only level component of an elite goal, then remove level goal and leave elite goal intact
             * otherwise, remove elite goal entirely
             * if goal is part of a greater promotion + level goal, then remove anything that requires the level goal, leaving anything prior intact
             *
             * ex: e1 50 -> e2 40, remove e1 50 -> max
             * new goal: e1 -> e2
             *
             * ex: e0 max -> e2 40, remove e1 1 -> max
             * new goal: e0 -> e1
             *
             * ex: e0 1 -> e2 1, remove e1 1 -> max
             * new goal: e0 1 -> e1 1
             */

            // pure level goal
            if (goal.elite_from === goal.elite_to) {
              // this means there are no other level or promotion goals. great, we can remove level / elite entirely
              _goal.elite_from = null;
              _goal.elite_to = null;
              _goal.elite_from = null;
              _goal.elite_to = null;
            } else if (allPlannerGoals.filter((x) => x.category === OperatorGoalCategory.Level).length === 1) {
              /* check for possible pure elite goal
               * this can only be elite A lvl 1 -> elite A + 1 lvl 1
               * or elite A lvl max -> elite A + 1 lvl N
               * or elite 0 lvl max -> elite 2 lvl 1
               * we can do this by checking if getPlannerGoals returns only one level goal
               */
              _goal.level_from = null;
              _goal.level_to = null;
            } else {
              // remaining goal must be complex - a mix of elite and level goals

              // sanity check - elite_from should never be equal to elite_to at this point, but just in case
              if (_goal.elite_to === plannerGoal.eliteLevel) {
                _goal.elite_from = null;
                _goal.elite_to = null;
                _goal.level_from = null;
                _goal.level_to = null;
              } else {
                // cap elite goal at the current elite
                _goal.elite_to = plannerGoal.eliteLevel;
                // we should be able to set the level_to to 1 here because if the previous level was E? max,
                // this case would have been caught by the pure elite goal check
                _goal.level_to = 1;
              }
            }
          }
          break;
        case OperatorGoalCategory.Mastery:
          // fortunately any non-elite/lvl cases should be simpler -
          // just remove anything after the indicated level
          const skillIndex = opData.skillData?.findIndex((x) => x.skillId === plannerGoal.skillId);
          if (skillIndex != null && goal.masteries_from && goal.masteries_to) {
            _goal.masteries_to = [...goal.masteries_to];

            _goal.masteries_to[skillIndex] = Math.max(plannerGoal.masteryLevel - 1, goal.masteries_from[skillIndex]);

            if (_.isEqual(goal.masteries_from, _goal.masteries_to)) {
              _goal.masteries_from = null;
              _goal.masteries_to = null;
            }
          }
          break;
        case OperatorGoalCategory.Module:
          const moduleId = plannerGoal.moduleId;
          if (moduleId != null && goal.modules_from && goal.modules_to) {
            _goal.modules_to = { ...goal.modules_to };
            const removedModuleLevel = plannerGoal.moduleLevel;

            if (removedModuleLevel - 1 <= goal.modules_from[moduleId]) {
              _goal.modules_to[moduleId] = goal.modules_from[moduleId];
            } else {
              _goal.modules_to[moduleId] = removedModuleLevel - 1;
            }

            if (_.isEqual(_goal.modules_to, goal.modules_from)) {
              _goal.modules_from = null;
              _goal.modules_to = null;
            }
          }
          break;
        case OperatorGoalCategory.SkillLevel:
          if (goal.skill_level_from != null && goal.skill_level_to != null) {
            const newSkillLevel = plannerGoal.skillLevel - 1;

            if (newSkillLevel <= goal.skill_level_from) {
              _goal.skill_level_from = null;
              _goal.skill_level_to = null;
            } else {
              _goal.skill_level_to = newSkillLevel;
            }
          }
          break;
      }
      const { group_name, op_id, sort_order, user_id, ...rest } = _goal;
      if (Object.values(rest).every((x) => x == null)) {
        removeAllGoalsFromOperator(op_id, group_name);
      } else {
        updateGoals([_goal]);
      }
    },
    [goals, updateGoals, removeAllGoalsFromOperator]
  );

  const onPlannerGoalCardGoalCompleted = (plannerGoal: PlannerGoal) => {
    const operator = roster[plannerGoal.operatorId] ?? defaultOperatorObject(plannerGoal.operatorId, true);
    const opId = plannerGoal.operatorId;
    const opData = operatorJson[opId];

    // remove goal, remove any prerequisites, update roster, and update depot
    const goal = goals!.find((x) => x.op_id === operator.op_id)!;
    const allPlannerGoals = getPlannerGoals(goal, opData);
    const _goal = { ...goal };
    let op = { ...operator };

    switch (plannerGoal.category) {
      case OperatorGoalCategory.Elite:
        if (goal.elite_from != null && goal.elite_to != null) {
          const finishedElite = plannerGoal.eliteLevel; // can either be 1 or 2

          const elite_from = finishedElite;
          _goal.elite_from = finishedElite;
          const elite_to = _goal.elite_to ?? 0;
          if (_goal.elite_from >= elite_to) {
            _goal.elite_from = null;
            _goal.elite_to = null;
          }

          // update level goal if it exists
          if (goal.level_from && goal.level_to) {
            const maxTo = MAX_LEVEL_BY_RARITY[opData.rarity][elite_to];
            const level_from = 1;
            const level_to = clamp(1, goal.level_to, maxTo);

            if (elite_from === elite_to && level_from === level_to) {
              // level goal is redundant and can be removed
              _goal.elite_from = null;
              _goal.elite_to = null;
              _goal.elite_from = null;
              _goal.elite_to = null;
            } else {
              // either elite is different or level is; either way, not redundant
              _goal.elite_from = elite_from;
              _goal.elite_to = elite_to;
              _goal.level_from = level_from;
              _goal.level_to = level_to;
            }
          }
          if (op.elite < finishedElite) {
            op = changePromotion(op, finishedElite);
          }
        }
        break;
      case OperatorGoalCategory.Level:
        if (goal.level_from != null && goal.level_to != null) {
          /*
           * if goal is the only level component of an elite goal, then remove level goal and leave elite goal intact
           * otherwise, remove elite goal entirely
           * if goal is part of a greater promotion + level goal, then remove anything that the level goal required
           *
           * ex: e1 50 -> e2 40, finish e1 50 -> max
           * new goal: e1 max -> e2 40
           *
           * ex: e0 max -> e2 40, finish e1 1 -> max
           * new goal: e1 max -> e2 40
           *
           * ex: e0 1 -> e2 1, finish e1 1 -> max
           * new goal: e1 -> e2
           */

          _goal.elite_from = plannerGoal.eliteLevel;
          // we should be able to set the level_to to 1 here because if the previous level was E? max,
          // this case would have been caught by the pure elite goal check
          _goal.level_from = plannerGoal.toLevel;

          // pure level goal
          if (_goal.elite_from === _goal.elite_to) {
            // this means there are no other level or promotion goals. great, we can remove level / elite entirely
            _goal.elite_from = null;
            _goal.elite_to = null;
            _goal.level_from = null;
            _goal.level_to = null;
          } else if (allPlannerGoals.filter((x) => x.category === OperatorGoalCategory.Level).length === 1) {
            /* check for possible pure elite goal
             * this can only be elite A lvl 1 -> elite A + 1 lvl 1
             * or elite A lvl max -> elite A + 1 lvl N
             * or elite 0 lvl max -> elite 2 lvl 1
             * we can do this by checking if getPlannerGoals returns only one level goal
             */
            _goal.level_from = null;
            _goal.level_to = null;
          } else if (_goal.elite_to === plannerGoal.eliteLevel) {
            _goal.elite_from = null;
            _goal.elite_to = null;
            _goal.level_from = null;
            _goal.level_to = null;
          }
          if (op.elite < plannerGoal.eliteLevel) {
            op = changePromotion(op, plannerGoal.eliteLevel);
          }
          if (op.level < plannerGoal.toLevel) {
            op = changeLevel(op, plannerGoal.toLevel);
          }
        }
        break;
      case OperatorGoalCategory.Mastery:
        // fortunately any non-elite/lvl cases should be simpler -
        // just remove anything before the indicated level
        const skillIndex = opData.skillData?.findIndex((x) => x.skillId === plannerGoal.skillId);
        if (skillIndex != null && goal.masteries_from && goal.masteries_to) {
          _goal.masteries_from = [...goal.masteries_from];

          _goal.masteries_from[skillIndex] = Math.min(plannerGoal.masteryLevel, goal.masteries_to[skillIndex]);

          if (_.isEqual(goal.masteries_from, _goal.masteries_to)) {
            _goal.masteries_from = null;
            _goal.masteries_to = null;
          }
          if (op.masteries[skillIndex] < plannerGoal.masteryLevel) {
            if (op.elite < 2) op = changePromotion(op, 2);
            if (op.skill_level < 7) {
              op = changeSkillLevel(op, 7);
            }
            op = changeMastery(op, skillIndex, plannerGoal.masteryLevel);
          }
        }
        break;
      case OperatorGoalCategory.Module:
        const moduleId = plannerGoal.moduleId;
        if (moduleId != null && goal.modules_from && goal.modules_to) {
          _goal.modules_from = { ...goal.modules_from };

          _goal.modules_from[moduleId] = Math.min(plannerGoal.moduleLevel, goal.modules_to[moduleId]);

          if (_.isEqual(_goal.modules_to, goal.modules_from)) {
            _goal.modules_from = null;
            _goal.modules_to = null;
          }
          if (op.modules[moduleId] < plannerGoal.moduleLevel) {
            if (op.elite < 2) op = changePromotion(op, 2);
            if (op.level < MODULE_REQ_BY_RARITY[opData.rarity]) {
              op = changeLevel(op, MODULE_REQ_BY_RARITY[opData.rarity]);
            }
            op = changeModule(op, moduleId, plannerGoal.moduleLevel);
          }
        }
        break;
      case OperatorGoalCategory.SkillLevel:
        if (goal.skill_level_from != null && goal.skill_level_to != null) {
          const newSkillLevel = plannerGoal.skillLevel;

          if (newSkillLevel >= goal.skill_level_to!) {
            _goal.skill_level_from = null;
            _goal.skill_level_to = null;
          } else {
            _goal.skill_level_from = newSkillLevel;
          }
          if (op.skill_level < plannerGoal.skillLevel) {
            if (op.elite < 1 && plannerGoal.skillLevel > 4) op = changePromotion(op, 1);
            op = changeSkillLevel(op, plannerGoal.skillLevel);
          }
        }
        break;
    }

    updateGoals([_goal]);
    onChange(op);

    //let depotUpdate: DepotItem[] = [];
    const ingredients = getGoalIngredients(plannerGoal);
    if (ingredients.length > 0) {
      if (plannerGoal.category === OperatorGoalCategory.Level) {
        const { exp, lmd } = levelingCost(
          opData.rarity,
          plannerGoal.eliteLevel,
          plannerGoal.fromLevel,
          plannerGoal.eliteLevel,
          plannerGoal.toLevel
        );
        const { depot: _depot } = expToBattleRecords(exp, depot);
        _depot["4001"].stock -= lmd;
        setDepot(Object.values(_depot));
      } else {
        const {depot: _depot}  = canCompleteByCrafting(
          Object.fromEntries(ingredients.map(({ quantity, id }) => [id, quantity])),
          depot,
          Object.keys(depot)) 
        setDepot(Object.values(_depot));
      }
    }
  };

  const createGoalGroups = () => {
    const groupedGoals = _.groupBy(goals, (goal) => goal.group_name);
    //const groupedGoals = Object.groupBy(goals!, (goal) => goal.group_name);
    return groups!.map((groupName, index) => (
      <GoalGroup
        key={groupName}
        groupName={groupName}
        operatorGoals={groupedGoals[groupName]}
        removeAllGoalsFromGroup={removeAllGoalsFromGroup}
        removeGroup={removeGroup}
        defaultExpanded={index == 0}
        onRename={onGroupRename}
      >
        {groupedGoals[groupName]
          ?.sort((a, b) => a.sort_order - b.sort_order)
          .map((operatorGoal) => {
            const plannerGoals = getPlannerGoals(operatorGoal, {
              ...(roster[operatorGoal.op_id] ?? defaultOperatorObject(operatorGoal.op_id, true)),
              ...operatorJson[operatorGoal.op_id],
            }).filter((g) => filter.filterFunction(g, depot, groupName));
            const substantial = plannerGoals.length > 0;
            const op = roster[operatorGoal.op_id] ?? defaultOperatorObject(operatorGoal.op_id, true);
            return (
              <Collapse in={substantial} key={operatorGoal.op_id}>
                <OperatorGoals
                  key={operatorGoal.op_id}
                  operator={op}
                  operatorGoal={operatorGoal}
                  onGoalEdit={onGoalEdit}
                  onGoalMove={onGoalMove}
                  removeAllGoalsFromOperator={removeAllGoalsFromOperator}
                >
                  {plannerGoals.map((plannerGoal, index) => {
                    const ingredients = getGoalIngredients(plannerGoal);
                    const { craftableItems } = canCompleteByCrafting(
                      Object.fromEntries(ingredients.map(({ quantity, id }) => [id, quantity])),
                      depot,
                      Object.keys(depot)
                    );
                    const completableByCrafting = ingredients.every(
                      ({ id, quantity }) =>
                        (id === "EXP" ? depotToExp(depot) : depot[id]?.stock) >= quantity || craftableItems[id]
                    );
                    const completable = ingredients.every(
                      ({ id, quantity }) => (id === "EXP" ? depotToExp(depot) : depot[id]?.stock) >= quantity
                    );
                    return (
                      <PlannerGoalCard
                        key={index}
                        goal={plannerGoal}
                        onGoalDeleted={onPlannerGoalCardGoalDeleted}
                        onGoalCompleted={onPlannerGoalCardGoalCompleted}
                        completable={completable}
                        completableByCrafting={completableByCrafting}
                      />
                    );
                  })}
                </OperatorGoals>
              </Collapse>
            );
          })}
      </GoalGroup>
    ));
  };

  const handleSettingsMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSettingsButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  return (
    <>
      <Board
        title="Goals"
        TitleAction={
          <Box display="flex" gap={2}>
            <Button onClick={() => setAddGoalOpen(true)} startIcon={<AddIcon />} variant="contained" color="primary">
              New Goal
            </Button>
            <IconButton onClick={handleSettingsButtonClick}>
              <SettingsIcon />
            </IconButton>
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
              <MenuItem
                onClick={() => {
                  setReorderOpen(true);
                  setAnchorEl(null);
                }}
              >
                <ListItemText inset>Reorder groups and goals</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (goals && goals.length > 0) {
                    removeAllGoals();
                  }
                  setAnchorEl(null);
                }}
              >
                <ListItemText inset sx={{ color: (theme) => theme.palette.error.light }}>
                  Clear all
                </ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        }
        sx={{
          borderRadius: { xs: "0px 0px 4px 4px", md: "4px" },
          px: { xs: 1, md: 2 },
        }}
      >
        <Grid
          container
          columnGap={1}
          sx={{
            alignItems: "center",
          }}
        >
          <Grid>
            <IconButton size="large" onClick={() => setFilterOpen(true)}>
              <FilterAltOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Grid>
          <Grid flexGrow="1">
            <TextField
              id="search"
              autoComplete="off"
              label="Search..."
              value={filter.filters.search}
              onChange={(e) => filter.setFilters({ ...filter.filters, search: e.target.value })}
              size="small"
              fullWidth={true}
              slotProps={{
                input: {
                  sx: { pr: 0.5 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="submit"
                        aria-label="search"
                        onClick={(e) => {
                          e.preventDefault();
                          // search(searchText);
                        }}
                      >
                        <Search fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>
        {goals && groups && createGoalGroups()}
      </Board>
      <PlannerGoalAdd
        open={addGoalOpen}
        onClose={() => {
          setAddGoalOpen(false);
          setOpId(undefined);
          setGroup(undefined);
        }}
        roster={roster}
        op_id={opId}
        group={group}
        goals={goals}
        goalGroups={groups}
        putGroup={putGroups}
        updateGoals={updateGoals}
      />
      <GoalReorderDialog
        open={reorderOpen}
        goals={goals}
        groups={groups}
        updateGoals={updateGoals}
        putGroups={putGroups}
        onClose={() => setReorderOpen(false)}
      />
      <ChangeGroupDialog
        open={moveId != null}
        onClose={() => setMoveId(undefined)}
        onSubmit={moveGoal}
        goalGroups={groups}
        valid={valid}
      />
      <RenameGroupDialog
        open={!!groupToRename}
        onClose={() => setGroupToRename(undefined)}
        onSubmit={(newGroupName) => {
          if (groupToRename) {
            renameGroup(groupToRename, newGroupName);
            changeLocalGoalGroup(groupToRename, newGroupName);
          }
        }}
        goalGroups={groups}
      />
      <GoalFilterDialog open={filterOpen} onClose={() => setFilterOpen(false)} {...filter} />
    </>
  );
};
export default PlannerGoals;
